import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, DEFAULT_AUTH_SETTINGS, DEFAULT_AGENCY_SETTINGS } from './api';

describe('Client Device Database Storage & Auth Suite', () => {
  beforeEach(async () => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    await api.seedDummyData();
  });

  it('initializes with default credentials aniketkorade1995@gmail.com and PIN 1995', async () => {
    const auth = await api.getAuthSettings();
    expect(auth.email).toBe('aniketkorade1995@gmail.com');
    expect(auth.pin).toBe('1995');
  });

  it('allows updating account email and security PIN in settings', async () => {
    const updated = await api.saveAuthSettings({
      email: 'aniket.new@agency.com',
      pin: '2026',
      agency_id: 'VINAYSHIL-KRUSHI',
    });
    expect(updated.email).toBe('aniket.new@agency.com');
    expect(updated.pin).toBe('2026');

    const retrieved = await api.getAuthSettings();
    expect(retrieved.email).toBe('aniket.new@agency.com');
    expect(retrieved.pin).toBe('2026');
  });

  it('persists newly added customers to device storage', async () => {
    const newCustomer = await api.upsertCustomer({
      name: 'Ramesh Korade',
      mobile: '9876543210',
      address: 'Rajuri Mala',
      route_area: 'Rajuri Station',
      joining_date: '2026-11-15',
      opening_balance: 50000,
      status: 'active',
    });

    expect(newCustomer.name).toBe('Ramesh Korade');
    expect(newCustomer.id).toBeDefined();

    const customers = await api.listCustomers();
    const found = customers.find((c) => c.name === 'Ramesh Korade');
    expect(found).toBeDefined();
    expect(found?.mobile).toBe('9876543210');
  });

  it('exports database backup payload for multi-device transfer', async () => {
    // Mock createObjectURL & revokeObjectURL if not available in jsdom
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn(() => 'blob:mock');
      URL.revokeObjectURL = vi.fn();
    }

    const backupJson = await api.exportDatabaseBackup();
    expect(backupJson).toBeDefined();

    const parsed = JSON.parse(backupJson);
    expect(parsed.agencySettings).toBeDefined();
    expect(parsed.customers).toBeInstanceOf(Array);
    expect(parsed.products).toBeInstanceOf(Array);
    expect(parsed.version).toBe(2);
  });

  it('imports database backup on a new device seamlessly', async () => {
    const transferPayload = {
      agencySettings: {
        ...DEFAULT_AGENCY_SETTINGS,
        agency_name: 'VINAYSHIL KRUSHI MULTI-DEVICE',
      },
      customers: [
        {
          id: 999,
          customer_code: 'CUST-999',
          name: 'Device Transfer Test Customer',
          mobile: '9998887776',
          joining_date: '2026-11-15',
          opening_balance: 0,
          status: 'active',
        },
      ],
      products: [],
      schedules: [],
      deliveries: [],
      payments: [],
      ledger: [],
      invoices: [],
      version: 2,
    };

    const success = await api.importDatabaseBackup(JSON.stringify(transferPayload));
    expect(success).toBe(true);

    const customers = await api.listCustomers();
    expect(customers.length).toBe(1);
    expect(customers[0].name).toBe('Device Transfer Test Customer');

    const agency = await api.getAgencySettings();
    expect(agency?.agency_name).toBe('VINAYSHIL KRUSHI MULTI-DEVICE');
  });

  it('boots up with a clean database ready for real data (no dummy customers, products, or deliveries)', async () => {
    await api.clearDatabaseToCleanState();
    const customers = await api.listCustomers();
    const products = await api.listProducts();
    const deliveries = await api.listDeliveries();
    const payments = await api.listPayments();
    const schedules = await api.listDeliverySchedules();

    expect(customers).toEqual([]);
    expect(products).toEqual([]);
    expect(deliveries).toEqual([]);
    expect(payments).toEqual([]);
    expect(schedules).toEqual([]);
  });

  it('supports starting clean system by removing dummy demonstration records', async () => {
    await api.clearDatabaseToCleanState();
    const customers = await api.listCustomers();
    const deliveries = await api.listDeliveries();
    const payments = await api.listPayments();

    expect(customers.length).toBe(0);
    expect(deliveries.length).toBe(0);
    expect(payments.length).toBe(0);

    // Now adding a real customer works on clean slate
    const realCust = await api.upsertCustomer({
      name: 'Production Real Customer',
      mobile: '9123456789',
      joining_date: '2026-11-15',
      opening_balance: 0,
      status: 'active',
    });

    const refreshed = await api.listCustomers();
    expect(refreshed.length).toBe(1);
    expect(refreshed[0].name).toBe('Production Real Customer');
  });

  it('immediately credits and reduces customer balance when customer pays at delivery', async () => {
    await api.clearDatabaseToCleanState();

    // 1. Create a customer with 0 opening balance
    const cust = await api.upsertCustomer({
      name: 'Santosh Pawar',
      mobile: '9822001122',
      joining_date: '2026-11-15',
      opening_balance: 0,
      status: 'active',
    });

    // 2. Customer has a delivery of ₹120 (12000 paise)
    await api.upsertDelivery({
      customer_id: cust.id,
      product_id: 1,
      delivery_date: '2026-11-15',
      session_key: 'morning',
      status: 'confirmed',
      total_quantity: 2,
      total_amount: 12000,
    });

    // Verify balance is now 12000 paise due
    let custLedger = await api.listLedgerEntries(cust.id);
    expect(custLedger[custLedger.length - 1].running_balance).toBe(12000);

    // 3. Customer pays ₹100 (10000 paise) at delivery
    await api.upsertPayment({
      customer_id: cust.id,
      payment_date: '2026-11-15',
      amount: 10000,
      payment_method: 'cash',
      status: 'posted',
      notes: 'Instant payment at delivery (Morning)',
    });

    // 4. Verify balance is immediately reduced to 2000 paise (120 - 100 = 20)
    custLedger = await api.listLedgerEntries(cust.id);
    expect(custLedger[custLedger.length - 1].running_balance).toBe(2000);

    // 5. Customer pays remainder ₹20 (2000 paise)
    await api.upsertPayment({
      customer_id: cust.id,
      payment_date: '2026-11-15',
      amount: 2000,
      payment_method: 'upi',
      status: 'confirmed', // test with 'confirmed' status as well
      notes: 'Instant payment at delivery (Evening)',
    });

    custLedger = await api.listLedgerEntries(cust.id);
    expect(custLedger[custLedger.length - 1].running_balance).toBe(0);
  });
});
