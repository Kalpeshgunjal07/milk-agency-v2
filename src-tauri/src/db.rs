use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use rusqlite::{params, Connection, Error as SqliteError, OptionalExtension};
use serde::{Deserialize, Serialize};

use crate::models::{
    AgencySettings, BackupSettings, CustomerInput, CustomerRecord, DeliveryInput,
    DeliveryItemRecord, DeliveryRecord, DeliveryScheduleInput, DeliveryScheduleRecord, InvoiceInput,
    InvoiceRecord, LedgerEntryInput, LedgerEntryRecord, PaymentInput, PaymentRecord, ProductInput,
    ProductRecord,
};
use crate::secure_key::load_or_create_key;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseStatus {
    pub initialized: bool,
    pub database_path: String,
    pub encryption_enabled: bool,
    pub schema_version: i64,
    pub key_store: String,
    pub last_updated: String,
}

pub struct DatabaseManager {
    #[allow(dead_code)]
    app_data_dir: PathBuf,
    database_path: PathBuf,
    backup_dir: PathBuf,
    key: String,
}

impl DatabaseManager {
    pub fn new(app_data_dir: &Path) -> Result<Self, SqliteError> {
        let database_directory = app_data_dir.join("milk-agency");
        let backup_directory = database_directory.join("backups");
        fs::create_dir_all(&database_directory).map_err(|err| {
            SqliteError::SqliteFailure(
                rusqlite::ffi::Error::new(1),
                Some(format!("Failed to create app data directory: {err}")),
            )
        })?;
        fs::create_dir_all(&backup_directory).map_err(|err| {
            SqliteError::SqliteFailure(
                rusqlite::ffi::Error::new(1),
                Some(format!("Failed to create backup directory: {err}")),
            )
        })?;

        let database_path = database_directory.join("milk_agency.db");
        let key = load_or_create_key(&database_directory)
            .map_err(|err| SqliteError::SqliteFailure(rusqlite::ffi::Error::new(1), Some(err)))?;

        Ok(Self {
            app_data_dir: database_directory,
            database_path,
            backup_dir: backup_directory,
            key,
        })
    }

    fn open_connection(&self) -> Result<Connection, SqliteError> {
        let conn = Connection::open(&self.database_path)?;
        conn.execute("PRAGMA key = ?;", [self.key.as_str()])?;
        conn.execute("PRAGMA foreign_keys = ON;", [])?;
        conn.execute("PRAGMA journal_mode = WAL;", [])?;
        conn.execute("PRAGMA synchronous = NORMAL;", [])?;
        Ok(conn)
    }

    pub fn backup_database(&self) -> Result<String, SqliteError> {
        if !self.database_path.exists() {
            return Ok(self.database_path.to_string_lossy().to_string());
        }

        let backup_name = format!(
            "milk_agency_backup_{}.db",
            chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string()
        );
        let backup_path = self.backup_dir.join(backup_name);
        let backup_path_str = backup_path.to_string_lossy().to_string();

        let conn = self.open_connection()?;
        // Use SQLite's online VACUUM INTO for consistent, uncorrupted backup under WAL mode
        match conn.execute("VACUUM INTO ?1;", [&backup_path_str]) {
            Ok(_) => {}
            Err(_) => {
                // Fallback to standard copy if vacuum into is not allowed
                fs::copy(&self.database_path, &backup_path).map_err(|err| {
                    SqliteError::SqliteFailure(
                        rusqlite::ffi::Error::new(1),
                        Some(format!("Failed to create database backup: {err}")),
                    )
                })?;
            }
        }

        self.prune_old_backups()?;
        Ok(backup_path_str)
    }

    fn prune_old_backups(&self) -> Result<(), SqliteError> {
        let retention = self
            .get_backup_settings()
            .map(|settings| settings.backup_retention.max(1) as usize)
            .unwrap_or(7);

        if !self.backup_dir.exists() {
            return Ok(());
        }

        let mut files: Vec<PathBuf> = fs::read_dir(&self.backup_dir)
            .map_err(|err| {
                SqliteError::SqliteFailure(
                    rusqlite::ffi::Error::new(1),
                    Some(format!("Failed to read backup directory for pruning: {err}")),
                )
            })?
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.path())
            .filter(|path| path.is_file())
            .collect();

        files.sort();
        files.reverse();

        for path in files.into_iter().skip(retention) {
            let _ = fs::remove_file(&path);
        }

