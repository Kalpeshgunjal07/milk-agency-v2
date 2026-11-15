export type UnitType = 'Litre' | 'Millilitre' | 'Kilogram' | 'Gram' | 'Piece' | 'Packet';

export type DeliveryStatus = 'draft' | 'confirmed' | 'skipped' | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';

export type LedgerTransactionType = 'delivery' | 'payment' | 'opening_balance' | 'adjustment' | 'reversal';

export type CustomerStatus = 'active' | 'inactive';

export type ProductStatus = 'active' | 'inactive';

export type ScheduleStatus = 'active' | 'paused' | 'inactive';

export type SessionType = 'morning' | 'evening';

export type ViewName = 
  | 'dashboard' 
  | 'customers' 
  | 'products' 
  | 'schedules' 
  | 'deliveries' 
  | 'ledger' 
  | 'payments' 
  | 'billing' 
  | 'reports' 
  | 'settings'
  | 'bin';
