import React, { useState, useEffect, useCallback } from 'react';
import { ViewName } from './types/enums';
import {
  AgencySettings,
  AuthSettings,
  BackupSettings,
  CustomerInput,
  CustomerRecord,
  DatabaseStatus,
  DeliveryInput,
  DeliveryRecord,
  DeliveryScheduleInput,
  DeliveryScheduleRecord,
  LedgerEntryInput,
  LedgerEntryRecord,
  PaymentInput,
  PaymentRecord,
  ProductInput,
  ProductRecord,
} from './types/models';
import { api, DEFAULT_AUTH_SETTINGS } from './lib/api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LockScreen } from './components/layout/LockScreen';
import { DashboardView } from './features/dashboard/DashboardView';
import { CustomerListView } from './features/customers/CustomerListView';
import { CustomerFormModal } from './features/customers/CustomerFormModal';
import { CustomerDetailModal } from './features/customers/CustomerDetailModal';
import { ProductListView } from './features/products/ProductListView';
import { ProductFormModal } from './features/products/ProductFormModal';
import { ScheduleListView } from './features/delivery-schedules/ScheduleListView';
import { ScheduleFormModal } from './features/delivery-schedules/ScheduleFormModal';
import { DailyDeliveryView } from './features/daily-delivery/DailyDeliveryView';
import { RecordDeliveryModal } from './features/daily-delivery/RecordDeliveryModal';
import { LedgerView } from './features/ledger/LedgerView';
import { PaymentListView } from './features/payments/PaymentListView';
import { PaymentModal } from './features/payments/PaymentModal';
import { BillingView } from './features/billing/BillingView';
import { ReportsView } from './features/reports/ReportsView';
import { SettingsView } from './features/settings/SettingsView';
import { BinView } from './features/bin/BinView';
import { LayoutDashboard, Users, Truck, Receipt, CreditCard } from 'lucide-react';