        Ok(())
    }

    pub fn list_backups(&self) -> Result<Vec<String>, SqliteError> {
        let mut backups = Vec::new();

        if !self.backup_dir.exists() {
            return Ok(backups);
        }

        let mut paths: Vec<String> = fs::read_dir(&self.backup_dir)
            .map_err(|err| {
                SqliteError::SqliteFailure(
                    rusqlite::ffi::Error::new(1),
                    Some(format!("Failed to read backup directory: {err}")),
                )
            })?
            .filter_map(|entry| entry.ok())
            .filter_map(|entry| {
                let path = entry.path();
                if path.is_file() {
                    Some(path.to_string_lossy().to_string())
                } else {
                    None
                }
            })
            .collect();

        paths.sort();
        paths.reverse();
        backups = paths;

        Ok(backups)
    }

    pub fn restore_backup(&self, backup_path: &str) -> Result<String, SqliteError> {
        let source = PathBuf::from(backup_path);
        if !source.exists() {
            return Err(SqliteError::SqliteFailure(
                rusqlite::ffi::Error::new(1),
                Some(format!("Backup file not found: {backup_path}")),
            ));
        }

        // Safety copy before restore
        let safety_path = self.backup_dir.join("pre_restore_safety_copy.db");
        if self.database_path.exists() {
            let _ = fs::copy(&self.database_path, &safety_path);
        }

        fs::copy(&source, &self.database_path).map_err(|err| {
            SqliteError::SqliteFailure(
                rusqlite::ffi::Error::new(1),
                Some(format!("Failed to restore database from backup: {err}")),
            )
        })?;

        Ok(self.database_path.to_string_lossy().to_string())
    }

    pub fn delete_backup(&self, backup_path: &str) -> Result<(), SqliteError> {
        let path = PathBuf::from(backup_path);
        if path.exists() {
            fs::remove_file(path).map_err(|err| {
                SqliteError::SqliteFailure(
                    rusqlite::ffi::Error::new(1),
                    Some(format!("Failed to delete backup file: {err}")),
                )
            })?;
        }
        Ok(())
    }

    pub fn initialize(&self) -> Result<DatabaseStatus, SqliteError> {
        let conn = self.open_connection()?;
        let schema_version = self.apply_migrations(&conn)?;
        self.seed_defaults(&conn)?;

        Ok(DatabaseStatus {
            initialized: true,
            database_path: self.database_path.to_string_lossy().to_string(),
            encryption_enabled: true,
            schema_version,
            key_store: crate::secure_key::key_storage_mode(),
            last_updated: current_timestamp(),
        })
    }

    pub fn status(&self) -> Result<DatabaseStatus, SqliteError> {
        let conn = self.open_connection()?;

        let schema_version = conn
            .query_row("PRAGMA user_version;", [], |row| row.get::<_, i64>(0))
            .unwrap_or(0);

        Ok(DatabaseStatus {
            initialized: true,
            database_path: self.database_path.to_string_lossy().to_string(),
            encryption_enabled: true,
            schema_version,
            key_store: crate::secure_key::key_storage_mode(),
            last_updated: current_timestamp(),
        })
    }

    pub fn get_agency_settings(&self) -> Result<Option<AgencySettings>, SqliteError> {
        let conn = self.open_connection()?;

        let row = conn
            .query_row(
                "SELECT id, agency_name, owner_name, mobile, address, logo_path, currency, receipt_brand_line, receipt_phone, receipt_gst, default_receipt_footer, receipt_header_color, created_at, updated_at FROM agency_settings ORDER BY id DESC LIMIT 1;",
                [],
                |row| {
                    Ok(AgencySettings {
                        id: row.get(0)?,
                        agency_name: row.get(1)?,
                        owner_name: row.get(2)?,
                        mobile: row.get(3)?,
                        address: row.get(4)?,
                        logo_path: row.get(5)?,
                        currency: row.get(6)?,
                        receipt_brand_line: row.get(7)?,
                        receipt_phone: row.get(8)?,
                        receipt_gst: row.get(9)?,
                        default_receipt_footer: row.get(10)?,
                        receipt_header_color: row.get(11)?,
                        created_at: row.get(12)?,
                        updated_at: row.get(13)?,
                    })
                },
            )
            .optional()?;

        Ok(row)
    }

    pub fn save_agency_settings(&self, settings: &AgencySettings) -> Result<AgencySettings, SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();
        let header_color = settings.receipt_header_color.clone().unwrap_or_else(|| "#00A8E8".to_string());

        if let Some(existing_id) = settings.id {
            conn.execute(
                "UPDATE agency_settings SET agency_name = ?1, owner_name = ?2, mobile = ?3, address = ?4, logo_path = ?5, currency = ?6, receipt_brand_line = ?7, receipt_phone = ?8, receipt_gst = ?9, default_receipt_footer = ?10, receipt_header_color = ?11, updated_at = ?12 WHERE id = ?13;",
                params![
                    settings.agency_name,
                    settings.owner_name,
                    settings.mobile,
                    settings.address,
                    settings.logo_path,
                    settings.currency,
                    settings.receipt_brand_line,
                    settings.receipt_phone,
                    settings.receipt_gst,
                    settings.default_receipt_footer,
                    header_color,
                    now,
                    existing_id,
                ],
            )?;
        } else {
            conn.execute(
                "INSERT INTO agency_settings (agency_name, owner_name, mobile, address, logo_path, currency, receipt_brand_line, receipt_phone, receipt_gst, default_receipt_footer, receipt_header_color, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13);",
                params![
                    settings.agency_name,
                    settings.owner_name,
                    settings.mobile,
                    settings.address,
                    settings.logo_path,
                    settings.currency,
                    settings.receipt_brand_line,
                    settings.receipt_phone,
                    settings.receipt_gst,
                    settings.default_receipt_footer,
                    header_color,
                    now,
                    now,
                ],
            )?;
        }

        self.get_agency_settings().map(|opt| opt.unwrap_or_else(|| settings.clone()))
    }

    pub fn get_backup_settings(&self) -> Result<BackupSettings, SqliteError> {
        let conn = self.open_connection()?;

        let auto_backup_enabled = conn
            .query_row(
                "SELECT value FROM application_settings WHERE key = 'backup_auto_backup' LIMIT 1;",
                [],
                |row| row.get::<_, String>(0),
            )
            .unwrap_or_else(|_| "true".to_string())
            .parse::<bool>()
            .unwrap_or(true);

        let backup_frequency = conn
            .query_row(
                "SELECT value FROM application_settings WHERE key = 'backup_frequency' LIMIT 1;",
                [],
                |row| row.get::<_, String>(0),
            )
            .unwrap_or_else(|_| "daily".to_string());

        let backup_retention = conn
            .query_row(
                "SELECT value FROM application_settings WHERE key = 'backup_retention' LIMIT 1;",
                [],
                |row| row.get::<_, String>(0),
            )
            .unwrap_or_else(|_| "7".to_string())
            .parse::<i64>()
            .unwrap_or(7);

        let last_configured_at = conn
            .query_row(
                "SELECT value FROM application_settings WHERE key = 'backup_last_configured_at' LIMIT 1;",
                [],
                |row| row.get::<_, String>(0),
            )
            .ok();

        Ok(BackupSettings {
            id: None,
            auto_backup_enabled,
            backup_frequency,
            backup_retention,
            last_configured_at,
        })
    }

    pub fn save_backup_settings(&self, settings: &BackupSettings) -> Result<BackupSettings, SqliteError> {
        let conn = self.open_connection()?;
        let updated_at = current_timestamp();

        conn.execute(
            "INSERT INTO application_settings (key, value) VALUES ('backup_auto_backup', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
            params![settings.auto_backup_enabled.to_string()],
        )?;
        conn.execute(
            "INSERT INTO application_settings (key, value) VALUES ('backup_frequency', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
            params![settings.backup_frequency],
        )?;
        conn.execute(
            "INSERT INTO application_settings (key, value) VALUES ('backup_retention', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
            params![settings.backup_retention.to_string()],
        )?;
        conn.execute(
            "INSERT INTO application_settings (key, value) VALUES ('backup_last_configured_at', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
            params![updated_at],
        )?;

        self.get_backup_settings()
    }

    pub fn list_customers(&self) -> Result<Vec<CustomerRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, customer_code, name, mobile, address, route_area, joining_date, opening_balance, notes, status, deleted_at, created_at, updated_at FROM customers ORDER BY created_at DESC;",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(CustomerRecord {
                id: row.get(0)?,
                customer_code: row.get(1)?,
                name: row.get(2)?,
                mobile: row.get(3)?,
                address: row.get(4)?,
                route_area: row.get(5)?,
                joining_date: row.get(6)?,
                opening_balance: row.get(7)?,
                notes: row.get(8)?,
                status: row.get(9)?,
                deleted_at: row.get(10)?,
                created_at: row.get(11)?,
                updated_at: row.get(12)?,
            })
        })?;

        let mut customers = Vec::new();
        for customer in rows {
            customers.push(customer?);
        }

        Ok(customers)
    }

    pub fn upsert_customer(&self, customer: &CustomerInput) -> Result<CustomerRecord, SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();

        if let Some(id) = customer.id {
            conn.execute(
                "UPDATE customers SET customer_code = COALESCE(?1, customer_code), name = ?2, mobile = ?3, address = ?4, route_area = ?5, joining_date = ?6, opening_balance = ?7, notes = ?8, status = ?9, updated_at = ?10 WHERE id = ?11;",
                params![
                    customer.customer_code,
                    customer.name,
                    customer.mobile,
                    customer.address,
                    customer.route_area,
                    customer.joining_date,
                    customer.opening_balance,
                    customer.notes,
                    customer.status,
                    now,
                    id,
                ],
            )?;

            let customer_code = customer.customer_code.clone().unwrap_or_else(|| format!("CUST-{id}"));
            return Ok(CustomerRecord {
                id: Some(id),
                customer_code,
                name: customer.name.clone(),
                mobile: customer.mobile.clone(),
                address: customer.address.clone(),
                route_area: customer.route_area.clone(),
                joining_date: customer.joining_date.clone(),
                opening_balance: customer.opening_balance,
                notes: customer.notes.clone(),
                status: customer.status.clone(),
                deleted_at: None,
                created_at: None,
                updated_at: Some(now),
            });
        }

        let code = customer.customer_code.clone().unwrap_or_else(|| format!("CUST-{}", chrono::Utc::now().timestamp()));
        conn.execute(
            "INSERT INTO customers (customer_code, name, mobile, address, route_area, joining_date, opening_balance, notes, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11);",
            params![
                code,
                customer.name,
                customer.mobile,
                customer.address,
                customer.route_area,
                customer.joining_date,
                customer.opening_balance,
                customer.notes,
                customer.status,
                now,
                now,
            ],
        )?;

        let id = conn.last_insert_rowid();
        Ok(CustomerRecord {
            id: Some(id),
            customer_code: code,
            name: customer.name.clone(),
            mobile: customer.mobile.clone(),
            address: customer.address.clone(),
            route_area: customer.route_area.clone(),
            joining_date: customer.joining_date.clone(),
            opening_balance: customer.opening_balance,
            notes: customer.notes.clone(),
            status: customer.status.clone(),
            deleted_at: None,
            created_at: Some(now.clone()),
            updated_at: Some(now),
        })
    }

    pub fn move_customer_to_bin(&self, customer_id: i64) -> Result<(), SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();
        conn.execute(
            "UPDATE customers SET deleted_at = ?1 WHERE id = ?2;",
            params![now, customer_id],
        )?;
        Ok(())
    }

    pub fn restore_customer(&self, customer_id: i64) -> Result<(), SqliteError> {
        let conn = self.open_connection()?;
        conn.execute(
            "UPDATE customers SET deleted_at = NULL WHERE id = ?1;",
            params![customer_id],
        )?;
        Ok(())
    }

    pub fn permanent_delete_customer(&self, customer_id: i64) -> Result<(), SqliteError> {
        let mut conn = self.open_connection()?;
        let tx = conn.transaction()?;
        tx.execute("DELETE FROM ledger_entries WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM payments WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM delivery_items WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM deliveries WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM customer_delivery_schedules WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM customer_products WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM invoices WHERE customer_id = ?1;", params![customer_id])?;
        tx.execute("DELETE FROM customers WHERE id = ?1;", params![customer_id])?;
        tx.commit()?;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn delete_customer(&self, customer_id: i64) -> Result<(), SqliteError> {
        self.move_customer_to_bin(customer_id)
    }

    pub fn list_products(&self) -> Result<Vec<ProductRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, product_code, name, category, unit, default_selling_price, cost_price, description, status, deleted_at, created_at, updated_at FROM products ORDER BY created_at DESC;",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(ProductRecord {
                id: row.get(0)?,
                product_code: row.get(1)?,
                name: row.get(2)?,
                category: row.get(3)?,
                unit: row.get(4)?,
                default_selling_price: row.get(5)?,
                cost_price: row.get(6)?,
                description: row.get(7)?,
                status: row.get(8)?,
                deleted_at: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?;

        let mut products = Vec::new();
        for product in rows {
            products.push(product?);
        }

        Ok(products)
    }

    pub fn upsert_product(&self, product: &ProductInput) -> Result<ProductRecord, SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();

        if let Some(id) = product.id {
            conn.execute(
                "UPDATE products SET product_code = COALESCE(?1, product_code), name = ?2, category = ?3, unit = ?4, default_selling_price = ?5, cost_price = ?6, description = ?7, status = ?8, updated_at = ?9 WHERE id = ?10;",
                params![
                    product.product_code,
                    product.name,
                    product.category,
                    product.unit,
                    product.default_selling_price,
                    product.cost_price,
                    product.description,
                    product.status,
                    now,
                    id,
                ],
            )?;

            let product_code = product.product_code.clone().unwrap_or_else(|| format!("PROD-{id}"));
            return Ok(ProductRecord {
                id: Some(id),
                product_code,
                name: product.name.clone(),
                category: product.category.clone(),
                unit: product.unit.clone(),
                default_selling_price: product.default_selling_price,
                cost_price: product.cost_price,
                description: product.description.clone(),
                status: product.status.clone(),
                deleted_at: None,
                created_at: None,
                updated_at: Some(now),
            });
        }

        let code = product.product_code.clone().unwrap_or_else(|| format!("PROD-{}", chrono::Utc::now().timestamp()));
        conn.execute(
            "INSERT INTO products (product_code, name, category, unit, default_selling_price, cost_price, description, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);",
            params![
                code,
                product.name,
                product.category,
                product.unit,
                product.default_selling_price,
                product.cost_price,
                product.description,
                product.status,
                now,
                now,
            ],
        )?;

        let id = conn.last_insert_rowid();
        Ok(ProductRecord {
            id: Some(id),
            product_code: code,
            name: product.name.clone(),
            category: product.category.clone(),
            unit: product.unit.clone(),
            default_selling_price: product.default_selling_price,
            cost_price: product.cost_price,
            description: product.description.clone(),
            status: product.status.clone(),
            deleted_at: None,
            created_at: Some(now.clone()),
            updated_at: Some(now),
        })
    }

    pub fn move_product_to_bin(&self, product_id: i64) -> Result<(), SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();
        conn.execute(
            "UPDATE products SET deleted_at = ?1 WHERE id = ?2;",
            params![now, product_id],
        )?;
        Ok(())
    }

    pub fn restore_product(&self, product_id: i64) -> Result<(), SqliteError> {
        let conn = self.open_connection()?;
        conn.execute(
            "UPDATE products SET deleted_at = NULL WHERE id = ?1;",
            params![product_id],
        )?;
        Ok(())
    }

    pub fn permanent_delete_product(&self, product_id: i64) -> Result<(), SqliteError> {
        let mut conn = self.open_connection()?;
        let tx = conn.transaction()?;
        tx.execute("DELETE FROM customer_delivery_schedules WHERE product_id = ?1;", params![product_id])?;
        tx.execute("DELETE FROM customer_products WHERE product_id = ?1;", params![product_id])?;
        tx.execute("DELETE FROM delivery_items WHERE product_id = ?1;", params![product_id])?;
        tx.execute("DELETE FROM products WHERE id = ?1;", params![product_id])?;
        tx.commit()?;
        Ok(())
    }

    pub fn empty_recycle_bin(&self) -> Result<(), SqliteError> {
        let mut conn = self.open_connection()?;
        let tx = conn.transaction()?;

        // 1. Purge all deleted customers and child rows
        let mut stmt = tx.prepare("SELECT id FROM customers WHERE deleted_at IS NOT NULL;")?;
        let customer_ids: Vec<i64> = stmt
            .query_map([], |r| r.get(0))?
            .filter_map(|r| r.ok())
            .collect();
        drop(stmt);

        for cust_id in customer_ids {
            tx.execute("DELETE FROM ledger_entries WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM payments WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM delivery_items WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM deliveries WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM customer_delivery_schedules WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM customer_products WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM invoices WHERE customer_id = ?1;", params![cust_id])?;
            tx.execute("DELETE FROM customers WHERE id = ?1;", params![cust_id])?;
        }

        // 2. Purge all deleted products and child rows
        let mut stmt2 = tx.prepare("SELECT id FROM products WHERE deleted_at IS NOT NULL;")?;
        let product_ids: Vec<i64> = stmt2
            .query_map([], |r| r.get(0))?
            .filter_map(|r| r.ok())
            .collect();
        drop(stmt2);

        for prod_id in product_ids {
            tx.execute("DELETE FROM customer_delivery_schedules WHERE product_id = ?1;", params![prod_id])?;
            tx.execute("DELETE FROM customer_products WHERE product_id = ?1;", params![prod_id])?;
            tx.execute("DELETE FROM delivery_items WHERE product_id = ?1;", params![prod_id])?;
            tx.execute("DELETE FROM products WHERE id = ?1;", params![prod_id])?;
        }

        tx.commit()?;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn delete_product(&self, product_id: i64) -> Result<(), SqliteError> {
        self.move_product_to_bin(product_id)
    }

    pub fn list_delivery_schedules(&self) -> Result<Vec<DeliveryScheduleRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, customer_id, product_id, quantity, delivery_days, custom_price, start_date, end_date, status, created_at, updated_at FROM customer_delivery_schedules ORDER BY start_date DESC;",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(DeliveryScheduleRecord {
                id: row.get(0)?,
                customer_id: row.get(1)?,
                product_id: row.get(2)?,
                quantity: row.get(3)?,
                delivery_days: row.get(4)?,
                custom_price: row.get(5)?,
                start_date: row.get(6)?,
                end_date: row.get(7)?,
                status: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?;

        let mut schedules = Vec::new();
        for schedule in rows {
            schedules.push(schedule?);
        }

        Ok(schedules)
    }

    pub fn upsert_delivery_schedule(&self, schedule: &DeliveryScheduleInput) -> Result<DeliveryScheduleRecord, SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();

        if let Some(id) = schedule.id {
            conn.execute(
                "UPDATE customer_delivery_schedules SET customer_id = ?1, product_id = ?2, quantity = ?3, delivery_days = ?4, custom_price = ?5, start_date = ?6, end_date = ?7, status = ?8, updated_at = ?9 WHERE id = ?10;",
                params![
                    schedule.customer_id,
                    schedule.product_id,
                    schedule.quantity,
                    schedule.delivery_days,
                    schedule.custom_price,
                    schedule.start_date,
                    schedule.end_date,
                    schedule.status,
                    now,
                    id,
                ],
            )?;

            return Ok(DeliveryScheduleRecord {
                id: Some(id),
                customer_id: schedule.customer_id,
                product_id: schedule.product_id,
                quantity: schedule.quantity,
                delivery_days: schedule.delivery_days.clone(),
                custom_price: schedule.custom_price,
                start_date: schedule.start_date.clone(),
                end_date: schedule.end_date.clone(),
                status: schedule.status.clone(),
                created_at: None,
                updated_at: Some(now),
            });
        }

        conn.execute(
            "INSERT INTO customer_delivery_schedules (customer_id, product_id, quantity, delivery_days, custom_price, start_date, end_date, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);",
            params![
                schedule.customer_id,
                schedule.product_id,
                schedule.quantity,
                schedule.delivery_days,
                schedule.custom_price,
                schedule.start_date,
                schedule.end_date,
                schedule.status,
                now,
                now,
            ],
        )?;

        let id = conn.last_insert_rowid();
        Ok(DeliveryScheduleRecord {
            id: Some(id),
            customer_id: schedule.customer_id,
            product_id: schedule.product_id,
            quantity: schedule.quantity,
            delivery_days: schedule.delivery_days.clone(),
            custom_price: schedule.custom_price,
            start_date: schedule.start_date.clone(),
            end_date: schedule.end_date.clone(),
            status: schedule.status.clone(),
            created_at: Some(now.clone()),
            updated_at: Some(now),
        })
    }

    pub fn list_deliveries(&self) -> Result<Vec<DeliveryRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, customer_id, product_id, delivery_date, session_key, status, total_quantity, total_amount, notes, created_at, updated_at FROM deliveries ORDER BY delivery_date DESC, created_at DESC;",
        )?;

        let rows = stmt.query_map([], |row| {
            let delivery_id: i64 = row.get(0)?;
            Ok((
                delivery_id,
                DeliveryRecord {
                    id: Some(delivery_id),
                    customer_id: row.get(1)?,
                    product_id: row.get(2)?,
                    delivery_date: row.get(3)?,
                    session_key: row.get(4)?,
                    status: row.get(5)?,
                    total_quantity: row.get(6)?,
                    total_amount: row.get(7)?,
                    notes: row.get(8)?,
                    items: None,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                },
            ))
        })?;

        let mut deliveries = Vec::new();
        for item in rows {
            let (delivery_id, mut delivery) = item?;
            // Fetch items
            let mut item_stmt = conn.prepare(
                "SELECT id, delivery_id, customer_id, product_id, product_name_snapshot, unit_snapshot, quantity, unit_price, line_amount, created_at FROM delivery_items WHERE delivery_id = ?1;",
            )?;
            let item_rows = item_stmt.query_map([delivery_id], |irow| {
                Ok(DeliveryItemRecord {
                    id: irow.get(0)?,
                    delivery_id: irow.get(1)?,
                    customer_id: irow.get(2)?,
                    product_id: irow.get(3)?,
                    product_name_snapshot: irow.get(4)?,
                    unit_snapshot: irow.get(5)?,
                    quantity: irow.get(6)?,
                    unit_price: irow.get(7)?,
                    line_amount: irow.get(8)?,
                    created_at: irow.get(9)?,
                })
            })?;
            let mut items = Vec::new();
            for it in item_rows {
                items.push(it?);
            }
            delivery.items = Some(items);
            deliveries.push(delivery);
        }

        Ok(deliveries)
    }

    pub fn upsert_delivery(&self, delivery: &DeliveryInput) -> Result<DeliveryRecord, SqliteError> {
        let mut conn = self.open_connection()?;
        let now = current_timestamp();
        let session_key = delivery.session_key.clone().unwrap_or_else(|| "morning".to_string());

        let tx = conn.transaction()?;

        let delivery_id = if let Some(id) = delivery.id {
            tx.execute(
                "UPDATE deliveries SET customer_id = ?1, product_id = ?2, delivery_date = ?3, session_key = ?4, status = ?5, total_quantity = ?6, total_amount = ?7, notes = ?8, updated_at = ?9 WHERE id = ?10;",
                params![
                    delivery.customer_id,
                    delivery.product_id,
                    delivery.delivery_date,
                    session_key,
                    delivery.status,
                    delivery.total_quantity,
                    delivery.total_amount,
                    delivery.notes,
                    now,
                    id,
                ],
            )?;
            id
        } else {
            let existing_id: Option<i64> = tx
                .query_row(
                    "SELECT id FROM deliveries WHERE customer_id = ?1 AND delivery_date = ?2 AND session_key = ?3 LIMIT 1;",
                    params![delivery.customer_id, delivery.delivery_date, session_key],
                    |row| row.get(0),
                )
                .optional()?;

            if let Some(eid) = existing_id {
                tx.execute(
                    "UPDATE deliveries SET total_quantity = ?1, total_amount = ?2, status = ?3, notes = ?4, updated_at = ?5 WHERE id = ?6;",
                    params![delivery.total_quantity, delivery.total_amount, delivery.status, delivery.notes, now, eid],
                )?;
                eid
            } else {
                tx.execute(
                    "INSERT INTO deliveries (customer_id, product_id, delivery_date, session_key, status, total_quantity, total_amount, notes, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);",
                    params![
                        delivery.customer_id,
                        delivery.product_id,
                        delivery.delivery_date,
                        session_key,
                        delivery.status,
                        delivery.total_quantity,
                        delivery.total_amount,
                        delivery.notes,
                        now,
                        now,
                    ],
                )?;
                tx.last_insert_rowid()
            }
        };

        // Insert items if provided
        if let Some(ref items) = delivery.items {
            tx.execute("DELETE FROM delivery_items WHERE delivery_id = ?1;", [delivery_id])?;
            for item in items {
                tx.execute(
                    "INSERT INTO delivery_items (delivery_id, customer_id, product_id, product_name_snapshot, unit_snapshot, quantity, unit_price, line_amount, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9);",
                    params![
                        delivery_id,
                        delivery.customer_id,
                        item.product_id,
                        item.product_name_snapshot,
                        item.unit_snapshot,
                        item.quantity,
                        item.unit_price,
                        item.line_amount,
                        now,
                    ],
                )?;
            }
        }

        // If confirmed, atomically post or reconcile in ledger
        if delivery.status == "confirmed" && delivery.total_amount > 0 {
            let already_posted: Option<(i64, i64)> = tx
                .query_row(
                    "SELECT id, debit_amount FROM ledger_entries WHERE related_entity_type = 'deliveries' AND related_entity_id = ?1 LIMIT 1;",
                    [delivery_id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()?;

            match already_posted {
                None => {
                    let prev_balance: i64 = tx
                        .query_row(
                            "SELECT running_balance FROM ledger_entries WHERE customer_id = ?1 ORDER BY id DESC LIMIT 1;",
                            [delivery.customer_id],
                            |row| row.get(0),
                        )
                        .unwrap_or_else(|_| {
                            tx.query_row(
                                "SELECT opening_balance FROM customers WHERE id = ?1;",
                                [delivery.customer_id],
                                |row| row.get(0),
                            )
                            .unwrap_or(0)
                        });

                    let new_balance = prev_balance + delivery.total_amount;
                    let desc = format!("Delivery charges for {}", delivery.delivery_date);
                    let ref_code = format!("DEL-{delivery_id}");

                    tx.execute(
                        "INSERT INTO ledger_entries (customer_id, transaction_type, related_entity_type, related_entity_id, description, debit_amount, credit_amount, running_balance, reference, created_at) VALUES (?1, 'delivery', 'deliveries', ?2, ?3, ?4, 0, ?5, ?6, ?7);",
                        params![
                            delivery.customer_id,
                            delivery_id,
                            desc,
                            delivery.total_amount,
                            new_balance,
                            ref_code,
                            now,
                        ],
                    )?;

                    tx.execute(
                        "UPDATE customers SET current_balance = ?1 WHERE id = ?2;",
                        params![new_balance, delivery.customer_id],
                    )?;
                }
                Some((ledger_id, old_debit)) => {
                    let diff = delivery.total_amount - old_debit;
                    if diff != 0 {
                        let desc = format!("Delivery charges for {} (Updated)", delivery.delivery_date);
                        tx.execute(
                            "UPDATE ledger_entries SET debit_amount = ?1, description = ?2 WHERE id = ?3;",
                            params![delivery.total_amount, desc, ledger_id],
                        )?;

                        // Recalculate all running balances for this customer
                        let opening_balance: i64 = tx
                            .query_row(
                                "SELECT opening_balance FROM customers WHERE id = ?1;",
                                [delivery.customer_id],
                                |row| row.get(0),
                            )
                            .unwrap_or(0);

                        let mut stmt = tx.prepare(
                            "SELECT id, debit_amount, credit_amount FROM ledger_entries WHERE customer_id = ?1 ORDER BY id ASC;",
                        )?;
                        let rows: Vec<(i64, i64, i64)> = stmt
                            .query_map([delivery.customer_id], |row| {
                                Ok((row.get(0)?, row.get(1)?, row.get(2)?))
                            })?
                            .filter_map(|r| r.ok())
                            .collect();
                        drop(stmt);

                        let mut current_bal = opening_balance;
                        for (eid, dr, cr) in rows {
                            current_bal = current_bal + dr - cr;
                            tx.execute(
                                "UPDATE ledger_entries SET running_balance = ?1 WHERE id = ?2;",
                                params![current_bal, eid],
                            )?;
                        }
                        tx.execute(
                            "UPDATE customers SET current_balance = ?1 WHERE id = ?2;",
                            params![current_bal, delivery.customer_id],
                        )?;
                    }
                    // If diff == 0: unchanged, strictly NO OP on ledger entries!
                }
            }
        } else if delivery.status == "skipped" || delivery.total_amount == 0 {
            tx.execute(
                "DELETE FROM ledger_entries WHERE related_entity_type = 'deliveries' AND related_entity_id = ?1;",
                [delivery_id],
            )?;

            // Recalculate all running balances for this customer
            let opening_balance: i64 = tx
                .query_row(
                    "SELECT opening_balance FROM customers WHERE id = ?1;",
                    [delivery.customer_id],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            let mut stmt = tx.prepare(
                "SELECT id, debit_amount, credit_amount FROM ledger_entries WHERE customer_id = ?1 ORDER BY id ASC;",
            )?;
            let rows: Vec<(i64, i64, i64)> = stmt
                .query_map([delivery.customer_id], |row| {
                    Ok((row.get(0)?, row.get(1)?, row.get(2)?))
                })?
                .filter_map(|r| r.ok())
                .collect();
            drop(stmt);

            let mut current_bal = opening_balance;
            for (eid, dr, cr) in rows {
                current_bal = current_bal + dr - cr;
                tx.execute(
                    "UPDATE ledger_entries SET running_balance = ?1 WHERE id = ?2;",
                    params![current_bal, eid],
                )?;
            }
            tx.execute(
                "UPDATE customers SET current_balance = ?1 WHERE id = ?2;",
                params![current_bal, delivery.customer_id],
            )?;
        }

        tx.commit()?;

        Ok(DeliveryRecord {
            id: Some(delivery_id),
            customer_id: delivery.customer_id,
            product_id: delivery.product_id,
            delivery_date: delivery.delivery_date.clone(),
            session_key,
            status: delivery.status.clone(),
            total_quantity: delivery.total_quantity,
            total_amount: delivery.total_amount,
            notes: delivery.notes.clone(),
            items: None,
            created_at: Some(now.clone()),
            updated_at: Some(now),
        })
    }

    pub fn batch_upsert_deliveries(&self, deliveries: &[DeliveryInput]) -> Result<Vec<DeliveryRecord>, SqliteError> {
        let mut results = Vec::new();
        for delivery in deliveries {
            results.push(self.upsert_delivery(delivery)?);
        }
        Ok(results)
    }

    pub fn list_payments(&self) -> Result<Vec<PaymentRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, customer_id, payment_date, amount, payment_method, reference_no, notes, status, created_at, updated_at FROM payments ORDER BY payment_date DESC, created_at DESC;",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(PaymentRecord {
                id: row.get(0)?,
                customer_id: row.get(1)?,
                payment_date: row.get(2)?,
                amount: row.get(3)?,
                payment_method: row.get(4)?,
                reference_no: row.get(5)?,
                notes: row.get(6)?,
                status: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })?;

        let mut payments = Vec::new();
        for payment in rows {
            payments.push(payment?);
        }

        Ok(payments)
    }

    pub fn upsert_payment(&self, payment: &PaymentInput) -> Result<PaymentRecord, SqliteError> {
        let mut conn = self.open_connection()?;
        let now = current_timestamp();
        let status = payment.status.clone().unwrap_or_else(|| "posted".to_string());

        let tx = conn.transaction()?;

        let payment_id = if let Some(id) = payment.id {
            tx.execute(
                "UPDATE payments SET customer_id = ?1, payment_date = ?2, amount = ?3, payment_method = ?4, reference_no = ?5, notes = ?6, status = ?7, updated_at = ?8 WHERE id = ?9;",
                params![
                    payment.customer_id,
                    payment.payment_date,
                    payment.amount,
                    payment.payment_method,
                    payment.reference_no,
                    payment.notes,
                    status,
                    now,
                    id,
                ],
            )?;
            id
        } else {
            tx.execute(
                "INSERT INTO payments (customer_id, payment_date, amount, payment_method, reference_no, notes, status, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9);",
                params![
                    payment.customer_id,
                    payment.payment_date,
                    payment.amount,
                    payment.payment_method,
                    payment.reference_no,
                    payment.notes,
                    status,
                    now,
                    now,
                ],
            )?;
            tx.last_insert_rowid()
        };

        // Atomically post or update ledger if posted
        if status == "posted" && payment.amount > 0 {
            let already_posted: i64 = tx
                .query_row(
                    "SELECT COUNT(*) FROM ledger_entries WHERE related_entity_type = 'payments' AND related_entity_id = ?1;",
                    [payment_id],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            let desc = format!(
                "Payment received via {} (Ref: {})",
                payment.payment_method.to_uppercase(),
                payment.reference_no.as_deref().unwrap_or("None")
            );

            if already_posted == 0 {
                let prev_balance: i64 = tx
                    .query_row(
                        "SELECT running_balance FROM ledger_entries WHERE customer_id = ?1 ORDER BY id DESC LIMIT 1;",
                        [payment.customer_id],
                        |row| row.get(0),
                    )
                    .unwrap_or_else(|_| {
                        tx.query_row(
                            "SELECT opening_balance FROM customers WHERE id = ?1;",
                            [payment.customer_id],
                            |row| row.get(0),
                        )
                        .unwrap_or(0)
                    });

                let new_balance = prev_balance - payment.amount;
                let ref_code = format!("PAY-{payment_id}");

                tx.execute(
                    "INSERT INTO ledger_entries (customer_id, transaction_type, related_entity_type, related_entity_id, description, debit_amount, credit_amount, running_balance, reference, created_at) VALUES (?1, 'payment', 'payments', ?2, ?3, 0, ?4, ?5, ?6, ?7);",
                    params![
                        payment.customer_id,
                        payment_id,
                        desc,
                        payment.amount,
                        new_balance,
                        ref_code,
                        now,
                    ],
                )?;
            } else {
                tx.execute(
                    "UPDATE ledger_entries SET credit_amount = ?1, description = ?2 WHERE related_entity_type = 'payments' AND related_entity_id = ?3;",
                    params![payment.amount, desc, payment_id],
                )?;

                // Recalculate all running balances for this customer
                let opening_balance: i64 = tx
                    .query_row(
                        "SELECT opening_balance FROM customers WHERE id = ?1;",
                        [payment.customer_id],
                        |row| row.get(0),
                    )
                    .unwrap_or(0);

                let mut stmt = tx.prepare(
                    "SELECT id, debit_amount, credit_amount FROM ledger_entries WHERE customer_id = ?1 ORDER BY id ASC;",
                )?;
                let rows: Vec<(i64, i64, i64)> = stmt
                    .query_map([payment.customer_id], |row| {
                        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
                    })?
                    .filter_map(|r| r.ok())
                    .collect();
                drop(stmt);

                let mut current_bal = opening_balance;
                for (eid, dr, cr) in rows {
                    current_bal = current_bal + dr - cr;
                    tx.execute(
                        "UPDATE ledger_entries SET running_balance = ?1 WHERE id = ?2;",
                        params![current_bal, eid],
                    )?;
                }
            }
        }

        tx.commit()?;

        Ok(PaymentRecord {
            id: Some(payment_id),
            customer_id: payment.customer_id,
            payment_date: payment.payment_date.clone(),
            amount: payment.amount,
            payment_method: payment.payment_method.clone(),
            reference_no: payment.reference_no.clone(),
            notes: payment.notes.clone(),
            status,
            created_at: Some(now.clone()),
            updated_at: Some(now),
        })
    }

    pub fn list_invoices(&self) -> Result<Vec<InvoiceRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, customer_id, invoice_number, billing_period_start, billing_period_end, opening_balance, total_charges, total_payments, closing_balance, status, generated_at FROM invoices ORDER BY generated_at DESC;",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(InvoiceRecord {
                id: row.get(0)?,
                customer_id: row.get(1)?,
                invoice_number: row.get(2)?,
                billing_period_start: row.get(3)?,
                billing_period_end: row.get(4)?,
                opening_balance: row.get(5)?,
                total_charges: row.get(6)?,
                total_payments: row.get(7)?,
                closing_balance: row.get(8)?,
                status: row.get(9)?,
                generated_at: row.get(10)?,
            })
        })?;

        let mut invoices = Vec::new();
        for invoice in rows {
            invoices.push(invoice?);
        }

        Ok(invoices)
    }

    pub fn upsert_invoice(&self, invoice: &InvoiceInput) -> Result<InvoiceRecord, SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();

        if let Some(id) = invoice.id {
            conn.execute(
                "UPDATE invoices SET customer_id = ?1, invoice_number = ?2, billing_period_start = ?3, billing_period_end = ?4, opening_balance = ?5, total_charges = ?6, total_payments = ?7, closing_balance = ?8, status = ?9 WHERE id = ?10;",
                params![
                    invoice.customer_id,
                    invoice.invoice_number,
                    invoice.billing_period_start,
                    invoice.billing_period_end,
                    invoice.opening_balance,
                    invoice.total_charges,
                    invoice.total_payments,
                    invoice.closing_balance,
                    invoice.status,
                    id,
                ],
            )?;

            return Ok(InvoiceRecord {
                id: Some(id),
                customer_id: invoice.customer_id,
                invoice_number: invoice.invoice_number.clone(),
                billing_period_start: invoice.billing_period_start.clone(),
                billing_period_end: invoice.billing_period_end.clone(),
                opening_balance: invoice.opening_balance,
                total_charges: invoice.total_charges,
                total_payments: invoice.total_payments,
                closing_balance: invoice.closing_balance,
                status: invoice.status.clone(),
                generated_at: Some(now),
            });
        }

        conn.execute(
            "INSERT INTO invoices (customer_id, invoice_number, billing_period_start, billing_period_end, opening_balance, total_charges, total_payments, closing_balance, status, generated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);",
            params![
                invoice.customer_id,
                invoice.invoice_number,
                invoice.billing_period_start,
                invoice.billing_period_end,
                invoice.opening_balance,
                invoice.total_charges,
                invoice.total_payments,
                invoice.closing_balance,
                invoice.status,
                now,
            ],
        )?;

        let id = conn.last_insert_rowid();
        Ok(InvoiceRecord {
            id: Some(id),
            customer_id: invoice.customer_id,
            invoice_number: invoice.invoice_number.clone(),
            billing_period_start: invoice.billing_period_start.clone(),
            billing_period_end: invoice.billing_period_end.clone(),
            opening_balance: invoice.opening_balance,
            total_charges: invoice.total_charges,
            total_payments: invoice.total_payments,
            closing_balance: invoice.closing_balance,
            status: invoice.status.clone(),
            generated_at: Some(now),
        })
    }

    pub fn list_ledger_entries(&self, customer_id: i64) -> Result<Vec<LedgerEntryRecord>, SqliteError> {
        let conn = self.open_connection()?;

        let mut stmt = conn.prepare(
            "SELECT id, customer_id, transaction_type, related_entity_type, related_entity_id, description, debit_amount, credit_amount, running_balance, reference, created_at FROM ledger_entries WHERE customer_id = ?1 ORDER BY id DESC, created_at DESC;",
        )?;

        let rows = stmt.query_map([customer_id], |row| {
            Ok(LedgerEntryRecord {
                id: row.get(0)?,
                customer_id: row.get(1)?,
                transaction_type: row.get(2)?,
                related_entity_type: row.get(3)?,
                related_entity_id: row.get(4)?,
                description: row.get(5)?,
                debit_amount: row.get(6)?,
                credit_amount: row.get(7)?,
                running_balance: row.get(8)?,
                reference: row.get(9)?,
                created_at: row.get(10)?,
            })
        })?;

        let mut entries = Vec::new();
        for entry in rows {
            entries.push(entry?);
        }

        Ok(entries)
    }

    pub fn add_ledger_entry(&self, entry: &LedgerEntryInput) -> Result<LedgerEntryRecord, SqliteError> {
        let conn = self.open_connection()?;
        let now = current_timestamp();

        let normalized_type = entry.transaction_type.trim().to_ascii_lowercase();

        let previous_balance: i64 = conn
            .query_row(
                "SELECT running_balance FROM ledger_entries WHERE customer_id = ?1 ORDER BY id DESC LIMIT 1;",
                [entry.customer_id],
                |row| row.get::<_, i64>(0),
            )
            .unwrap_or_else(|_| {
                conn.query_row(
                    "SELECT opening_balance FROM customers WHERE id = ?1;",
                    [entry.customer_id],
                    |row| row.get::<_, i64>(0),
                )
                .unwrap_or(0)
            });

        let final_balance = previous_balance + entry.debit_amount - entry.credit_amount;

        conn.execute(
            "INSERT INTO ledger_entries (customer_id, transaction_type, related_entity_type, related_entity_id, description, debit_amount, credit_amount, running_balance, reference, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);",
            params![
                entry.customer_id,
                normalized_type,
                entry.related_entity_type,
                entry.related_entity_id,
                entry.description,
                entry.debit_amount,
                entry.credit_amount,
                final_balance,
                entry.reference,
                now,
            ],
        )?;

        let id = conn.last_insert_rowid();
        Ok(LedgerEntryRecord {
            id: Some(id),
            customer_id: entry.customer_id,
            transaction_type: normalized_type,
            related_entity_type: entry.related_entity_type.clone(),
            related_entity_id: entry.related_entity_id,
            description: entry.description.clone(),
            debit_amount: entry.debit_amount,
            credit_amount: entry.credit_amount,
            running_balance: final_balance,
            reference: entry.reference.clone(),
            created_at: Some(now),
        })
    }

    fn apply_migrations(&self, conn: &Connection) -> Result<i64, SqliteError> {
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );

            CREATE TABLE IF NOT EXISTS application_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );

            CREATE TABLE IF NOT EXISTS agency_settings (
                id INTEGER PRIMARY KEY,
                agency_name TEXT,
                owner_name TEXT,
                mobile TEXT,
                address TEXT,
                logo_path TEXT,
                currency TEXT DEFAULT 'INR',
                receipt_brand_line TEXT,
                receipt_phone TEXT,
                receipt_gst TEXT,
                default_receipt_footer TEXT,
                receipt_header_color TEXT DEFAULT '#00A8E8',
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );

            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                mobile TEXT,
                address TEXT,
                route_area TEXT,
                joining_date TEXT NOT NULL,
                opening_balance INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                deleted_at TEXT,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                unit TEXT NOT NULL,
                default_selling_price INTEGER NOT NULL,
                cost_price INTEGER,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                deleted_at TEXT,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );

            CREATE TABLE IF NOT EXISTS customer_products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                custom_price INTEGER,
                effective_from TEXT NOT NULL,
                effective_to TEXT,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(customer_id) REFERENCES customers(id),
                FOREIGN KEY(product_id) REFERENCES products(id),
                UNIQUE(customer_id, product_id, effective_from)
            );

            CREATE TABLE IF NOT EXISTS customer_delivery_schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                delivery_days TEXT NOT NULL,
                custom_price INTEGER,
                start_date TEXT NOT NULL,
                end_date TEXT,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(customer_id) REFERENCES customers(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            );

            CREATE TABLE IF NOT EXISTS deliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL DEFAULT 0,
                delivery_date TEXT NOT NULL,
                session_key TEXT NOT NULL DEFAULT 'morning',
                status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'skipped', 'cancelled')),
                total_quantity REAL NOT NULL DEFAULT 0,
                total_amount INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(customer_id) REFERENCES customers(id),
                UNIQUE(customer_id, delivery_date, session_key)
            );

            CREATE TABLE IF NOT EXISTS delivery_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                delivery_id INTEGER NOT NULL,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name_snapshot TEXT NOT NULL,
                unit_snapshot TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit_price INTEGER NOT NULL,
                line_amount INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
                FOREIGN KEY(customer_id) REFERENCES customers(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            );

            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                payment_date TEXT NOT NULL,
                amount INTEGER NOT NULL,
                payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'other')),
                reference_no TEXT,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'reversed', 'adjusted')),
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );

            CREATE TABLE IF NOT EXISTS ledger_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                transaction_type TEXT NOT NULL,
                related_entity_type TEXT,
                related_entity_id INTEGER,
                description TEXT NOT NULL,
                debit_amount INTEGER NOT NULL DEFAULT 0,
                credit_amount INTEGER NOT NULL DEFAULT 0,
                running_balance INTEGER NOT NULL DEFAULT 0,
                reference TEXT,
                reversal_of INTEGER,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(customer_id) REFERENCES customers(id),
                FOREIGN KEY(reversal_of) REFERENCES ledger_entries(id)
            );

            CREATE TABLE IF NOT EXISTS adjustments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                adjustment_type TEXT NOT NULL,
                amount INTEGER NOT NULL,
                reason TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                approved_by TEXT,
                related_reference TEXT,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );

            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                invoice_number TEXT NOT NULL UNIQUE,
                billing_period_start TEXT NOT NULL,
                billing_period_end TEXT NOT NULL,
                opening_balance INTEGER NOT NULL DEFAULT 0,
                total_charges INTEGER NOT NULL DEFAULT 0,
                total_payments INTEGER NOT NULL DEFAULT 0,
                closing_balance INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid', 'cancelled')),
                generated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );

            CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
            CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
            CREATE INDEX IF NOT EXISTS idx_deliveries_customer_date ON deliveries(customer_id, delivery_date);
            CREATE INDEX IF NOT EXISTS idx_payments_customer_date ON payments(customer_id, payment_date);
            CREATE INDEX IF NOT EXISTS idx_ledger_customer_date ON ledger_entries(customer_id, created_at);
            "#,
        )?;

        // Ensure receipt_header_color column exists in agency_settings
        let has_receipt_color = conn
            .prepare("PRAGMA table_info(agency_settings);")?
            .query_map([], |row| row.get::<_, String>(1))?
            .any(|col| col.is_ok_and(|c| c == "receipt_header_color"));

        if !has_receipt_color {
            let _ = conn.execute("ALTER TABLE agency_settings ADD COLUMN receipt_header_color TEXT DEFAULT '#00A8E8';", []);
        }

        // Ensure route_area column exists in customers
        let has_route_area = conn
            .prepare("PRAGMA table_info(customers);")?
            .query_map([], |row| row.get::<_, String>(1))?
            .any(|col| col.is_ok_and(|c| c == "route_area"));

        if !has_route_area {
            let _ = conn.execute("ALTER TABLE customers ADD COLUMN route_area TEXT;", []);
        }

        // Ensure deleted_at column exists in customers
        let has_cust_deleted = conn
            .prepare("PRAGMA table_info(customers);")?
            .query_map([], |row| row.get::<_, String>(1))?
            .any(|col| col.is_ok_and(|c| c == "deleted_at"));

        if !has_cust_deleted {
            let _ = conn.execute("ALTER TABLE customers ADD COLUMN deleted_at TEXT;", []);
        }

        // Ensure deleted_at column exists in products
        let has_prod_deleted = conn
            .prepare("PRAGMA table_info(products);")?
            .query_map([], |row| row.get::<_, String>(1))?
            .any(|col| col.is_ok_and(|c| c == "deleted_at"));

        if !has_prod_deleted {
            let _ = conn.execute("ALTER TABLE products ADD COLUMN deleted_at TEXT;", []);
        }

        let current_version = conn
            .query_row(
                "SELECT COALESCE(MAX(version), 0) FROM schema_migrations;",
                [],
                |row| row.get::<_, i64>(0),
            )
            .unwrap_or(0);

        let target_version = 4;
        if current_version < target_version {
            conn.execute(
                "INSERT INTO schema_migrations (version) VALUES (?1);",
                params![target_version],
            )?;
            conn.pragma_update(None, "user_version", target_version)?;
        }

        Ok(conn
            .query_row("PRAGMA user_version;", [], |row| row.get::<_, i64>(0))
            .unwrap_or(0))
    }

    fn seed_defaults(&self, conn: &Connection) -> Result<(), SqliteError> {
        let seeded = conn.query_row(
            "SELECT COUNT(*) FROM application_settings WHERE key = 'app_initialized';",
            [],
            |row| row.get::<_, i64>(0),
        )?;

        if seeded == 0 {
            conn.execute(
                "INSERT INTO application_settings (key, value) VALUES ('app_initialized', 'true');",
                [],
            )?;
            conn.execute(
                "INSERT INTO application_settings (key, value) VALUES ('database_mode', 'local_sqlite_sqlcipher');",
                [],
            )?;
        }

        Ok(())
    }
}

fn current_timestamp() -> String {
    let now = std::time::SystemTime::now();
    let secs = now.duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
    let datetime = match chrono::DateTime::<chrono::Utc>::from_timestamp(secs as i64, 0) {
        Some(value) => value,
        None => chrono::Utc::now(),
    };
    datetime.format("%Y-%m-%dT%H:%M:%SZ").to_string()
}
