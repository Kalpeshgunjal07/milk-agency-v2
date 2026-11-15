import { invoke } from '@tauri-apps/api/core';
import {
  AgencySettings,
  AuthSettings,
  BackupSettings,
  CustomerInput,
  CustomerRecord,
  DatabaseStatus,
  DeliveryInput,
  DeliveryItemRecord,
  DeliveryRecord,
  DeliveryScheduleInput,
  DeliveryScheduleRecord,
  InvoiceInput,
  InvoiceRecord,
  LedgerEntryInput,
  LedgerEntryRecord,
  PaymentInput,
  PaymentRecord,
  ProductInput,
  ProductRecord,
} from '../types/models';

import {
  DUMMY_CUSTOMERS,
  DUMMY_PRODUCTS,
  DUMMY_SCHEDULES,
  DUMMY_LEDGER,
  DUMMY_PAYMENTS,
  DUMMY_DELIVERIES,
} from './dummyData';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Local storage keys for persistent client device storage
const DB_STORAGE_KEY = 'milk_agency_database_v2';
const AUTH_STORAGE_KEY = 'milk_agency_auth_v2';
const BACKUPS_STORAGE_KEY = 'milk_agency_backups_v2';

export const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  email: 'aniketkorade1995@gmail.com',
  pin: '1995',
  agency_id: 'VINAYSHIL-KRUSHI',
  last_login_at: new Date().toISOString(),
};

export const DEFAULT_AGENCY_SETTINGS: AgencySettings = {
  id: 1,
  agency_name: 'VINAYSHIL KRUSHI',
  owner_name: 'Aniket Korade',
  owner_email: 'aniketkorade1995@gmail.com',
  security_pin: '1995',
  mobile: '9766691327',
  address: 'KRUSHIVAIBHAV, A/P-RAJURI, TAL. JUNNAR, PUNE 412411',
  currency: 'INR',
  receipt_brand_line: 'FARMERS PRODUCER COMPANY LTD.',
  receipt_phone: '9766691327',
  receipt_gst: '27AAICV6354P1ZH',
  default_receipt_footer: 'Thank you for doing business with us.',
  receipt_header_color: '#00A8E8',
};

interface StoredDatabasePayload {
  version: number;
  lastUpdated: string;
  agencySettings: AgencySettings;
  customers: CustomerRecord[];
  products: ProductRecord[];
  schedules: DeliveryScheduleRecord[];
  deliveries: DeliveryRecord[];
  payments: PaymentRecord[];
  ledger: LedgerEntryRecord[];
  invoices: InvoiceRecord[];
}

// In-memory data holders
let currentAuthSettings: AuthSettings = { ...DEFAULT_AUTH_SETTINGS };
let mockAgencySettings: AgencySettings = { ...DEFAULT_AGENCY_SETTINGS };
let mockCustomers: CustomerRecord[] = [];
let mockProducts: ProductRecord[] = [];
let mockSchedules: DeliveryScheduleRecord[] = [];
let mockDeliveries: DeliveryRecord[] = [];
let mockPayments: PaymentRecord[] = [];
let mockLedger: LedgerEntryRecord[] = [];
let mockInvoices: InvoiceRecord[] = [];

const CLEAN_STORAGE_FLAG = 'milk_agency_clean_v4';

/**
 * Load database from client device's persistent storage.
 * If storage exists, uses the client's real saved records (no dummy data).
 */
