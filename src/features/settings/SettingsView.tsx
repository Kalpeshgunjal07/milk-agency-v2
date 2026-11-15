import React, { useState, useRef } from 'react';
import { AgencySettings, BackupSettings, DatabaseStatus } from '../../types/models';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { AGENCY_LOGO_BASE64 } from '../../lib/logoBase64';
import {
  Building2,
  ShieldCheck,
  Database,
  KeyRound,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  Palette,
  Download,
  FileUp,
  Smartphone,
  Mail,
} from 'lucide-react';

interface SettingsViewProps {
  agencySettings: AgencySettings;
  backupSettings: BackupSettings;
  databaseStatus: DatabaseStatus | null;
  backupFiles: string[];
  userEmail?: string;
  userPin?: string;
  onSaveAgencySettings: (settings: AgencySettings) => Promise<void>;
  onSaveBackupSettings: (settings: BackupSettings) => Promise<void>;
  onTriggerBackup: () => Promise<void>;
  onRestoreBackup: (path: string) => Promise<void>;
  onDeleteBackup?: (path: string) => Promise<void>;
  onEmptyRecycleBin?: () => Promise<void>;
  onReloadDummyData?: () => Promise<void>;
  onClearDummyData?: () => Promise<void>;
  onExportDatabase?: () => Promise<void>;
  onImportDatabase?: (jsonStr: string) => Promise<boolean>;
  onSaveAuthSettings?: (auth: { email: string; pin: string }) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  agencySettings,
  backupSettings,
  databaseStatus,
  backupFiles,
  userEmail = 'aniketkorade1995@gmail.com',
  userPin = '1995',
  onSaveAgencySettings,
  onSaveBackupSettings,
  onTriggerBackup,
  onRestoreBackup,
  onDeleteBackup,
  onEmptyRecycleBin,
  onReloadDummyData,
  onClearDummyData,
  onExportDatabase,
  onImportDatabase,
  onSaveAuthSettings,
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [agencyForm, setAgencyForm] = useState<AgencySettings>(agencySettings);
  const [backupForm, setBackupForm] = useState<BackupSettings>(backupSettings);
  const [emailForm, setEmailForm] = useState(userEmail);
  const [pinForm, setPinForm] = useState(userPin);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [isDeletingBackup, setIsDeletingBackup] = useState<string | null>(null);
  const [isEmptyingBin, setIsEmptyingBin] = useState(false);
  const [isExportingDb, setIsExportingDb] = useState(false);
  const [isClearingDummy, setIsClearingDummy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'profile', label: 'Agency Profile & Logo', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'database', label: 'Encrypted Backups', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security & PIN', icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: 'danger', label: 'Data Cleanup & Delete', icon: <Trash2 className="w-3.5 h-3.5 text-rose-500" /> },
  ];

  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveAgencySettings(agencyForm);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAgencyForm((prev) => ({ ...prev, logo_path: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = () => {
    if (confirm('Are you sure you want to delete and reset the agency logo to default?')) {
      setAgencyForm((prev) => ({ ...prev, logo_path: '' }));
    }
  };

  const handleDeleteBackupClick = async (file: string) => {
    const fileName = file.split('\\').pop() || file;
    if (confirm(`Are you sure you want to permanently delete backup snapshot:\n\n${fileName}?\n\nThis cannot be undone.`)) {
      if (onDeleteBackup) {
        setIsDeletingBackup(file);
        try {
          await onDeleteBackup(file);
        } finally {
          setIsDeletingBackup(null);
        }
      }
    }
  };

  const handleEmptyBinClick = async () => {
    if (
      confirm(
        'PERMANENT ACTION:\n\nAre you sure you want to empty the Recycle Bin?\n\nAll deleted customers and products will be permanently erased from SQLite storage.'
      )
    ) {
      if (onEmptyRecycleBin) {
        setIsEmptyingBin(true);
        try {
          await onEmptyRecycleBin();
          alert('Recycle Bin has been emptied permanently.');
        } finally {
          setIsEmptyingBin(false);
        }
      }
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinForm || pinForm.length < 4) {
      alert('Security PIN must be at least 4 digits.');
      return;
    }
    if (onSaveAuthSettings) {
      await onSaveAuthSettings({ email: emailForm, pin: pinForm });
      setSecuritySuccess(true);
      setTimeout(() => setSecuritySuccess(false), 4000);
    }
  };

  const handleExportDbClick = async () => {
    if (onExportDatabase) {
      setIsExportingDb(true);
      try {
        await onExportDatabase();
      } finally {
        setIsExportingDb(false);
      }
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content && onImportDatabase) {
        if (
          confirm(
            `Import database from "${file.name}"?\n\nThis will restore all customer accounts, deliveries, and ledger records on this device with the imported backup.`
          )
        ) {
          const ok = await onImportDatabase(content);
          if (ok) {
            alert('Database imported successfully! Application refreshed.');
          }
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearDummyClick = async () => {
    if (
      !confirm(
        'START CLEAN SYSTEM:\n\nThis will remove all sample/dummy customers, deliveries, payments, and ledger entries from this device.\n\nYour agency profile and products will be preserved so you can enter real customer data. Proceed?'
      )
    ) {
      return;
    }
    if (onClearDummyData) {
      setIsClearingDummy(true);
      try {
        await onClearDummyData();
      } finally {
        setIsClearingDummy(false);
      }
    }
  };

  const currentDisplayLogo = agencyForm.logo_path || AGENCY_LOGO_BASE64;

  return (
    <div className="space-y-6 max-w-4xl font-poppins">
      {/* Settings Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-normal">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Tab 1: Agency Profile & Logo */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-semibold">Business Profile & Agency Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveAgency} className="space-y-5">
              {/* Agency Logo Management Block */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Agency Logo (Appears on Delivery Slips & Statements)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-slate-300 shrink-0 shadow-sm flex items-center justify-center">
                    <img
                      src={currentDisplayLogo}
                      alt="Agency Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Custom Logo
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleDeleteLogo}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Logo
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended: High resolution circular PNG or JPG. Deleting resets to the default agency crest.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Agency Name"
                  value={agencyForm.agency_name}
                  onChange={(e) => setAgencyForm({ ...agencyForm, agency_name: e.target.value })}
                  required
                />
                <Input
                  label="Owner Name"
                  value={agencyForm.owner_name}
                  onChange={(e) => setAgencyForm({ ...agencyForm, owner_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Mobile / WhatsApp (Printed on Slips)"
                  value={agencyForm.mobile || ''}
                  onChange={(e) => setAgencyForm({ ...agencyForm, mobile: e.target.value })}
                  required
                />
                <Input
                  label="GSTIN (Optional)"
                  placeholder="e.g. 27AAICV6354P1ZH"
                  value={agencyForm.receipt_gst || ''}
                  onChange={(e) => setAgencyForm({ ...agencyForm, receipt_gst: e.target.value })}
                />
              </div>

              <Input
                label="Full Address (Printed on Invoices & Slips)"
                value={agencyForm.address || ''}
                onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Receipt Sub-Header / Tagline"
                  placeholder="e.g. FARMERS PRODUCER COMPANY LTD."
                  value={agencyForm.receipt_brand_line || ''}
                  onChange={(e) => setAgencyForm({ ...agencyForm, receipt_brand_line: e.target.value })}
                />
                <Input
                  label="Default Receipt Footer Note"
                  placeholder="e.g. Thank you for doing business with us."
                  value={agencyForm.default_receipt_footer || ''}
                  onChange={(e) => setAgencyForm({ ...agencyForm, default_receipt_footer: e.target.value })}
                />
              </div>

              {/* Bill & Receipt Theme Color (RGB Selector) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Bill & Receipt Header Color (RGB Selector)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Customize the color of the "Amount due" top header strip printed on delivery slips and statements.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Left: Color Picker & Presets */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          id="bill-header-color"
                          value={agencyForm.receipt_header_color || '#00A8E8'}
                          onChange={(e) =>
                            setAgencyForm({ ...agencyForm, receipt_header_color: e.target.value })
                          }
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200 p-0.5 bg-white shadow-2xs"
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor="bill-header-color"
                          className="text-[11px] font-medium text-slate-600 block mb-1"
                        >
                          RGB / Hex Color Code
                        </label>
                        <input
                          type="text"
                          value={agencyForm.receipt_header_color || '#00A8E8'}
                          onChange={(e) =>
                            setAgencyForm({ ...agencyForm, receipt_header_color: e.target.value })
                          }
                          placeholder="#00A8E8"
                          className="w-full px-3 py-1.5 font-mono text-xs font-semibold uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1.5 focus:ring-blue-500 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Color Swatches */}
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                        Quick Preset Colors
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: 'Sky Blue (Default)', hex: '#00A8E8' },
                          { label: 'Royal Blue', hex: '#2563EB' },
                          { label: 'Emerald Green', hex: '#059669' },
                          { label: 'Deep Teal', hex: '#0D9488' },
                          { label: 'Royal Purple', hex: '#7C3AED' },
                          { label: 'Crimson Red', hex: '#DC2626' },
                          { label: 'Warm Amber', hex: '#D97706' },
                          { label: 'Dark Slate', hex: '#1E293B' },
                        ].map((preset) => {
                          const isSelected =
                            (agencyForm.receipt_header_color || '#00A8E8').toLowerCase() ===
                            preset.hex.toLowerCase();
                          return (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() =>
                                setAgencyForm({ ...agencyForm, receipt_header_color: preset.hex })
                              }
                              title={preset.label}
                              style={{ backgroundColor: preset.hex }}
                              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer shadow-2xs hover:scale-110 ${
                                isSelected ? 'border-slate-900 scale-110 ring-2 ring-blue-400' : 'border-white'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Realistic Receipt Banner Preview */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white">
                    <div
                      style={{ backgroundColor: agencyForm.receipt_header_color || '#00A8E8' }}
                      className="text-white text-center py-3.5 px-4 transition-colors"
                    >
                      <p className="text-[11px] font-normal opacity-95">Amount due</p>
                      <h2 className="text-xl font-bold tracking-tight mt-0.5 font-mono">
                        Rs. 1,090.00
                      </h2>
                    </div>
                    <div className="px-3 py-2 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                      <span className="font-medium">Live Receipt Header Preview</span>
                      <span className="font-mono font-bold text-slate-700">
                        {agencyForm.receipt_header_color || '#00A8E8'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Encrypted Backups & Deletion */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-sky-600" />
                  <span>SQLite & SQLCipher Diagnostics</span>
                </CardTitle>
                <Badge variant="success" size="sm">
                  {databaseStatus?.encryption_enabled ? 'Encrypted AES-256' : 'Local SQLite'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs font-normal">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-normal">Database File Path</span>
                <span className="font-mono text-slate-700 truncate max-w-md">
                  {databaseStatus?.database_path || 'milk_agency.db'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-normal">Schema Migration Version</span>
                <span className="font-mono font-medium text-slate-800">
                  v{databaseStatus?.schema_version || 3}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-normal">Key Storage Mode</span>
                <span className="font-mono text-emerald-600 font-medium">
                  {databaseStatus?.key_store || 'system-keychain'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Device Data Portability Card */}
          <Card className="border-blue-200 bg-blue-50/20 shadow-xs">
            <CardHeader className="border-b border-blue-100">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-blue-900">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Multi-Device Sync & Database Portability</span>
                </CardTitle>
                <Badge variant="success" size="sm">
                  Device Local Storage Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <p className="text-xs text-slate-600">
                Your agency database is stored directly on this device. When switching to another mobile phone, tablet, or PC, export your complete database backup (.milkdb) and import it on your new device to continue seamlessly.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isExportingDb}
                  onClick={handleExportDbClick}
                  className="gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Database Backup (.milkdb)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => importFileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <FileUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Import Database from Other Device</span>
                </Button>
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".milkdb,.json"
                  className="hidden"
                  onChange={handleImportFileChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Backup Action & Archive List with Delete Option */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs font-semibold">Local Backup Snapshots</CardTitle>
                <Button size="sm" variant="primary" onClick={onTriggerBackup}>
                  <HardDrive className="w-3.5 h-3.5" /> Create Backup Now
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {backupFiles.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-normal">
                  No backup archives found. Click "Create Backup Now" to create an encrypted database copy.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {backupFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60">
                      <div>
                        <p className="text-xs font-mono font-medium text-slate-800">{file.split('\\').pop()}</p>
                        <p className="text-[11px] text-slate-400 font-normal">Encrypted SQLite snapshot</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Restore from this backup? Your current database will be archived before restoring.')) {
                              onRestoreBackup(file);
                            }
                          }}
                        >
                          <RefreshCw className="w-3 h-3" /> Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={isDeletingBackup === file}
                          onClick={() => handleDeleteBackupClick(file)}
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Security & PIN & User Credentials */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Application Security & Account Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-600 font-normal">
                <p className="font-medium text-slate-800 text-xs">Device Security & Credential Protection Active</p>
                <p className="mt-0.5 text-slate-500">
                  Your credentials and offline database are secured on this client device. Use this email and PIN to authenticate and unlock your application on any mobile phone or computer.
                </p>
              </div>
            </div>

            {securitySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium animate-slide-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Account credentials updated successfully! Email: {emailForm}, PIN: {pinForm}</span>
              </div>
            )}

            <form onSubmit={handleSaveSecurity} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Registered Account Email"
                  type="email"
                  value={emailForm}
                  onChange={(e) => setEmailForm(e.target.value)}
                  helperText="Primary email used for account sync & login"
                  required
                />
                <Input
                  label="Security Lock PIN (4 to 6 Digits)"
                  type="password"
                  maxLength={6}
                  value={pinForm}
                  onChange={(e) => setPinForm(e.target.value)}
                  helperText="Default PIN is 1995 (Used to unlock the screen)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Auto-Lock Inactivity Timeout">
                  <option value="5">5 Minutes</option>
                  <option value="15">15 Minutes (Recommended)</option>
                  <option value="30">30 Minutes</option>
                  <option value="never">Never (Manual lock only)</option>
                </Select>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-6">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Current user: <strong>{emailForm}</strong></span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  Save Account & Security PIN
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Data Cleanup & Danger Zone */}
      {activeTab === 'danger' && (
        <div className="space-y-4">
          <Card className="border-rose-200 bg-rose-50/20">
            <CardHeader className="border-b border-rose-100">
              <CardTitle className="text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Data Cleanup & Permanent Deletion</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Option 1: Empty Recycle Bin */}
              <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Empty Recycle Bin Permanently</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Permanently delete all soft-deleted customers and products along with their delivery history from SQLite storage. This frees up database space.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  isLoading={isEmptyingBin}
                  onClick={handleEmptyBinClick}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Empty Recycle Bin
                </Button>
              </div>

              {/* Option 2: Delete / Reset Agency Logo */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Reset Agency Logo</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Removes any custom uploaded business logo and resets all printed receipts back to the official agency badge.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteLogo}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Reset Logo
                </Button>
              </div>

              {/* Option 3: Start Clean System (Remove Dummy Data) */}
              {onClearDummyData && (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Start Clean System (Remove Dummy Data)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 max-w-md">
                      Clears all sample test customers, deliveries, payments, and ledger entries from your device storage so you can start recording real agency operations. Your agency profile and product catalog remain saved.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={isClearingDummy}
                    onClick={handleClearDummyClick}
                    className="border-amber-300 text-amber-800 hover:bg-amber-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Dummy Data
                  </Button>
                </div>
              )}

              {/* Option 4: Reload 10 Products & 30 Customers Test Data */}
              {onReloadDummyData && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Reload Test Data (10 Products & 30 Customers)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 max-w-md">
                      Populates 10 dairy products (Cow milk, Buffalo milk, Curd, Ghee, Paneer, Lassi) and 30 customer delivery accounts with active subscriptions, routes, and ledger balances for testing.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Load sample test data (10 dairy products and 30 customer accounts with routes & balances)?')) {
                        await onReloadDummyData();
                      }
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reload Test Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
