use tauri::{AppHandle, Manager, command};

use crate::db::{DatabaseManager, DatabaseStatus};
use crate::models::{AgencySettings, BackupSettings, CustomerInput, CustomerRecord, DeliveryInput, DeliveryRecord, DeliveryScheduleInput, DeliveryScheduleRecord, InvoiceInput, InvoiceRecord, LedgerEntryInput, LedgerEntryRecord, PaymentInput, PaymentRecord, ProductInput, ProductRecord};

#[command]
pub fn initialize_database(app: AppHandle) -> Result<DatabaseStatus, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .initialize()
        .map_err(|err| format!("Failed to initialize database: {err}"))
}

#[command]
pub fn create_database_backup(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .backup_database()
        .map_err(|err| format!("Failed to create database backup: {err}"))
}

#[command]
pub fn list_database_backups(app: AppHandle) -> Result<Vec<String>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_backups()
        .map_err(|err| format!("Failed to list backups: {err}"))
}

#[command]
pub fn restore_database_from_backup(app: AppHandle, backup_path: String) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .restore_backup(&backup_path)
        .map_err(|err| format!("Failed to restore backup: {err}"))
}

#[command]
pub fn delete_database_backup(app: AppHandle, backup_path: String) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .delete_backup(&backup_path)
        .map_err(|err| format!("Failed to delete backup: {err}"))
}

#[command]
pub fn get_database_status(app: AppHandle) -> Result<DatabaseStatus, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .status()
        .map_err(|err| format!("Failed to load database status: {err}"))
}

#[command]
pub fn get_agency_settings(app: AppHandle) -> Result<Option<AgencySettings>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .get_agency_settings()
        .map_err(|err| format!("Failed to read agency settings: {err}"))
}

#[command]
pub fn save_agency_settings(app: AppHandle, settings: AgencySettings) -> Result<AgencySettings, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .save_agency_settings(&settings)
        .map_err(|err| format!("Failed to save agency settings: {err}"))
}

#[command]
pub fn get_backup_settings(app: AppHandle) -> Result<BackupSettings, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .get_backup_settings()
        .map_err(|err| format!("Failed to read backup settings: {err}"))
}

#[command]
pub fn save_backup_settings(app: AppHandle, settings: BackupSettings) -> Result<BackupSettings, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .save_backup_settings(&settings)
        .map_err(|err| format!("Failed to save backup settings: {err}"))
}

#[command]
pub fn list_customers(app: AppHandle) -> Result<Vec<CustomerRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_customers()
        .map_err(|err| format!("Failed to list customers: {err}"))
}

#[command]
pub fn upsert_customer(app: AppHandle, customer: CustomerInput) -> Result<CustomerRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .upsert_customer(&customer)
        .map_err(|err| format!("Failed to save customer: {err}"))
}

#[command]
pub fn move_customer_to_bin(app: AppHandle, id: i64) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .move_customer_to_bin(id)
        .map_err(|err| format!("Failed to move customer to bin: {err}"))
}

#[command]
pub fn restore_customer(app: AppHandle, id: i64) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .restore_customer(id)
        .map_err(|err| format!("Failed to restore customer: {err}"))
}

#[command]
pub fn permanent_delete_customer(app: AppHandle, id: i64) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .permanent_delete_customer(id)
        .map_err(|err| format!("Failed to permanently delete customer: {err}"))
}

#[command]
pub fn delete_customer(app: AppHandle, id: i64) -> Result<(), String> {
    move_customer_to_bin(app, id)
}

#[command]
pub fn list_products(app: AppHandle) -> Result<Vec<ProductRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_products()
        .map_err(|err| format!("Failed to list products: {err}"))
}

#[command]
pub fn upsert_product(app: AppHandle, product: ProductInput) -> Result<ProductRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .upsert_product(&product)
        .map_err(|err| format!("Failed to save product: {err}"))
}

#[command]
pub fn move_product_to_bin(app: AppHandle, id: i64) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .move_product_to_bin(id)
        .map_err(|err| format!("Failed to move product to bin: {err}"))
}

#[command]
pub fn restore_product(app: AppHandle, id: i64) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .restore_product(id)
        .map_err(|err| format!("Failed to restore product: {err}"))
}

#[command]
pub fn permanent_delete_product(app: AppHandle, id: i64) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .permanent_delete_product(id)
        .map_err(|err| format!("Failed to permanently delete product: {err}"))
}

#[command]
pub fn delete_product(app: AppHandle, id: i64) -> Result<(), String> {
    move_product_to_bin(app, id)
}

#[command]
pub fn empty_recycle_bin(app: AppHandle) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .empty_recycle_bin()
        .map_err(|err| format!("Failed to empty recycle bin: {err}"))
}

#[command]
pub fn list_delivery_schedules(app: AppHandle) -> Result<Vec<DeliveryScheduleRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_delivery_schedules()
        .map_err(|err| format!("Failed to list delivery schedules: {err}"))
}

#[command]
pub fn upsert_delivery_schedule(app: AppHandle, schedule: DeliveryScheduleInput) -> Result<DeliveryScheduleRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .upsert_delivery_schedule(&schedule)
        .map_err(|err| format!("Failed to save delivery schedule: {err}"))
}

#[command]
pub fn list_deliveries(app: AppHandle) -> Result<Vec<DeliveryRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_deliveries()
        .map_err(|err| format!("Failed to list deliveries: {err}"))
}

#[command]
pub fn upsert_delivery(app: AppHandle, delivery: DeliveryInput) -> Result<DeliveryRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .upsert_delivery(&delivery)
        .map_err(|err| format!("Failed to save delivery: {err}"))
}

#[command]
pub fn batch_upsert_deliveries(app: AppHandle, deliveries: Vec<DeliveryInput>) -> Result<Vec<DeliveryRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .batch_upsert_deliveries(&deliveries)
        .map_err(|err| format!("Failed to batch save deliveries: {err}"))
}

#[command]
pub fn list_payments(app: AppHandle) -> Result<Vec<PaymentRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_payments()
        .map_err(|err| format!("Failed to list payments: {err}"))
}

#[command]
pub fn upsert_payment(app: AppHandle, payment: PaymentInput) -> Result<PaymentRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .upsert_payment(&payment)
        .map_err(|err| format!("Failed to save payment: {err}"))
}

#[command]
pub fn list_invoices(app: AppHandle) -> Result<Vec<InvoiceRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_invoices()
        .map_err(|err| format!("Failed to list invoices: {err}"))
}

#[command]
pub fn upsert_invoice(app: AppHandle, invoice: InvoiceInput) -> Result<InvoiceRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .upsert_invoice(&invoice)
        .map_err(|err| format!("Failed to save invoice: {err}"))
}

#[command]
pub fn list_ledger_entries(app: AppHandle, customer_id: i64) -> Result<Vec<LedgerEntryRecord>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .list_ledger_entries(customer_id)
        .map_err(|err| format!("Failed to load ledger: {err}"))
}

#[command]
pub fn add_ledger_entry(app: AppHandle, entry: LedgerEntryInput) -> Result<LedgerEntryRecord, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Unable to resolve app data directory: {err}"))?;

    let manager = DatabaseManager::new(app_data_dir.as_path())
        .map_err(|err| format!("Failed to create database manager: {err}"))?;

    manager
        .add_ledger_entry(&entry)
        .map_err(|err| format!("Failed to add ledger entry: {err}"))
}

#[command]
pub fn ping() -> String {
    "database-ready".to_string()
}
