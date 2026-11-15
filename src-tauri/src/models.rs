use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AgencySettings {
    pub id: Option<i64>,
    pub agency_name: String,
    pub owner_name: String,
    pub mobile: Option<String>,
    pub address: Option<String>,
    pub logo_path: Option<String>,
    pub currency: String,
    pub receipt_brand_line: Option<String>,
    pub receipt_phone: Option<String>,
    pub receipt_gst: Option<String>,
    pub default_receipt_footer: Option<String>,
    pub receipt_header_color: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BackupSettings {
    pub id: Option<i64>,
    pub auto_backup_enabled: bool,
    pub backup_frequency: String,
    pub backup_retention: i64,
    pub last_configured_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct CustomerRecord {
    pub id: Option<i64>,
    pub customer_code: String,
    pub name: String,
    pub mobile: Option<String>,
    pub address: Option<String>,
    pub route_area: Option<String>,
    pub joining_date: String,
    pub opening_balance: i64,
    pub notes: Option<String>,
    pub status: String,
    #[serde(default)]
    pub deleted_at: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerInput {
    pub id: Option<i64>,
    pub customer_code: Option<String>,
    pub name: String,
    pub mobile: Option<String>,
    pub address: Option<String>,
    pub route_area: Option<String>,
    pub joining_date: String,
    pub opening_balance: i64,
    pub notes: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProductRecord {
    pub id: Option<i64>,
    pub product_code: String,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub default_selling_price: i64,
    pub cost_price: Option<i64>,
    pub description: Option<String>,
    pub status: String,
    #[serde(default)]
    pub deleted_at: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductInput {
    pub id: Option<i64>,
    pub product_code: Option<String>,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub default_selling_price: i64,
    pub cost_price: Option<i64>,
    pub description: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeliveryScheduleRecord {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub product_id: i64,
    pub quantity: f64,
    pub delivery_days: String,
    pub custom_price: Option<i64>,
    pub start_date: String,
    pub end_date: Option<String>,
    pub status: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryScheduleInput {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub product_id: i64,
    pub quantity: f64,
    pub delivery_days: String,
    pub custom_price: Option<i64>,
    pub start_date: String,
    pub end_date: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeliveryItemRecord {
    pub id: Option<i64>,
    pub delivery_id: i64,
    pub customer_id: i64,
    pub product_id: i64,
    pub product_name_snapshot: String,
    pub unit_snapshot: String,
    pub quantity: f64,
    pub unit_price: i64,
    pub line_amount: i64,
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryItemInput {
    pub id: Option<i64>,
    pub delivery_id: Option<i64>,
    pub customer_id: i64,
    pub product_id: i64,
    pub product_name_snapshot: String,
    pub unit_snapshot: String,
    pub quantity: f64,
    pub unit_price: i64,
    pub line_amount: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeliveryRecord {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub product_id: i64,
    pub delivery_date: String,
    pub session_key: String,
    pub status: String,
    pub total_quantity: f64,
    pub total_amount: i64,
    pub notes: Option<String>,
    pub items: Option<Vec<DeliveryItemRecord>>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryInput {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub product_id: i64,
    pub delivery_date: String,
    pub session_key: Option<String>,
    pub status: String,
    pub total_quantity: f64,
    pub total_amount: i64,
    pub notes: Option<String>,
    pub items: Option<Vec<DeliveryItemInput>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PaymentRecord {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub payment_date: String,
    pub amount: i64,
    pub payment_method: String,
    pub reference_no: Option<String>,
    pub notes: Option<String>,
    pub status: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentInput {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub payment_date: String,
    pub amount: i64,
    pub payment_method: String,
    pub reference_no: Option<String>,
    pub notes: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LedgerEntryRecord {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub transaction_type: String,
    pub related_entity_type: Option<String>,
    pub related_entity_id: Option<i64>,
    pub description: String,
    pub debit_amount: i64,
    pub credit_amount: i64,
    pub running_balance: i64,
    pub reference: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerEntryInput {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub transaction_type: String,
    pub related_entity_type: Option<String>,
    pub related_entity_id: Option<i64>,
    pub description: String,
    pub debit_amount: i64,
    pub credit_amount: i64,
    pub running_balance: i64,
    pub reference: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct InvoiceRecord {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub invoice_number: String,
    pub billing_period_start: String,
    pub billing_period_end: String,
    pub opening_balance: i64,
    pub total_charges: i64,
    pub total_payments: i64,
    pub closing_balance: i64,
    pub status: String,
    pub generated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceInput {
    pub id: Option<i64>,
    pub customer_id: i64,
    pub invoice_number: String,
    pub billing_period_start: String,
    pub billing_period_end: String,
    pub opening_balance: i64,
    pub total_charges: i64,
    pub total_payments: i64,
    pub closing_balance: i64,
    pub status: String,
}