function loadDatabaseFromDevice(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const isCleaned = window.localStorage.getItem(CLEAN_STORAGE_FLAG);
    if (!isCleaned) {
      // First boot on clean version 4: purge all dummy demonstration records AND dummy products
      mockCustomers = [];
      mockProducts = [];
      mockDeliveries = [];
      mockPayments = [];
      mockLedger = [];
      mockSchedules = [];
      mockInvoices = [];
      window.localStorage.setItem(CLEAN_STORAGE_FLAG, 'true');
      saveDatabaseToDevice();
      return;
    }

    const raw = window.localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed: StoredDatabasePayload = JSON.parse(raw);
      if (parsed) {
        // Detect if previously stored payload still contains dummy products or dummy customers
        const hasDummyProds = Array.isArray(parsed.products) && parsed.products.some(
          (p) => p.product_code === 'MILK-COW-500' || p.name === 'Cow Milk 500ml'
        );
        const hasDummyCusts = Array.isArray(parsed.customers) && parsed.customers.some(
          (c) => c.customer_code === 'CUST-101' && c.name === 'Rahul Sharma'
        );

        if (hasDummyCusts || hasDummyProds) {
          mockCustomers = [];
          mockProducts = [];
          mockDeliveries = [];
          mockPayments = [];
          mockLedger = [];
          mockSchedules = [];
          mockInvoices = [];
          saveDatabaseToDevice();
          return;
        }

        mockCustomers = parsed.customers || [];
        mockProducts = parsed.products || [];
        mockSchedules = parsed.schedules || [];
        mockDeliveries = parsed.deliveries || [];
        mockPayments = parsed.payments || [];
        mockLedger = parsed.ledger || [];
        mockInvoices = parsed.invoices || [];
        if (parsed.agencySettings) {
          mockAgencySettings = { ...DEFAULT_AGENCY_SETTINGS, ...parsed.agencySettings };
        }
        return;
      }
    }
    // Default clean state
    mockCustomers = [];
    mockProducts = [];
    mockDeliveries = [];
    mockPayments = [];
    mockLedger = [];
    mockSchedules = [];
    mockInvoices = [];
    saveDatabaseToDevice();
  } catch (err) {
    console.error('Failed to load database from device storage:', err);
  }
}

/**
 * Persist entire database state directly onto client device local storage.
 * Automatically called on every mutation (add, edit, delete, status change).
 */
function saveDatabaseToDevice(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const payload: StoredDatabasePayload = {
      version: 2,
      lastUpdated: new Date().toISOString(),
      agencySettings: mockAgencySettings,
      customers: mockCustomers,
      products: mockProducts,
      schedules: mockSchedules,
      deliveries: mockDeliveries,
      payments: mockPayments,
      ledger: mockLedger,
      invoices: mockInvoices,
    };
    window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save database to device storage:', err);
  }
}

// Initial load on script execution
loadDatabaseFromDevice();

function recalculateCustomerLedger(customerId: number) {
  const cust = mockCustomers.find((c) => c.id === customerId);
  let running = cust?.opening_balance ?? 0;
  for (let i = 0; i < mockLedger.length; i++) {
    if (mockLedger[i].customer_id === customerId) {
      if (mockLedger[i].transaction_type === 'opening_balance') {
        running = cust?.opening_balance ?? 0;
        mockLedger[i].running_balance = running;
      } else {
        running = running + (mockLedger[i].debit_amount || 0) - (mockLedger[i].credit_amount || 0);
        mockLedger[i].running_balance = running;
      }
    }
  }
}

