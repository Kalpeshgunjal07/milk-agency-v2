import { CustomerStatus, DeliveryStatus, LedgerTransactionType, PaymentMethod, ProductStatus, ScheduleStatus, UnitType } from './enums';

export type { CustomerStatus, DeliveryStatus, LedgerTransactionType, PaymentMethod, ProductStatus, ScheduleStatus, UnitType };

export interface AgencySettings {
  id?: number;
  agency_name: string;
  owner_name: string;
  owner_email?: string;
  security_pin?: string;
  mobile?: string;
  address?: string;
  logo_path?: string;
  currency: string;
  receipt_brand_line?: string;
  receipt_phone?: string;
  receipt_gst?: string;
  default_receipt_footer?: string;
  receipt_header_color?: string; // Customizable bill/slip header color, e.g. '#00A8E8'
  created_at?: string;
  updated_at?: string;
}

export interface AuthSettings {
  email: string;
  pin: string;
  agency_id?: string;
  last_login_at?: string;
}

export interface BackupSettings {
  id?: number;
  auto_backup_enabled: boolean;
  backup_frequency: 'manual' | 'daily' | 'weekly';
  backup_retention: number;
  last_configured_at?: string;
}

export interface CustomerRecord {
  id?: number;
  customer_code: string;
  name: string;
  mobile?: string;
  address?: string;
  route_area?: string;
  joining_date: string;
  opening_balance: number; // in paise
  notes?: string;
  status: CustomerStatus;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerInput {
  id?: number;
  customer_code?: string;
  name: string;
  mobile?: string;
  address?: string;
  route_area?: string;
  joining_date: string;
  opening_balance: number; // in paise
  notes?: string;
  status: CustomerStatus;
}

export interface ProductRecord {
  id?: number;
  product_code: string;
  name: string;
  category: string;
  unit: UnitType;
  default_selling_price: number; // in paise
  cost_price?: number; // in paise
  description?: string;
  status: ProductStatus;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInput {
  id?: number;
  product_code?: string;
  name: string;
  category: string;
  unit: UnitType;
  default_selling_price: number; // in paise
  cost_price?: number; // in paise
  description?: string;
  status: ProductStatus;
}

export interface DeliveryScheduleRecord {
  id?: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  delivery_days: string; // e.g. "mon,tue,wed,thu,fri,sat,sun"
  custom_price?: number; // in paise
  start_date: string;
  end_date?: string;
  status: ScheduleStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryScheduleInput {
  id?: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  delivery_days: string;
  custom_price?: number;
  start_date: string;
  end_date?: string;
  status: ScheduleStatus;
}

export interface DeliveryItemRecord {
  id?: number;
  delivery_id: number;
  customer_id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_snapshot: string;
  quantity: number;
  unit_price: number; // in paise
  line_amount: number; // in paise
  created_at?: string;
}

export interface DeliveryRecord {
  id?: number;
  customer_id: number;
  product_id?: number;
  delivery_date: string;
  session_key: string;
  status: DeliveryStatus;
  total_quantity: number;
  total_amount: number; // in paise
  notes?: string;
  items?: DeliveryItemRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryItemInput {
  id?: number;
  delivery_id?: number;
  customer_id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_snapshot: string;
  quantity: number;
  unit_price: number; // in paise
  line_amount: number; // in paise
}

export interface DeliveryInput {
  id?: number;
  customer_id: number;
  product_id?: number;
  delivery_date: string;
  session_key?: string;
  status: DeliveryStatus;
  total_quantity: number;
  total_amount: number; // in paise
  notes?: string;
  items?: DeliveryItemInput[];
}

export interface PaymentRecord {
  id?: number;
  customer_id: number;
  payment_date: string;
  amount: number; // in paise
  payment_method: PaymentMethod;
  reference_no?: string;
  notes?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentInput {
  id?: number;
  customer_id: number;
  payment_date: string;
  amount: number; // in paise
  payment_method: PaymentMethod;
  reference_no?: string;
  notes?: string;
  status?: string;
}

export interface LedgerEntryRecord {
  id?: number;
  customer_id: number;
  transaction_type: LedgerTransactionType | string;
  related_entity_type?: string;
  related_entity_id?: number;
  description: string;
  debit_amount: number; // in paise
  credit_amount: number; // in paise
  running_balance: number; // in paise
  reference?: string;
  reversal_of?: number;
  created_at?: string;
}

export interface LedgerEntryInput {
  id?: number;
  customer_id: number;
  transaction_type: string;
  related_entity_type?: string;
  related_entity_id?: number;
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  reference?: string;
}

export interface InvoiceRecord {
  id?: number;
  customer_id: number;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  opening_balance: number; // in paise
  total_charges: number; // in paise
  total_payments: number; // in paise
  closing_balance: number; // in paise
  status: string;
  generated_at?: string;
}

export interface InvoiceInput {
  id?: number;
  customer_id: number;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  opening_balance: number;
  total_charges: number;
  total_payments: number;
  closing_balance: number;
  status: string;
}

export interface DatabaseStatus {
  initialized: boolean;
  database_path: string;
  encryption_enabled: boolean;
  schema_version: number;
  key_store: string;
  last_updated: string;
}
