mod commands;
mod db;
mod models;
mod secure_key;

use tauri::{Manager, RunEvent};

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::initialize_database,
            commands::create_database_backup,
            commands::list_database_backups,
            commands::restore_database_from_backup,
            commands::delete_database_backup,
            commands::get_database_status,
            commands::get_agency_settings,
            commands::save_agency_settings,
            commands::get_backup_settings,
            commands::save_backup_settings,
            commands::list_customers,
            commands::upsert_customer,
            commands::delete_customer,
            commands::move_customer_to_bin,
            commands::restore_customer,
            commands::permanent_delete_customer,
            commands::list_products,
            commands::upsert_product,
            commands::delete_product,
            commands::move_product_to_bin,
            commands::restore_product,
            commands::permanent_delete_product,
            commands::empty_recycle_bin,
            commands::list_delivery_schedules,
            commands::upsert_delivery_schedule,
            commands::list_deliveries,
            commands::upsert_delivery,
            commands::batch_upsert_deliveries,
            commands::list_payments,
            commands::upsert_payment,
            commands::list_invoices,
            commands::upsert_invoice,
            commands::list_ledger_entries,
            commands::add_ledger_entry,
            commands::ping,
        ])
        .setup(|app| {
            let _window = app.get_webview_window("main").unwrap();
            if let Some(data_dir) = app.path().app_data_dir().ok() {
                std::fs::create_dir_all(data_dir)?;
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Tauri application")
        .run(|_app_handle, event| {
            if let RunEvent::ExitRequested { .. } = event {
                std::process::exit(0);
            }
        });
}