export function App() {
  // Navigation & Shell State
  const [activeView, setActiveView] = useState<ViewName>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [authSettings, setAuthSettings] = useState<AuthSettings>(DEFAULT_AUTH_SETTINGS);

  // Core Data State
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    agency_name: 'Satvik Milk Agency',
    owner_name: 'Aniket Korade',
    owner_email: 'aniketkorade1995@gmail.com',
    security_pin: '1995',
    mobile: '8600732906',
    address: 'AT- GULUCHWADI POST- BELHE, Gulunchwadi, Junnar, Pune Rural, Maharashtra - 412410',
    currency: 'INR',
    receipt_brand_line: '',
    receipt_phone: '8600732906',
    receipt_gst: '',
    default_receipt_footer: 'Thank you for doing business with us.',
    receipt_header_color: '#00A8E8',
    logo_path: '/agency-logo.png',
  });
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    auto_backup_enabled: true,
    backup_frequency: 'daily',
    backup_retention: 7,
  });
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [backupFiles, setBackupFiles] = useState<string[]>([]);

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [schedules, setSchedules] = useState<DeliveryScheduleRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryRecord[]>([]);

  // Modal Dialog States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerRecord | null>(null);

  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<CustomerRecord | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductRecord | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<DeliveryScheduleRecord | null>(null);
  const [scheduleDefaultCustId, setScheduleDefaultCustId] = useState<number | undefined>(undefined);

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryDefaultCustId, setDeliveryDefaultCustId] = useState<number | undefined>(undefined);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDefaultCustId, setPaymentDefaultCustId] = useState<number | undefined>(undefined);
  const [paymentToEdit, setPaymentToEdit] = useState<PaymentRecord | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Initial Data Loading
  const loadAllData = useCallback(async () => {
    try {
      const dbStatus = await api.initializeDatabase();
      setDatabaseStatus(dbStatus);

      const [agency, backups, custs, prods, scheds, dels, pays, auth] = await Promise.all([
        api.getAgencySettings(),
        api.listBackups(),
        api.listCustomers(),
        api.listProducts(),
        api.listDeliverySchedules(),
        api.listDeliveries(),
        api.listPayments(),
        api.getAuthSettings(),
      ]);

      if (agency) setAgencySettings(agency);
      if (auth) setAuthSettings(auth);
      setBackupFiles(backups);
      setCustomers(custs);
      setProducts(prods);
      setSchedules(scheds);
      setDeliveries(dels);
      setPayments(pays);

      // Load all ledger entries for active customers
      const allLedgers: LedgerEntryRecord[] = [];
      for (const c of custs) {
        if (c.id) {
          const cLedger = await api.listLedgerEntries(c.id);
          allLedgers.push(...cLedger);
        }
      }
      setLedgerEntries(allLedgers);
    } catch (err: any) {
      console.error('Data load error:', err);
    }
  }, []);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Customer Handlers
  const handleSaveCustomer = async (cust: CustomerInput) => {
    const saved = await api.upsertCustomer(cust);
    await loadAllData();
    showToast(`Customer "${saved.name}" saved successfully.`);
  };

  const handleEditCustomer = (cust: CustomerRecord) => {
    setCustomerToEdit(cust);
    setIsCustomerModalOpen(true);
  };

  const handleMoveCustomerToBin = async (customerId: number) => {
    const cust = customers.find((c) => c.id === customerId);
    await api.moveToBinCustomer(customerId);
    await loadAllData();
    showToast(`Customer "${cust?.name || customerId}" moved to Recycle Bin.`);
  };

  const handleRestoreCustomer = async (customerId: number) => {
    const cust = customers.find((c) => c.id === customerId);
    await api.restoreCustomer(customerId);
    await loadAllData();
    showToast(`Customer "${cust?.name || customerId}" restored to active directory.`);
  };

  const handlePermanentDeleteCustomer = async (customerId: number) => {
    const cust = customers.find((c) => c.id === customerId);
    await api.permanentDeleteCustomer(customerId);
    await loadAllData();
    showToast(`Customer "${cust?.name || customerId}" permanently deleted.`);
  };

  const handleViewCustomer = (cust: CustomerRecord) => {
    setSelectedDetailCustomer(cust);
    setIsCustomerDetailOpen(true);
  };

  // Product Handlers
  const handleSaveProduct = async (prod: ProductInput) => {
    const saved = await api.upsertProduct(prod);
    await loadAllData();
    showToast(`Product "${saved.name}" saved.`);
  };

  const handleEditProduct = (prod: ProductRecord) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleMoveProductToBin = async (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    await api.moveToBinProduct(productId);
    await loadAllData();
    showToast(`Product "${prod?.name || productId}" moved to Recycle Bin.`);
  };

  const handleRestoreProduct = async (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    await api.restoreProduct(productId);
    await loadAllData();
    showToast(`Product "${prod?.name || productId}" restored to catalog.`);
  };

  const handlePermanentDeleteProduct = async (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    await api.permanentDeleteProduct(productId);
    await loadAllData();
    showToast(`Product "${prod?.name || productId}" permanently deleted.`);
  };

  // Schedule Handlers
  const handleSaveSchedule = async (sch: DeliveryScheduleInput) => {
    await api.upsertDeliverySchedule(sch);
    await loadAllData();
    showToast('Subscription schedule updated.');
  };

  const handleEditSchedule = (sch: DeliveryScheduleRecord) => {
    setScheduleToEdit(sch);
    setIsScheduleModalOpen(true);
  };

  const handleToggleScheduleStatus = async (sch: DeliveryScheduleRecord) => {
    const nextStatus = sch.status === 'active' ? 'paused' : 'active';
    await api.upsertDeliverySchedule({
      ...sch,
      status: nextStatus,
    });
    await loadAllData();
    showToast(`Subscription ${nextStatus === 'active' ? 'resumed' : 'paused'}.`);
  };

  // Delivery Handlers
  const handleSaveSingleDelivery = async (delivery: DeliveryInput, payment?: PaymentInput) => {
    await api.upsertDelivery(delivery);
    if (payment && payment.amount > 0) {
      await api.upsertPayment(payment);
    }
    await loadAllData();
    if (payment && payment.amount > 0) {
      showToast('Delivery and payment collected & posted to ledger!');
    } else {
      showToast('Customer delivery posted to ledger!');
    }
  };

  const handleBatchConfirmDeliveries = async (batch: DeliveryInput[]) => {
    await api.batchUpsertDeliveries(batch);
    await loadAllData();
    showToast('Daily deliveries confirmed & posted to ledger!');
  };

  const handleGenerateReceiptFromDelivery = (row: any) => {
    setSelectedDetailCustomer(customers.find((c) => c.id === row.customerId) || null);
    setActiveView('billing');
  };

  // Payment Handlers
  const handleSavePayment = async (pay: PaymentInput) => {
    await api.upsertPayment(pay);
    await loadAllData();
    showToast('Payment received & credited to ledger.');
  };

  // Ledger Adjustment Handlers
  const handleSaveAdjustment = async (adj: LedgerEntryInput) => {
    await api.addLedgerEntry(adj);
    await loadAllData();
    showToast('Manual adjustment posted to ledger.');
  };

  // Backup & Settings Handlers
  const handleQuickBackup = async () => {
    const res = await api.createBackup();
    const updatedBackups = await api.listBackups();
    setBackupFiles(updatedBackups);
    showToast(`Backup archive created: ${res.split('\\').pop()}`);
  };

  const handleRestoreBackup = async (path: string) => {
    await api.restoreBackup(path);
    await loadAllData();
    showToast('Database restored successfully from backup.');
  };

  const handleDeleteBackup = async (path: string) => {
    await api.deleteBackup(path);
    const updatedBackups = await api.listBackups();
    setBackupFiles(updatedBackups);
    showToast('Backup archive deleted.');
  };

  const handleEmptyRecycleBin = async () => {
    await api.emptyRecycleBin();
    await loadAllData();
    showToast('Recycle bin emptied permanently.');
  };

  const handleSaveAgencySettings = async (settings: AgencySettings) => {
    const saved = await api.saveAgencySettings(settings);
    setAgencySettings(saved);
    showToast('Agency profile updated.');
  };

  const handleSaveBackupSettings = async (settings: BackupSettings) => {
    const saved = await api.saveBackupSettings(settings);
    setBackupSettings(saved);
    showToast('Backup configuration updated.');
  };

  const handleReloadDummyData = async () => {
    await api.seedDummyData();
    await loadAllData();
    showToast('Loaded 10 Products & 30 Customers test data successfully!');
  };

  const handleSaveAuthSettings = async (newAuth: { email: string; pin: string }) => {
    const saved = await api.saveAuthSettings({ ...authSettings, ...newAuth });
    setAuthSettings(saved);
    showToast(`Account credentials saved: ${saved.email} (PIN: ${saved.pin})`);
  };

  const handleExportDatabase = async () => {
    await api.exportDatabaseBackup();
    showToast('Database exported as .milkdb file! Ready to transfer.');
  };

  const handleImportDatabase = async (jsonStr: string): Promise<boolean> => {
    const ok = await api.importDatabaseBackup(jsonStr);
    if (ok) {
      await loadAllData();
      showToast('Database restored successfully from backup!');
      return true;
    } else {
      showToast('Failed to import database: Invalid file format.');
      return false;
    }
  };

  const handleClearDummyData = async () => {
    await api.clearDatabaseToCleanState();
    await loadAllData();
    showToast('Clean system active: Dummy records removed. Real data will be saved.');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Security Lock Screen */}
      <LockScreen
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        agencyName={agencySettings.agency_name}
        userEmail={authSettings.email}
        correctPin={authSettings.pin}
      />

      {/* Persistent Left Sidebar (Desktop) / Slide-Over Drawer (Mobile) */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        agencyName={agencySettings.agency_name}
        logoUrl={agencySettings.logo_path}
        onLock={() => setIsLocked(true)}
        isEncrypted={databaseStatus?.encryption_enabled ?? true}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        deletedCount={
          customers.filter((c) => !!c.deleted_at).length +
          products.filter((p) => !!p.deleted_at).length
        }
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <Header
          activeView={activeView}
          onNavigate={setActiveView}
          onLock={() => setIsLocked(true)}
          onQuickBackup={handleQuickBackup}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddDelivery={() => {
            setDeliveryDefaultCustId(undefined);
            setIsDeliveryModalOpen(true);
          }}
          onAddPayment={() => {
            setPaymentToEdit(null);
            setPaymentDefaultCustId(undefined);
            setIsPaymentModalOpen(true);
          }}
          onAddCustomer={() => {
            setCustomerToEdit(null);
            setIsCustomerModalOpen(true);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed top-16 left-3 right-3 sm:left-auto sm:right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 animate-slide-in text-center sm:text-left truncate">
            {toastMessage}
          </div>
        )}

        {/* Dynamic Content Viewport */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 pb-24 md:pb-6">
          {activeView === 'dashboard' && (
            <DashboardView
              customers={customers}
              products={products}
              deliveries={deliveries}
              payments={payments}
              ledgerEntries={ledgerEntries}
              onNavigate={setActiveView}
              onAddDelivery={() => {
                setDeliveryDefaultCustId(undefined);
                setIsDeliveryModalOpen(true);
              }}
              onAddPayment={() => {
                setPaymentToEdit(null);
                setPaymentDefaultCustId(undefined);
                setIsPaymentModalOpen(true);
              }}
              onAddCustomer={() => {
                setCustomerToEdit(null);
                setIsCustomerModalOpen(true);
              }}
            />
          )}

          {activeView === 'customers' && (
            <CustomerListView
              customers={customers}
              ledgerEntries={ledgerEntries}
              onAddCustomer={() => {
                setCustomerToEdit(null);
                setIsCustomerModalOpen(true);
              }}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleMoveCustomerToBin}
              onViewCustomer={handleViewCustomer}
              onRecordDelivery={(cId) => {
                setDeliveryDefaultCustId(cId);
                setIsDeliveryModalOpen(true);
              }}
              onRecordPayment={(cId) => {
                setPaymentToEdit(null);
                setPaymentDefaultCustId(cId);
                setIsPaymentModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'products' && (
            <ProductListView
              products={products}
              onAddProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleMoveProductToBin}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'schedules' && (
            <ScheduleListView
              schedules={schedules}
              customers={customers}
              products={products}
              onAddSchedule={() => {
                setScheduleToEdit(null);
                setScheduleDefaultCustId(undefined);
                setIsScheduleModalOpen(true);
              }}
              onEditSchedule={handleEditSchedule}
              onToggleStatus={handleToggleScheduleStatus}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'deliveries' && (
            <DailyDeliveryView
              customers={customers}
              products={products}
              schedules={schedules}
              deliveries={deliveries}
              payments={payments}
              ledgerEntries={ledgerEntries}
              agencySettings={agencySettings}
              onBatchConfirm={handleBatchConfirmDeliveries}
              onGenerateReceipt={handleGenerateReceiptFromDelivery}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'ledger' && (
            <LedgerView
              ledgerEntries={ledgerEntries}
              customers={customers}
              onAddAdjustment={handleSaveAdjustment}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'payments' && (
            <PaymentListView
              payments={payments}
              customers={customers}
              ledgerEntries={ledgerEntries}
              agencySettings={agencySettings}
              onAddPayment={() => {
                setPaymentToEdit(null);
                setPaymentDefaultCustId(undefined);
                setIsPaymentModalOpen(true);
              }}
              onEditPayment={(payment) => {
                setPaymentToEdit(payment);
                setIsPaymentModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'billing' && (
            <BillingView
              agencySettings={agencySettings}
              customers={customers}
              products={products}
              deliveries={deliveries}
              payments={payments}
              ledgerEntries={ledgerEntries}
              searchQuery={searchQuery}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              customers={customers}
              products={products}
              deliveries={deliveries}
              payments={payments}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              agencySettings={agencySettings}
              backupSettings={backupSettings}
              databaseStatus={databaseStatus}
              backupFiles={backupFiles}
              userEmail={authSettings.email}
              userPin={authSettings.pin}
              onSaveAgencySettings={handleSaveAgencySettings}
              onSaveBackupSettings={handleSaveBackupSettings}
              onTriggerBackup={handleQuickBackup}
              onRestoreBackup={handleRestoreBackup}
              onDeleteBackup={handleDeleteBackup}
              onEmptyRecycleBin={handleEmptyRecycleBin}
              onReloadDummyData={handleReloadDummyData}
              onClearDummyData={handleClearDummyData}
              onExportDatabase={handleExportDatabase}
              onImportDatabase={handleImportDatabase}
              onSaveAuthSettings={handleSaveAuthSettings}
            />
          )}

          {activeView === 'bin' && (
            <BinView
              customers={customers}
              products={products}
              ledgerEntries={ledgerEntries}
              onRestoreCustomer={handleRestoreCustomer}
              onPermanentDeleteCustomer={handlePermanentDeleteCustomer}
              onRestoreProduct={handleRestoreProduct}
              onPermanentDeleteProduct={handlePermanentDeleteProduct}
              onEmptyBin={handleEmptyRecycleBin}
              searchQuery={searchQuery}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Sticky for Smartphone & Tablet Use) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around px-2 shadow-lg select-none">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeView === 'dashboard'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveView('customers')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeView === 'customers'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Customer</span>
          </button>

          <button
            onClick={() => setActiveView('deliveries')}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeView === 'deliveries'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                activeView === 'deliveries'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Delivery</span>
          </button>

          <button
            onClick={() => setActiveView('billing')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeView === 'billing'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Bill</span>
          </button>

          <button
            onClick={() => setActiveView('payments')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeView === 'payments'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Payments</span>
          </button>
        </nav>
      </div>

      {/* Modals & Dialogs */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        customerToEdit={customerToEdit}
      />

      <CustomerDetailModal
        isOpen={isCustomerDetailOpen}
        onClose={() => setIsCustomerDetailOpen(false)}
        customer={selectedDetailCustomer}
        schedules={schedules}
        deliveries={deliveries}
        payments={payments}
        ledgerEntries={ledgerEntries}
        agencySettings={agencySettings}
        onAddDelivery={(cId) => {
          setIsCustomerDetailOpen(false);
          setDeliveryDefaultCustId(cId);
          setIsDeliveryModalOpen(true);
        }}
        onAddPayment={(cId) => {
          setIsCustomerDetailOpen(false);
          setPaymentDefaultCustId(cId);
          setIsPaymentModalOpen(true);
        }}
      />

      <RecordDeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSave={handleSaveSingleDelivery}
        customers={customers}
        products={products}
        schedules={schedules}
        defaultCustomerId={deliveryDefaultCustId}
        agencySettings={agencySettings}
        ledgerEntries={ledgerEntries}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      <ScheduleFormModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        customers={customers}
        products={products}
        scheduleToEdit={scheduleToEdit}
        defaultCustomerId={scheduleDefaultCustId}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentToEdit(null);
        }}
        onSave={handleSavePayment}
        customers={customers}
        defaultCustomerId={paymentDefaultCustId}
        paymentToEdit={paymentToEdit}
        agencySettings={agencySettings}
        ledgerEntries={ledgerEntries}
      />
    </div>
  );
}

export default App;