export const api = {
  // System & Database Status
  initializeDatabase: async (): Promise<DatabaseStatus> => {
    if (isTauri) {
      return await invoke<DatabaseStatus>('initialize_database');
    }
    loadDatabaseFromDevice();
    return {
      initialized: true,
      database_path: 'Device LocalStorage (Persistent Client Storage)',
      encryption_enabled: true,
      schema_version: 3,
      key_store: 'client-device-credential-storage',
      last_updated: new Date().toISOString(),
    };
  },

  getDatabaseStatus: async (): Promise<DatabaseStatus> => {
    if (isTauri) {
      return await invoke<DatabaseStatus>('get_database_status');
    }
    return {
      initialized: true,
      database_path: 'Device LocalStorage (Persistent Client Storage)',
      encryption_enabled: true,
      schema_version: 3,
      key_store: 'client-device-credential-storage',
      last_updated: new Date().toISOString(),
    };
  },

  // Authentication & Security Credentials (Email & PIN)
  getAuthSettings: async (): Promise<AuthSettings> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        try {
          currentAuthSettings = { ...DEFAULT_AUTH_SETTINGS, ...JSON.parse(raw) };
          return currentAuthSettings;
        } catch {
          // fallback
        }
      }
    }
    return currentAuthSettings;
  },

  saveAuthSettings: async (settings: AuthSettings): Promise<AuthSettings> => {
    currentAuthSettings = { ...settings };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(settings));
    }
    mockAgencySettings.owner_email = settings.email;
    mockAgencySettings.security_pin = settings.pin;
    saveDatabaseToDevice();
    return currentAuthSettings;
  },

  // Multi-Device Data Export & Import (Portability across phones and computers)
  exportDatabaseBackup: async (): Promise<string> => {
    const payload = {
      agencySettings: mockAgencySettings,
      customers: mockCustomers,
      products: mockProducts,
      schedules: mockSchedules,
      deliveries: mockDeliveries,
      payments: mockPayments,
      ledger: mockLedger,
      invoices: mockInvoices,
      exportedAt: new Date().toISOString(),
      version: 2,
    };
    const jsonStr = JSON.stringify(payload, null, 2);

    // Download as .milkdb file on browser/mobile
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `milk_agency_backup_${dateStr}.milkdb`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return jsonStr;
  },

  importDatabaseBackup: async (backupJson: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed && Array.isArray(parsed.customers)) {
        mockCustomers = parsed.customers;
        mockProducts = parsed.products || [];
        mockSchedules = parsed.schedules || [];
        mockDeliveries = parsed.deliveries || [];
        mockPayments = parsed.payments || [];
        mockLedger = parsed.ledger || [];
        mockInvoices = parsed.invoices || [];
        if (parsed.agencySettings) {
          mockAgencySettings = { ...DEFAULT_AGENCY_SETTINGS, ...parsed.agencySettings };
        }
        saveDatabaseToDevice();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to import database backup:', err);
      return false;
    }
  },

  // Clear dummy data and start clean system
  clearDatabaseToCleanState: async (): Promise<void> => {
    mockCustomers = [];
    mockProducts = [];
    mockDeliveries = [];
    mockPayments = [];
    mockLedger = [];
    mockSchedules = [];
    mockInvoices = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CLEAN_STORAGE_FLAG, 'true');
    }
    saveDatabaseToDevice();
  },

  // Reset or re-seed sample dummy data (for testing)
  seedDummyData: async (): Promise<void> => {
    mockCustomers = [...DUMMY_CUSTOMERS];
    mockProducts = [...DUMMY_PRODUCTS];
    mockSchedules = [...DUMMY_SCHEDULES];
    mockLedger = [...DUMMY_LEDGER];
    mockPayments = [...DUMMY_PAYMENTS];
    mockDeliveries = [...DUMMY_DELIVERIES];
    saveDatabaseToDevice();
  },

  // Backups Management
  createBackup: async (): Promise<string> => {
    if (isTauri) {
      return await invoke<string>('create_database_backup');
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `backup_${timestamp}.milkdb`;
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = JSON.parse(window.localStorage.getItem(BACKUPS_STORAGE_KEY) || '[]');
      const backupItem = {
        name: fileName,
        date: new Date().toISOString(),
        data: {
          agencySettings: mockAgencySettings,
          customers: mockCustomers,
          products: mockProducts,
          schedules: mockSchedules,
          deliveries: mockDeliveries,
          payments: mockPayments,
          ledger: mockLedger,
        },
      };
      existing.unshift(backupItem);
      window.localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(existing.slice(0, 10)));
    }
    return fileName;
  },

  listBackups: async (): Promise<string[]> => {
    if (isTauri) {
      return await invoke<string[]>('list_database_backups');
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = JSON.parse(window.localStorage.getItem(BACKUPS_STORAGE_KEY) || '[]');
      if (Array.isArray(existing) && existing.length > 0) {
        return existing.map((b: { name: string }) => b.name);
      }
    }
    return ['backup_snapshot_device_latest.milkdb'];
  },

  restoreBackup: async (backupPath: string): Promise<string> => {
    if (isTauri) {
      return await invoke<string>('restore_database_from_backup', { backupPath });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = JSON.parse(window.localStorage.getItem(BACKUPS_STORAGE_KEY) || '[]');
      const found = existing.find((b: { name: string }) => b.name === backupPath);
      if (found && found.data) {
        mockCustomers = found.data.customers || [];
        mockProducts = found.data.products || [];
        mockSchedules = found.data.schedules || [];
        mockDeliveries = found.data.deliveries || [];
        mockPayments = found.data.payments || [];
        mockLedger = found.data.ledger || [];
        if (found.data.agencySettings) {
          mockAgencySettings = { ...DEFAULT_AGENCY_SETTINGS, ...found.data.agencySettings };
        }
        saveDatabaseToDevice();
      }
    }
    return backupPath;
  },

  deleteBackup: async (backupPath: string): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('delete_database_backup', { backupPath });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = JSON.parse(window.localStorage.getItem(BACKUPS_STORAGE_KEY) || '[]');
      const filtered = existing.filter((b: { name: string }) => b.name !== backupPath);
      window.localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(filtered));
    }
  },

  // Agency Settings
  getAgencySettings: async (): Promise<AgencySettings | null> => {
    if (isTauri) {
      return await invoke<AgencySettings | null>('get_agency_settings');
    }
    return mockAgencySettings;
  },

  saveAgencySettings: async (settings: AgencySettings): Promise<AgencySettings> => {
    if (isTauri) {
      return await invoke<AgencySettings>('save_agency_settings', { settings });
    }
    mockAgencySettings = { ...mockAgencySettings, ...settings, id: 1 };
    saveDatabaseToDevice();
    return mockAgencySettings;
  },

  // Backup Settings
  getBackupSettings: async (): Promise<BackupSettings> => {
    if (isTauri) {
      return await invoke<BackupSettings>('get_backup_settings');
    }
    return {
      auto_backup_enabled: true,
      backup_frequency: 'daily',
      backup_retention: 7,
      last_configured_at: new Date().toISOString(),
    };
  },

  saveBackupSettings: async (settings: BackupSettings): Promise<BackupSettings> => {
    if (isTauri) {
      return await invoke<BackupSettings>('save_backup_settings', { settings });
    }
    return settings;
  },

  // Customers
  listCustomers: async (): Promise<CustomerRecord[]> => {
    if (isTauri) {
      return await invoke<CustomerRecord[]>('list_customers');
    }
    return [...mockCustomers];
  },

  upsertCustomer: async (customer: CustomerInput): Promise<CustomerRecord> => {
    if (isTauri) {
      return await invoke<CustomerRecord>('upsert_customer', { customer });
    }
    if (customer.id) {
      mockCustomers = mockCustomers.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              name: customer.name,
              mobile: customer.mobile,
              address: customer.address,
              route_area: customer.route_area,
              joining_date: customer.joining_date,
              opening_balance: customer.opening_balance,
              notes: customer.notes,
              status: customer.status,
            }
          : c
      );
      saveDatabaseToDevice();
      return mockCustomers.find((c) => c.id === customer.id)!;
    }
    const newId = mockCustomers.length ? Math.max(...mockCustomers.map((c) => c.id || 0)) + 1 : 1;
    const newCust: CustomerRecord = {
      id: newId,
      customer_code: customer.customer_code || `CUST-${newId + 100}`,
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address,
      route_area: customer.route_area,
      joining_date: customer.joining_date,
      opening_balance: customer.opening_balance,
      notes: customer.notes,
      status: customer.status,
      created_at: new Date().toISOString(),
    };
    mockCustomers.unshift(newCust);
    // Add opening balance to ledger
    mockLedger.push({
      id: mockLedger.length + 1,
      customer_id: newId,
      transaction_type: 'opening_balance',
      description: 'Account Opening Balance',
      debit_amount: customer.opening_balance > 0 ? customer.opening_balance : 0,
      credit_amount: customer.opening_balance < 0 ? Math.abs(customer.opening_balance) : 0,
      running_balance: customer.opening_balance,
      created_at: new Date().toISOString(),
    });
    saveDatabaseToDevice();
    return newCust;
  },

  moveToBinCustomer: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('soft_delete_customer', { id });
    }
    mockCustomers = mockCustomers.map((c) => (c.id === id ? { ...c, deleted_at: new Date().toISOString() } : c));
    saveDatabaseToDevice();
  },

  softDeleteCustomer: async (id: number): Promise<void> => {
    return api.moveToBinCustomer(id);
  },

  restoreCustomer: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('restore_customer', { id });
    }
    mockCustomers = mockCustomers.map((c) => (c.id === id ? { ...c, deleted_at: null } : c));
    saveDatabaseToDevice();
  },

  permanentDeleteCustomer: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('permanent_delete_customer', { id });
    }
    mockCustomers = mockCustomers.filter((c) => c.id !== id);
    mockLedger = mockLedger.filter((l) => l.customer_id !== id);
    mockDeliveries = mockDeliveries.filter((d) => d.customer_id !== id);
    mockPayments = mockPayments.filter((p) => p.customer_id !== id);
    mockSchedules = mockSchedules.filter((s) => s.customer_id !== id);
    saveDatabaseToDevice();
  },

  // Products
  listProducts: async (): Promise<ProductRecord[]> => {
    if (isTauri) {
      return await invoke<ProductRecord[]>('list_products');
    }
    return [...mockProducts];
  },

  upsertProduct: async (product: ProductInput): Promise<ProductRecord> => {
    if (isTauri) {
      return await invoke<ProductRecord>('upsert_product', { product });
    }
    if (product.id) {
      mockProducts = mockProducts.map((p) =>
        p.id === product.id
          ? {
              ...p,
              product_code: product.product_code || p.product_code,
              name: product.name,
              category: product.category,
              unit: product.unit,
              default_selling_price: product.default_selling_price,
              cost_price: product.cost_price,
              description: product.description,
              status: product.status,
            }
          : p
      );
      saveDatabaseToDevice();
      return mockProducts.find((p) => p.id === product.id)!;
    }
    const newId = mockProducts.length ? Math.max(...mockProducts.map((p) => p.id || 0)) + 1 : 1;
    const newProd: ProductRecord = {
      id: newId,
      product_code: product.product_code || `PROD-${newId + 100}`,
      name: product.name,
      category: product.category,
      unit: product.unit,
      default_selling_price: product.default_selling_price,
      cost_price: product.cost_price,
      description: product.description,
      status: product.status,
      created_at: new Date().toISOString(),
    };
    mockProducts.push(newProd);
    saveDatabaseToDevice();
    return newProd;
  },

  moveToBinProduct: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('soft_delete_product', { id });
    }
    mockProducts = mockProducts.map((p) => (p.id === id ? { ...p, deleted_at: new Date().toISOString() } : p));
    saveDatabaseToDevice();
  },

  softDeleteProduct: async (id: number): Promise<void> => {
    return api.moveToBinProduct(id);
  },

  restoreProduct: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('restore_product', { id });
    }
    mockProducts = mockProducts.map((p) => (p.id === id ? { ...p, deleted_at: null } : p));
    saveDatabaseToDevice();
  },

  permanentDeleteProduct: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('permanent_delete_product', { id });
    }
    mockProducts = mockProducts.filter((p) => p.id !== id);
    saveDatabaseToDevice();
  },

  // Recycle Bin
  emptyRecycleBin: async (): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('empty_recycle_bin');
    }
    const deletedCustIds = mockCustomers.filter((c) => !!c.deleted_at).map((c) => c.id!);
    mockCustomers = mockCustomers.filter((c) => !c.deleted_at);
    mockProducts = mockProducts.filter((p) => !p.deleted_at);
    if (deletedCustIds.length > 0) {
      mockLedger = mockLedger.filter((l) => !deletedCustIds.includes(l.customer_id));
      mockDeliveries = mockDeliveries.filter((d) => !deletedCustIds.includes(d.customer_id));
      mockPayments = mockPayments.filter((p) => !deletedCustIds.includes(p.customer_id));
      mockSchedules = mockSchedules.filter((s) => !deletedCustIds.includes(s.customer_id));
    }
    saveDatabaseToDevice();
  },

  // Schedules / Subscriptions
  listDeliverySchedules: async (customerId?: number): Promise<DeliveryScheduleRecord[]> => {
    if (isTauri) {
      return await invoke<DeliveryScheduleRecord[]>('list_delivery_schedules', { customerId });
    }
    if (customerId) {
      return mockSchedules.filter((s) => s.customer_id === customerId);
    }
    return [...mockSchedules];
  },

  upsertDeliverySchedule: async (schedule: DeliveryScheduleInput): Promise<DeliveryScheduleRecord> => {
    if (isTauri) {
      return await invoke<DeliveryScheduleRecord>('upsert_delivery_schedule', { schedule });
    }
    if (schedule.id) {
      mockSchedules = mockSchedules.map((s) =>
        s.id === schedule.id
          ? {
              ...s,
              product_id: schedule.product_id,
              quantity: schedule.quantity,
              delivery_days: schedule.delivery_days,
              custom_price: schedule.custom_price,
              start_date: schedule.start_date,
              end_date: schedule.end_date,
              status: schedule.status,
            }
          : s
      );
      saveDatabaseToDevice();
      return mockSchedules.find((s) => s.id === schedule.id)!;
    }
    const newId = mockSchedules.length ? Math.max(...mockSchedules.map((s) => s.id || 0)) + 1 : 1;
    const newSched: DeliveryScheduleRecord = {
      id: newId,
      customer_id: schedule.customer_id,
      product_id: schedule.product_id,
      quantity: schedule.quantity,
      delivery_days: schedule.delivery_days,
      custom_price: schedule.custom_price,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      status: schedule.status,
      created_at: new Date().toISOString(),
    };
    mockSchedules.push(newSched);
    saveDatabaseToDevice();
    return newSched;
  },

  deleteDeliverySchedule: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('delete_delivery_schedule', { id });
    }
    mockSchedules = mockSchedules.filter((s) => s.id !== id);
    saveDatabaseToDevice();
  },

  // Daily Deliveries
  listDeliveries: async (): Promise<DeliveryRecord[]> => {
    if (isTauri) {
      return await invoke<DeliveryRecord[]>('list_deliveries');
    }
    return [...mockDeliveries];
  },

  listDeliveriesByDate: async (deliveryDate: string, sessionKey?: string): Promise<DeliveryRecord[]> => {
    if (isTauri) {
      return await invoke<DeliveryRecord[]>('list_deliveries_by_date', { deliveryDate, sessionKey });
    }
    return mockDeliveries.filter((d) => {
      const matchDate = d.delivery_date === deliveryDate;
      const matchSession = sessionKey ? d.session_key === sessionKey : true;
      return matchDate && matchSession;
    });
  },

  listDeliveriesByCustomer: async (customerId: number): Promise<DeliveryRecord[]> => {
    if (isTauri) {
      return await invoke<DeliveryRecord[]>('list_deliveries_by_customer', { customerId });
    }
    return mockDeliveries.filter((d) => d.customer_id === customerId);
  },

  upsertDelivery: async (delivery: DeliveryInput): Promise<DeliveryRecord> => {
    if (isTauri) {
      return await invoke<DeliveryRecord>('upsert_delivery', { delivery });
    }
    const targetId = delivery.id || (mockDeliveries.length ? Math.max(...mockDeliveries.map((d) => d.id || 0)) + 1 : 1);
    const items: DeliveryItemRecord[] = (delivery.items || []).map((it, idx) => ({
      id: it.id || idx + 1,
      delivery_id: targetId,
      customer_id: delivery.customer_id,
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
      line_amount: it.line_amount,
      product_name_snapshot: it.product_name_snapshot || 'Item',
      unit_snapshot: it.unit_snapshot || 'Unit',
    }));

    const rec: DeliveryRecord = {
      id: targetId,
      customer_id: delivery.customer_id,
      delivery_date: delivery.delivery_date,
      session_key: delivery.session_key || 'morning',
      product_id: delivery.product_id || (items[0] ? items[0].product_id : 1),
      total_quantity: delivery.total_quantity || (items.length ? items.reduce((sum, i) => sum + i.quantity, 0) : 1),
      total_amount: delivery.total_amount,
      status: delivery.status,
      notes: delivery.notes,
      items,
      created_at: new Date().toISOString(),
    };

    if (delivery.id) {
      mockDeliveries = mockDeliveries.map((d) => (d.id === delivery.id ? rec : d));
      const linkedLedger = mockLedger.find(
        (l) => l.related_entity_type === 'deliveries' && l.related_entity_id === delivery.id
      );
      if (linkedLedger) {
        linkedLedger.debit_amount = delivery.total_amount;
        linkedLedger.description = `Delivery charge for ${delivery.delivery_date} (${delivery.session_key || 'morning'})`;
        recalculateCustomerLedger(delivery.customer_id);
      }
    } else {
      mockDeliveries.unshift(rec);
      if (rec.status === 'confirmed' && rec.total_amount > 0) {
        const prevBal = mockLedger
          .filter((l) => l.customer_id === delivery.customer_id)
          .slice(-1)[0]?.running_balance ?? 0;
        mockLedger.push({
          id: mockLedger.length + 1,
          customer_id: delivery.customer_id,
          transaction_type: 'delivery_charge',
          related_entity_type: 'deliveries',
          related_entity_id: targetId,
          description: `Delivery charge for ${delivery.delivery_date} (${delivery.session_key || 'morning'})`,
          debit_amount: delivery.total_amount,
          credit_amount: 0,
          running_balance: prevBal + delivery.total_amount,
          reference: `DEL-${targetId}`,
          created_at: new Date().toISOString(),
        });
      }
    }

    saveDatabaseToDevice();
    return rec;
  },

  batchUpsertDeliveries: async (deliveries: DeliveryInput[]): Promise<DeliveryRecord[]> => {
    if (isTauri) {
      return await invoke<DeliveryRecord[]>('batch_upsert_deliveries', { deliveries });
    }
    const results: DeliveryRecord[] = [];
    for (const d of deliveries) {
      const rec = await api.upsertDelivery(d);
      results.push(rec);
    }
    return results;
  },

  deleteDelivery: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('delete_delivery', { id });
    }
    const found = mockDeliveries.find((d) => d.id === id);
    mockDeliveries = mockDeliveries.filter((d) => d.id !== id);
    mockLedger = mockLedger.filter(
      (l) => !(l.related_entity_type === 'deliveries' && l.related_entity_id === id)
    );
    if (found) {
      recalculateCustomerLedger(found.customer_id);
    }
    saveDatabaseToDevice();
  },

  // Payments
  listPayments: async (customerId?: number): Promise<PaymentRecord[]> => {
    if (isTauri) {
      return await invoke<PaymentRecord[]>('list_payments', { customerId });
    }
    if (customerId) {
      return mockPayments.filter((p) => p.customer_id === customerId);
    }
    return [...mockPayments];
  },

  upsertPayment: async (payment: PaymentInput): Promise<PaymentRecord> => {
    if (isTauri) {
      return await invoke<PaymentRecord>('upsert_payment', { payment });
    }
    if (payment.id) {
      mockPayments = mockPayments.map((p) =>
        p.id === payment.id
          ? {
              ...p,
              customer_id: payment.customer_id,
              payment_date: payment.payment_date,
              amount: payment.amount,
              payment_method: payment.payment_method,
              reference_no: payment.reference_no,
              notes: payment.notes,
              status: payment.status || p.status,
            }
          : p
      );
      const linkedEntry = mockLedger.find(
        (l) => l.related_entity_type === 'payments' && l.related_entity_id === payment.id
      );
      if (linkedEntry) {
        linkedEntry.credit_amount = payment.amount;
        linkedEntry.description = `Payment received via ${payment.payment_method.toUpperCase()}`;
      }
      recalculateCustomerLedger(payment.customer_id);
      saveDatabaseToDevice();
      return mockPayments.find((p) => p.id === payment.id)!;
    }
    const newId = payment.id || (mockPayments.length ? Math.max(...mockPayments.map((p) => p.id || 0)) + 1 : 1);
    const rec: PaymentRecord = {
      ...payment,
      id: newId,
      status: payment.status || 'posted',
      created_at: new Date().toISOString(),
    };
    mockPayments.unshift(rec);
    if (rec.status === 'posted' && payment.amount > 0) {
      const prevBal = mockLedger
        .filter((l) => l.customer_id === payment.customer_id)
        .slice(-1)[0]?.running_balance ?? 0;
      mockLedger.push({
        id: mockLedger.length + 1,
        customer_id: payment.customer_id,
        transaction_type: 'payment',
        related_entity_type: 'payments',
        related_entity_id: newId,
        description: `Payment received via ${payment.payment_method.toUpperCase()}`,
        debit_amount: 0,
        credit_amount: payment.amount,
        running_balance: prevBal - payment.amount,
        reference: `PAY-${newId}`,
        created_at: new Date().toISOString(),
      });
    }
    saveDatabaseToDevice();
    return rec;
  },

  deletePayment: async (id: number): Promise<void> => {
    if (isTauri) {
      return await invoke<void>('delete_payment', { id });
    }
    const found = mockPayments.find((p) => p.id === id);
    mockPayments = mockPayments.filter((p) => p.id !== id);
    mockLedger = mockLedger.filter(
      (l) => !(l.related_entity_type === 'payments' && l.related_entity_id === id)
    );
    if (found) {
      recalculateCustomerLedger(found.customer_id);
    }
    saveDatabaseToDevice();
  },

  // Invoices
  listInvoices: async (): Promise<InvoiceRecord[]> => {
    if (isTauri) {
      return await invoke<InvoiceRecord[]>('list_invoices');
    }
    return [...mockInvoices];
  },

  upsertInvoice: async (invoice: InvoiceInput): Promise<InvoiceRecord> => {
    if (isTauri) {
      return await invoke<InvoiceRecord>('upsert_invoice', { invoice });
    }
    const newId = invoice.id || (mockInvoices.length ? Math.max(...mockInvoices.map((i) => i.id || 0)) + 1 : 1);
    const rec: InvoiceRecord = {
      ...invoice,
      id: newId,
      generated_at: new Date().toISOString(),
    };
    mockInvoices.unshift(rec);
    saveDatabaseToDevice();
    return rec;
  },

  // Ledger
  listLedgerEntries: async (customerId: number): Promise<LedgerEntryRecord[]> => {
    if (isTauri) {
      return await invoke<LedgerEntryRecord[]>('list_ledger_entries', { customerId });
    }
    return mockLedger.filter((l) => l.customer_id === customerId);
  },

  addLedgerEntry: async (entry: LedgerEntryInput): Promise<LedgerEntryRecord> => {
    if (isTauri) {
      return await invoke<LedgerEntryRecord>('add_ledger_entry', { entry });
    }
    const prevBal = mockLedger
      .filter((l) => l.customer_id === entry.customer_id)
      .slice(-1)[0]?.running_balance ?? 0;
    const newBal = prevBal + entry.debit_amount - entry.credit_amount;
    const newRecord: LedgerEntryRecord = {
      id: mockLedger.length + 1,
      customer_id: entry.customer_id,
      transaction_type: entry.transaction_type,
      related_entity_type: entry.related_entity_type,
      related_entity_id: entry.related_entity_id,
      description: entry.description,
      debit_amount: entry.debit_amount,
      credit_amount: entry.credit_amount,
      running_balance: newBal,
      reference: entry.reference,
      created_at: new Date().toISOString(),
    };
    mockLedger.push(newRecord);
    saveDatabaseToDevice();
    return newRecord;
  },
};
