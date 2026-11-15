import { CustomerRecord, ProductRecord, DeliveryScheduleRecord, LedgerEntryRecord, DeliveryRecord, PaymentRecord } from '../types/models';

export const DUMMY_PRODUCTS: ProductRecord[] = [
  {
    id: 1,
    product_code: 'MILK-COW-500',
    name: 'Cow Milk 500ml',
    category: 'Milk',
    unit: 'Packet',
    default_selling_price: 3000, // ₹30.00
    cost_price: 2400,
    description: 'Fresh cow milk pouch 500ml (A2 cow milk)',
    status: 'active',
  },
  {
    id: 2,
    product_code: 'MILK-COW-1L',
    name: 'Fresh Cow Milk 1L',
    category: 'Milk',
    unit: 'Litre',
    default_selling_price: 6000, // ₹60.00
    cost_price: 4800,
    description: 'Fresh farm cow milk (A2 quality)',
    status: 'active',
  },
  {
    id: 3,
    product_code: 'MILK-BUFF-500',
    name: 'Buffalo Milk 500ml',
    category: 'Milk',
    unit: 'Packet',
    default_selling_price: 3800, // ₹38.00
    cost_price: 3100,
    description: 'Rich buffalo milk pouch 500ml',
    status: 'active',
  },
  {
    id: 4,
    product_code: 'MILK-BUFF-1L',
    name: 'Buffalo Milk Rich 1L',
    category: 'Milk',
    unit: 'Litre',
    default_selling_price: 7500, // ₹75.00
    cost_price: 6200,
    description: 'High fat creamy buffalo milk (7.0+ Fat)',
    status: 'active',
  },
  {
    id: 5,
    product_code: 'MILK-TONED',
    name: 'Toned Milk 200ml',
    category: 'Milk',
    unit: 'Packet',
    default_selling_price: 1500, // ₹15.00
    cost_price: 1200,
    description: 'Low fat pasteurized toned milk pouch',
    status: 'active',
  },
  {
    id: 6,
    product_code: 'DAHI-200G',
    name: 'Rajuri Dahi 200gm',
    category: 'Curd',
    unit: 'Packet',
    default_selling_price: 2000, // ₹20.00
    cost_price: 1500,
    description: 'Thick natural set curd cup 200g',
    status: 'active',
  },
  {
    id: 7,
    product_code: 'DAHI-500G',
    name: 'Rajuri Dahi 500gm Pouch',
    category: 'Curd',
    unit: 'Packet',
    default_selling_price: 4500, // ₹45.00
    cost_price: 3500,
    description: 'Homogenized fresh curd 500g pouch',
    status: 'active',
  },
  {
    id: 8,
    product_code: 'PANEER-FRESH',
    name: 'Fresh Malai Paneer',
    category: 'Paneer',
    unit: 'Kilogram',
    default_selling_price: 38000, // ₹380.00
    cost_price: 31000,
    description: 'Soft artisanal fresh malai paneer',
    status: 'active',
  },
  {
    id: 9,
    product_code: 'GHEE-COW-1L',
    name: 'Pure Desi Cow Ghee 1L',
    category: 'Ghee',
    unit: 'Litre',
    default_selling_price: 65000, // ₹650.00
    cost_price: 52000,
    description: 'Traditional bilona desi cow ghee glass jar',
    status: 'active',
  },
  {
    id: 10,
    product_code: 'LASSI-SWEET',
    name: 'Rajuri Sweet Lassi 200ml',
    category: 'Beverages',
    unit: 'Piece',
    default_selling_price: 2500, // ₹25.00
    cost_price: 1800,
    description: 'Chilled sweetened cardamom lassi cup',
    status: 'active',
  },
];

export const DUMMY_CUSTOMERS: CustomerRecord[] = [
  {
    id: 1,
    customer_code: 'CUST-101',
    name: 'Rahul Sharma',
    mobile: '9823012345',
    address: 'Bazar Peth, Near Ganpati Temple, Rajuri',
    route_area: 'Bazar Peth',
    joining_date: '2026-01-10',
    opening_balance: 45000, // ₹450.00 Due
    notes: 'Morning delivery by 6:30 AM',
    status: 'active',
  },
  {
    id: 2,
    customer_code: 'CUST-102',
    name: 'Priya Verma',
    mobile: '9823067890',
    address: 'Shree Colony, Flat 4, Rajuri',
    route_area: 'Shree Colony',
    joining_date: '2026-01-15',
    opening_balance: 0,
    notes: 'Leave bag at door',
    status: 'active',
  },
  {
    id: 3,
    customer_code: 'CUST-103',
    name: 'Amit Gupta',
    mobile: '9823099887',
    address: 'Station Road, Plot 12, Junnar',
    route_area: 'Station Road',
    joining_date: '2026-02-01',
    opening_balance: 120000, // ₹1,200.00 Due
    notes: 'Monthly settlement on 1st',
    status: 'active',
  },
  {
    id: 4,
    customer_code: 'CUST-104',
    name: 'Aniket Korade',
    mobile: '8600732906',
    address: 'Krushivaibhav, A/P-Rajuri, Junnar',
    route_area: 'Bazar Peth',
    joining_date: '2026-02-15',
    opening_balance: 360553, // ₹3,605.53 Due
    notes: 'Send digital slip on WhatsApp',
    status: 'active',
  },
  {
    id: 5,
    customer_code: 'CUST-105',
    name: 'Sunita Patil',
    mobile: '9766691122',
    address: 'Shivaji Nagar, Lane 3, House 18',
    route_area: 'Shivaji Nagar',
    joining_date: '2026-02-18',
    opening_balance: -50000, // ₹500.00 Advance
    notes: 'Paid 1 month advance via UPI',
    status: 'active',
  },
  {
    id: 6,
    customer_code: 'CUST-106',
    name: 'Ganesh Deshmukh',
    mobile: '9890123456',
    address: 'Bazar Peth, Deshmukh Wada, Rajuri',
    route_area: 'Bazar Peth',
    joining_date: '2026-03-01',
    opening_balance: 85000, // ₹850.00 Due
    notes: 'Ring doorbell once',
    status: 'active',
  },
  {
    id: 7,
    customer_code: 'CUST-107',
    name: 'Kavita Shinde',
    mobile: '9890234567',
    address: 'Shree Colony, Building B-12',
    route_area: 'Shree Colony',
    joining_date: '2026-03-05',
    opening_balance: 0,
    notes: 'Daily 1L Cow Milk',
    status: 'active',
  },
  {
    id: 8,
    customer_code: 'CUST-108',
    name: 'Deepak Joshi',
    mobile: '9890345678',
    address: 'Gandhi Chowk, Near Post Office',
    route_area: 'Gandhi Chowk',
    joining_date: '2026-03-10',
    opening_balance: 220000, // ₹2,200.00 Due
    notes: 'Pay by GooglePay',
    status: 'active',
  },
  {
    id: 9,
    customer_code: 'CUST-109',
    name: 'Pooja Kulkarni',
    mobile: '9890456789',
    address: 'Station Road, Silver Oak Apts, Flat 301',
    route_area: 'Station Road',
    joining_date: '2026-03-12',
    opening_balance: 60000, // ₹600.00 Due
    notes: 'Evening delivery preferred',
    status: 'active',
  },
  {
    id: 10,
    customer_code: 'CUST-110',
    name: 'Sachin Pawar',
    mobile: '9890567890',
    address: 'Shivaji Nagar, Plot 45, Rajuri',
    route_area: 'Shivaji Nagar',
    joining_date: '2026-03-15',
    opening_balance: 0,
    notes: 'Sunday double milk requirement',
    status: 'active',
  },
  {
    id: 11,
    customer_code: 'CUST-111',
    name: 'Meena More',
    mobile: '9890678901',
    address: 'Market Yard, Shop 8, Bakery Center',
    route_area: 'Market Yard',
    joining_date: '2026-03-18',
    opening_balance: 150000, // ₹1,500.00 Due
    notes: 'Commercial bakery account',
    status: 'active',
  },
  {
    id: 12,
    customer_code: 'CUST-112',
    name: 'Nitin Jadhav',
    mobile: '9890789012',
    address: 'College Road, Near Arts College',
    route_area: 'College Road',
    joining_date: '2026-03-20',
    opening_balance: -30000, // ₹300.00 Advance
    notes: 'Advance deposit received',
    status: 'active',
  },
  {
    id: 13,
    customer_code: 'CUST-113',
    name: 'Snehal Gaikwad',
    mobile: '9890890123',
    address: 'Bazar Peth, Near Bank of Maharashtra',
    route_area: 'Bazar Peth',
    joining_date: '2026-03-22',
    opening_balance: 40000, // ₹400.00 Due
    notes: 'Morning shift only',
    status: 'active',
  },
  {
    id: 14,
    customer_code: 'CUST-114',
    name: 'Vikas Chavan',
    mobile: '9890901234',
    address: 'Shree Colony, Bunglow 9',
    route_area: 'Shree Colony',
    joining_date: '2026-03-25',
    opening_balance: 0,
    notes: 'Fresh curd on weekend',
    status: 'active',
  },
  {
    id: 15,
    customer_code: 'CUST-115',
    name: 'Archana Kale',
    mobile: '9822112233',
    address: 'Gandhi Chowk, Kale Niwas',
    route_area: 'Gandhi Chowk',
    joining_date: '2026-04-01',
    opening_balance: 95000, // ₹950.00 Due
    notes: 'Call before delivery',
    status: 'active',
  },
  {
    id: 16,
    customer_code: 'CUST-116',
    name: 'Ramesh Wagh',
    mobile: '9822223344',
    address: 'Market Yard, Gala No 14, Hotel Wagh',
    route_area: 'Market Yard',
    joining_date: '2026-04-05',
    opening_balance: 350000, // ₹3,500.00 Due
    notes: 'Hotel supply (Daily 4L Buffalo)',
    status: 'active',
  },
  {
    id: 17,
    customer_code: 'CUST-117',
    name: 'Swati Jagtap',
    mobile: '9822334455',
    address: 'Station Road, Anand Nagar, Row House 2',
    route_area: 'Station Road',
    joining_date: '2026-04-08',
    opening_balance: 0,
    notes: 'Daily 2L Buffalo milk',
    status: 'active',
  },
  {
    id: 18,
    customer_code: 'CUST-118',
    name: 'Sanjay Thorat',
    mobile: '9822445566',
    address: 'College Road, Thorat Villa',
    route_area: 'College Road',
    joining_date: '2026-04-10',
    opening_balance: 110000, // ₹1,100.00 Due
    notes: 'Pay weekly on Monday',
    status: 'active',
  },
  {
    id: 19,
    customer_code: 'CUST-119',
    name: 'Manisha Tambe',
    mobile: '9822556677',
    address: 'Shivaji Nagar, Gulmohar Society, B-4',
    route_area: 'Shivaji Nagar',
    joining_date: '2026-04-12',
    opening_balance: -20000, // ₹200.00 Advance
    notes: 'Online payment via PhonePe',
    status: 'active',
  },
  {
    id: 20,
    customer_code: 'CUST-120',
    name: 'Rohan Bhise',
    mobile: '9822667788',
    address: 'Bazar Peth, Bhise Gali',
    route_area: 'Bazar Peth',
    joining_date: '2026-04-15',
    opening_balance: 75000, // ₹750.00 Due
    notes: 'Evening 1L Cow Milk',
    status: 'active',
  },
  {
    id: 21,
    customer_code: 'CUST-121',
    name: 'Vandana Salunkhe',
    mobile: '9822778899',
    address: 'Shree Colony, Flat 102, Sai Vihar',
    route_area: 'Shree Colony',
    joining_date: '2026-04-18',
    opening_balance: 0,
    notes: 'No doorbell, gate unlocked',
    status: 'active',
  },
  {
    id: 22,
    customer_code: 'CUST-122',
    name: 'Kiran Dhumal',
    mobile: '9822889900',
    address: 'Market Yard, Dhumal Sweet Mart',
    route_area: 'Market Yard',
    joining_date: '2026-04-20',
    opening_balance: 480000, // ₹4,800.00 Due
    notes: 'Bulk paneer & buffalo milk customer',
    status: 'active',
  },
  {
    id: 23,
    customer_code: 'CUST-123',
    name: 'Jyoti Gholap',
    mobile: '9822990011',
    address: 'Gandhi Chowk, Gholap Wada',
    route_area: 'Gandhi Chowk',
    joining_date: '2026-04-22',
    opening_balance: 130000, // ₹1,300.00 Due
    notes: 'Monthly settlement on 10th',
    status: 'active',
  },
  {
    id: 24,
    customer_code: 'CUST-124',
    name: 'Mahesh Bhor',
    mobile: '9833001122',
    address: 'Station Road, Om Residency, Flat 204',
    route_area: 'Station Road',
    joining_date: '2026-04-25',
    opening_balance: 0,
    notes: 'Fresh cow milk only',
    status: 'active',
  },
  {
    id: 25,
    customer_code: 'CUST-125',
    name: 'Pallavi Landge',
    mobile: '9833112233',
    address: 'College Road, Green Acres, Bunglow 5',
    route_area: 'College Road',
    joining_date: '2026-05-01',
    opening_balance: -100000, // ₹1,000.00 Advance
    notes: 'Monthly advance deposited',
    status: 'active',
  },
  {
    id: 26,
    customer_code: 'CUST-126',
    name: 'Ajit Gunjal',
    mobile: '9833223344',
    address: 'Shivaji Nagar, Gunjal Niwas',
    route_area: 'Shivaji Nagar',
    joining_date: '2026-05-05',
    opening_balance: 55000, // ₹550.00 Due
    notes: 'Morning 1.5L Cow Milk',
    status: 'active',
  },
  {
    id: 27,
    customer_code: 'CUST-127',
    name: 'Varsha Bankar',
    mobile: '9833334455',
    address: 'Bazar Peth, Near Fish Market',
    route_area: 'Bazar Peth',
    joining_date: '2026-05-08',
    opening_balance: 0,
    notes: 'Alternate day delivery schedule',
    status: 'active',
  },
  {
    id: 28,
    customer_code: 'CUST-128',
    name: 'Pravin Nalawade',
    mobile: '9833445566',
    address: 'Shree Colony, Wing A, Flat 12',
    route_area: 'Shree Colony',
    joining_date: '2026-05-10',
    opening_balance: 180000, // ₹1,800.00 Due
    notes: 'Pending payment from last month',
    status: 'active',
  },
  {
    id: 29,
    customer_code: 'CUST-129',
    name: 'Anita Sonawane',
    mobile: '9833556677',
    address: 'Market Yard, Sonawane Tea Center',
    route_area: 'Market Yard',
    joining_date: '2026-05-12',
    opening_balance: 290000, // ₹2,900.00 Due
    notes: 'Tea stall daily 5L Buffalo milk',
    status: 'active',
  },
  {
    id: 30,
    customer_code: 'CUST-130',
    name: 'Yogesh Mule',
    mobile: '9833667788',
    address: 'Gandhi Chowk, Mule Sadan, 2nd Floor',
    route_area: 'Gandhi Chowk',
    joining_date: '2026-05-15',
    opening_balance: 42000, // ₹420.00 Due
    notes: 'Pay via UPI QR code',
    status: 'active',
  },
];

// Subscriptions for customers so Daily Deliveries sheet is populated across all routes
export const DUMMY_SCHEDULES: DeliveryScheduleRecord[] = [
  { id: 1, customer_id: 1, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-01-10', status: 'active' },
  { id: 2, customer_id: 2, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-01-15', status: 'active' },
  { id: 3, customer_id: 3, product_id: 4, quantity: 1.5, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-02-01', status: 'active' },
  { id: 4, customer_id: 4, product_id: 2, quantity: 2, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-02-15', status: 'active' },
  { id: 5, customer_id: 4, product_id: 6, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-02-15', status: 'active' },
  { id: 6, customer_id: 5, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-02-18', status: 'active' },
  { id: 7, customer_id: 6, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-01', status: 'active' },
  { id: 8, customer_id: 7, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-05', status: 'active' },
  { id: 9, customer_id: 8, product_id: 4, quantity: 2, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-10', status: 'active' },
  { id: 10, customer_id: 9, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-12', status: 'active' },
  { id: 11, customer_id: 10, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-15', status: 'active' },
  { id: 12, customer_id: 11, product_id: 2, quantity: 3, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-18', status: 'active' },
  { id: 13, customer_id: 12, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-20', status: 'active' },
  { id: 14, customer_id: 13, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-22', status: 'active' },
  { id: 15, customer_id: 14, product_id: 3, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-03-25', status: 'active' },
  { id: 16, customer_id: 15, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-01', status: 'active' },
  { id: 17, customer_id: 16, product_id: 4, quantity: 4, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-05', status: 'active' },
  { id: 18, customer_id: 17, product_id: 4, quantity: 2, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-08', status: 'active' },
  { id: 19, customer_id: 18, product_id: 2, quantity: 1.5, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-10', status: 'active' },
  { id: 20, customer_id: 19, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-12', status: 'active' },
  { id: 21, customer_id: 20, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-15', status: 'active' },
  { id: 22, customer_id: 21, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-18', status: 'active' },
  { id: 23, customer_id: 22, product_id: 4, quantity: 5, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-20', status: 'active' },
  { id: 24, customer_id: 22, product_id: 8, quantity: 1, delivery_days: 'mon,wed,fri', start_date: '2026-04-20', status: 'active' },
  { id: 25, customer_id: 23, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-22', status: 'active' },
  { id: 26, customer_id: 24, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-04-25', status: 'active' },
  { id: 27, customer_id: 25, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-05-01', status: 'active' },
  { id: 28, customer_id: 26, product_id: 2, quantity: 1.5, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-05-05', status: 'active' },
  { id: 29, customer_id: 27, product_id: 1, quantity: 1, delivery_days: 'mon,wed,fri', start_date: '2026-05-08', status: 'active' },
  { id: 30, customer_id: 28, product_id: 2, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-05-10', status: 'active' },
  { id: 31, customer_id: 29, product_id: 4, quantity: 5, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-05-12', status: 'active' },
  { id: 32, customer_id: 30, product_id: 1, quantity: 1, delivery_days: 'mon,tue,wed,thu,fri,sat,sun', start_date: '2026-05-15', status: 'active' },
];

// Initial ledger entries generated from customer opening balances
export const DUMMY_LEDGER: LedgerEntryRecord[] = [
  {
    "id": 1,
    "customer_id": 1,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 45000,
    "credit_amount": 0,
    "running_balance": 45000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 2,
    "customer_id": 1,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 1,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 51000,
    "reference": "DEL-1",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 3,
    "customer_id": 1,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 32,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 57000,
    "reference": "DEL-32",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 4,
    "customer_id": 1,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 64,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 63000,
    "reference": "DEL-64",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 5,
    "customer_id": 1,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 95,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 69000,
    "reference": "DEL-95",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 6,
    "customer_id": 1,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 127,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 75000,
    "reference": "DEL-127",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 7,
    "customer_id": 1,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 2,
    "description": "Payment received via CASH",
    "debit_amount": 0,
    "credit_amount": 45000,
    "running_balance": 30000,
    "reference": "PAY-2",
    "created_at": "2026-11-14T12:00:00Z"
  },
  {
    "id": 8,
    "customer_id": 1,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 158,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 36000,
    "reference": "DEL-158",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 9,
    "customer_id": 2,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 10,
    "customer_id": 2,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 2,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-2",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 11,
    "customer_id": 2,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 33,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-33",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 12,
    "customer_id": 2,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 65,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-65",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 13,
    "customer_id": 2,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 96,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-96",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 14,
    "customer_id": 2,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 128,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-128",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 15,
    "customer_id": 2,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 159,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-159",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 16,
    "customer_id": 3,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 120000,
    "credit_amount": 0,
    "running_balance": 120000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 17,
    "customer_id": 3,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 3,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 11250,
    "credit_amount": 0,
    "running_balance": 131250,
    "reference": "DEL-3",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 18,
    "customer_id": 3,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 34,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 11250,
    "credit_amount": 0,
    "running_balance": 142500,
    "reference": "DEL-34",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 19,
    "customer_id": 3,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 66,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 11250,
    "credit_amount": 0,
    "running_balance": 153750,
    "reference": "DEL-66",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 20,
    "customer_id": 3,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 97,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 11250,
    "credit_amount": 0,
    "running_balance": 165000,
    "reference": "DEL-97",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 21,
    "customer_id": 3,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 129,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 11250,
    "credit_amount": 0,
    "running_balance": 176250,
    "reference": "DEL-129",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 22,
    "customer_id": 3,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 160,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 11250,
    "credit_amount": 0,
    "running_balance": 187500,
    "reference": "DEL-160",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 23,
    "customer_id": 4,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 50000,
    "running_balance": -50000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 24,
    "customer_id": 4,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 4,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 14000,
    "credit_amount": 0,
    "running_balance": -36000,
    "reference": "DEL-4",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 25,
    "customer_id": 4,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 35,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 14000,
    "credit_amount": 0,
    "running_balance": -22000,
    "reference": "DEL-35",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 26,
    "customer_id": 4,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 67,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 14000,
    "credit_amount": 0,
    "running_balance": -8000,
    "reference": "DEL-67",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 27,
    "customer_id": 4,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 98,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 14000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-98",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 28,
    "customer_id": 4,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 130,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 14000,
    "credit_amount": 0,
    "running_balance": 20000,
    "reference": "DEL-130",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 29,
    "customer_id": 4,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 1,
    "description": "Payment received via UPI",
    "debit_amount": 0,
    "credit_amount": 150000,
    "running_balance": -130000,
    "reference": "PAY-1",
    "created_at": "2026-11-14T12:00:00Z"
  },
  {
    "id": 30,
    "customer_id": 4,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 161,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 14000,
    "credit_amount": 0,
    "running_balance": -116000,
    "reference": "DEL-161",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 31,
    "customer_id": 5,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 32,
    "customer_id": 5,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 5,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-5",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 33,
    "customer_id": 5,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 36,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-36",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 34,
    "customer_id": 5,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 68,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-68",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 35,
    "customer_id": 5,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 99,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-99",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 36,
    "customer_id": 5,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 131,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-131",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 37,
    "customer_id": 5,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 162,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-162",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 38,
    "customer_id": 6,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 60000,
    "credit_amount": 0,
    "running_balance": 60000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 39,
    "customer_id": 6,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 6,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 66000,
    "reference": "DEL-6",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 40,
    "customer_id": 6,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 37,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 72000,
    "reference": "DEL-37",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 41,
    "customer_id": 6,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 69,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 78000,
    "reference": "DEL-69",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 42,
    "customer_id": 6,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 100,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 84000,
    "reference": "DEL-100",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 43,
    "customer_id": 6,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 132,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 90000,
    "reference": "DEL-132",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 44,
    "customer_id": 6,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 163,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 96000,
    "reference": "DEL-163",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 45,
    "customer_id": 7,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 46,
    "customer_id": 7,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 7,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-7",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 47,
    "customer_id": 7,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 38,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-38",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 48,
    "customer_id": 7,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 70,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-70",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 49,
    "customer_id": 7,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 101,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-101",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 50,
    "customer_id": 7,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 133,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-133",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 51,
    "customer_id": 7,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 164,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 21000,
    "reference": "DEL-164",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 52,
    "customer_id": 8,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 95000,
    "credit_amount": 0,
    "running_balance": 95000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 53,
    "customer_id": 8,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 8,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 110000,
    "reference": "DEL-8",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 54,
    "customer_id": 8,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 39,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 125000,
    "reference": "DEL-39",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 55,
    "customer_id": 8,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 71,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 140000,
    "reference": "DEL-71",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 56,
    "customer_id": 8,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 102,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 155000,
    "reference": "DEL-102",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 57,
    "customer_id": 8,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 134,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 170000,
    "reference": "DEL-134",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 58,
    "customer_id": 8,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 4,
    "description": "Payment received via UPI",
    "debit_amount": 0,
    "credit_amount": 100000,
    "running_balance": 70000,
    "reference": "PAY-4",
    "created_at": "2026-11-14T12:00:00Z"
  },
  {
    "id": 59,
    "customer_id": 8,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 165,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 85000,
    "reference": "DEL-165",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 60,
    "customer_id": 9,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 30000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 61,
    "customer_id": 9,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 9,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 36000,
    "reference": "DEL-9",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 62,
    "customer_id": 9,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 40,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 42000,
    "reference": "DEL-40",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 63,
    "customer_id": 9,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 72,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 48000,
    "reference": "DEL-72",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 64,
    "customer_id": 9,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 103,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 54000,
    "reference": "DEL-103",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 65,
    "customer_id": 9,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 135,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 60000,
    "reference": "DEL-135",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 66,
    "customer_id": 9,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 166,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 66000,
    "reference": "DEL-166",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 67,
    "customer_id": 10,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 68,
    "customer_id": 10,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 10,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-10",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 69,
    "customer_id": 10,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 41,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-41",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 70,
    "customer_id": 10,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 73,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-73",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 71,
    "customer_id": 10,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 104,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-104",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 72,
    "customer_id": 10,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 136,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-136",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 73,
    "customer_id": 10,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 167,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-167",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 74,
    "customer_id": 11,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 150000,
    "credit_amount": 0,
    "running_balance": 150000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 75,
    "customer_id": 11,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 11,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 18000,
    "credit_amount": 0,
    "running_balance": 168000,
    "reference": "DEL-11",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 76,
    "customer_id": 11,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 42,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 18000,
    "credit_amount": 0,
    "running_balance": 186000,
    "reference": "DEL-42",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 77,
    "customer_id": 11,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 74,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 18000,
    "credit_amount": 0,
    "running_balance": 204000,
    "reference": "DEL-74",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 78,
    "customer_id": 11,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 105,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 18000,
    "credit_amount": 0,
    "running_balance": 222000,
    "reference": "DEL-105",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 79,
    "customer_id": 11,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 5,
    "description": "Payment received via UPI",
    "debit_amount": 0,
    "credit_amount": 100000,
    "running_balance": 122000,
    "reference": "PAY-5",
    "created_at": "2026-11-13T12:00:00Z"
  },
  {
    "id": 80,
    "customer_id": 11,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 137,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 18000,
    "credit_amount": 0,
    "running_balance": 140000,
    "reference": "DEL-137",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 81,
    "customer_id": 11,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 168,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 18000,
    "credit_amount": 0,
    "running_balance": 158000,
    "reference": "DEL-168",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 82,
    "customer_id": 12,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 83,
    "customer_id": 12,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 12,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-12",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 84,
    "customer_id": 12,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 43,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-43",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 85,
    "customer_id": 12,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 75,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-75",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 86,
    "customer_id": 12,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 106,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-106",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 87,
    "customer_id": 12,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 138,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-138",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 88,
    "customer_id": 12,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 169,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-169",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 89,
    "customer_id": 13,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 45000,
    "credit_amount": 0,
    "running_balance": 45000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 90,
    "customer_id": 13,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 13,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 51000,
    "reference": "DEL-13",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 91,
    "customer_id": 13,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 44,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 57000,
    "reference": "DEL-44",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 92,
    "customer_id": 13,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 76,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 63000,
    "reference": "DEL-76",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 93,
    "customer_id": 13,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 107,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 69000,
    "reference": "DEL-107",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 94,
    "customer_id": 13,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 139,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 75000,
    "reference": "DEL-139",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 95,
    "customer_id": 13,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 170,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 81000,
    "reference": "DEL-170",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 96,
    "customer_id": 14,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 75000,
    "credit_amount": 0,
    "running_balance": 75000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 97,
    "customer_id": 14,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 14,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3800,
    "credit_amount": 0,
    "running_balance": 78800,
    "reference": "DEL-14",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 98,
    "customer_id": 14,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 45,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3800,
    "credit_amount": 0,
    "running_balance": 82600,
    "reference": "DEL-45",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 99,
    "customer_id": 14,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 77,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3800,
    "credit_amount": 0,
    "running_balance": 86400,
    "reference": "DEL-77",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 100,
    "customer_id": 14,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 108,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3800,
    "credit_amount": 0,
    "running_balance": 90200,
    "reference": "DEL-108",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 101,
    "customer_id": 14,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 140,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3800,
    "credit_amount": 0,
    "running_balance": 94000,
    "reference": "DEL-140",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 102,
    "customer_id": 14,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 171,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3800,
    "credit_amount": 0,
    "running_balance": 97800,
    "reference": "DEL-171",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 103,
    "customer_id": 15,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 104,
    "customer_id": 15,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 15,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-15",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 105,
    "customer_id": 15,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 46,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-46",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 106,
    "customer_id": 15,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 78,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-78",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 107,
    "customer_id": 15,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 109,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-109",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 108,
    "customer_id": 15,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 141,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-141",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 109,
    "customer_id": 15,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 172,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-172",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 110,
    "customer_id": 16,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 420000,
    "credit_amount": 0,
    "running_balance": 420000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 111,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 16,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 450000,
    "reference": "DEL-16",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 112,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 17,
    "description": "Delivery charges for 2026-11-10 (Evening)",
    "debit_amount": 22500,
    "credit_amount": 0,
    "running_balance": 472500,
    "reference": "DEL-17",
    "created_at": "2026-11-10T18:00:00Z"
  },
  {
    "id": 113,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 47,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 502500,
    "reference": "DEL-47",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 114,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 48,
    "description": "Delivery charges for 2026-11-11 (Evening)",
    "debit_amount": 22500,
    "credit_amount": 0,
    "running_balance": 525000,
    "reference": "DEL-48",
    "created_at": "2026-11-11T18:00:00Z"
  },
  {
    "id": 115,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 79,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 555000,
    "reference": "DEL-79",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 116,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 80,
    "description": "Delivery charges for 2026-11-12 (Evening)",
    "debit_amount": 22500,
    "credit_amount": 0,
    "running_balance": 577500,
    "reference": "DEL-80",
    "created_at": "2026-11-12T18:00:00Z"
  },
  {
    "id": 117,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 110,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 607500,
    "reference": "DEL-110",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 118,
    "customer_id": 16,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 3,
    "description": "Payment received via BANK_TRANSFER",
    "debit_amount": 0,
    "credit_amount": 350000,
    "running_balance": 257500,
    "reference": "PAY-3",
    "created_at": "2026-11-13T12:00:00Z"
  },
  {
    "id": 119,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 111,
    "description": "Delivery charges for 2026-11-13 (Evening)",
    "debit_amount": 22500,
    "credit_amount": 0,
    "running_balance": 280000,
    "reference": "DEL-111",
    "created_at": "2026-11-13T18:00:00Z"
  },
  {
    "id": 120,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 142,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 310000,
    "reference": "DEL-142",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 121,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 143,
    "description": "Delivery charges for 2026-11-14 (Evening)",
    "debit_amount": 22500,
    "credit_amount": 0,
    "running_balance": 332500,
    "reference": "DEL-143",
    "created_at": "2026-11-14T18:00:00Z"
  },
  {
    "id": 122,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 173,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 362500,
    "reference": "DEL-173",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 123,
    "customer_id": 16,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 174,
    "description": "Delivery charges for 2026-11-15 (Evening)",
    "debit_amount": 22500,
    "credit_amount": 0,
    "running_balance": 385000,
    "reference": "DEL-174",
    "created_at": "2026-11-15T18:00:00Z"
  },
  {
    "id": 124,
    "customer_id": 17,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 125,
    "customer_id": 17,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 18,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-18",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 126,
    "customer_id": 17,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 49,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 30000,
    "reference": "DEL-49",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 127,
    "customer_id": 17,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 81,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 45000,
    "reference": "DEL-81",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 128,
    "customer_id": 17,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 112,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 60000,
    "reference": "DEL-112",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 129,
    "customer_id": 17,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 144,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 75000,
    "reference": "DEL-144",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 130,
    "customer_id": 17,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 175,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 90000,
    "reference": "DEL-175",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 131,
    "customer_id": 18,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 90000,
    "credit_amount": 0,
    "running_balance": 90000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 132,
    "customer_id": 18,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 19,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 99000,
    "reference": "DEL-19",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 133,
    "customer_id": 18,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 50,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 108000,
    "reference": "DEL-50",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 134,
    "customer_id": 18,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 82,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 117000,
    "reference": "DEL-82",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 135,
    "customer_id": 18,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 113,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 126000,
    "reference": "DEL-113",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 136,
    "customer_id": 18,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 145,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 135000,
    "reference": "DEL-145",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 137,
    "customer_id": 18,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 176,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 144000,
    "reference": "DEL-176",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 138,
    "customer_id": 19,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 139,
    "customer_id": 19,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 20,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-20",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 140,
    "customer_id": 19,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 51,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-51",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 141,
    "customer_id": 19,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 83,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-83",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 142,
    "customer_id": 19,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 114,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-114",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 143,
    "customer_id": 19,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 177,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-177",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 144,
    "customer_id": 20,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 30000,
    "credit_amount": 0,
    "running_balance": 30000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 145,
    "customer_id": 20,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 21,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 36000,
    "reference": "DEL-21",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 146,
    "customer_id": 20,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 52,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 42000,
    "reference": "DEL-52",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 147,
    "customer_id": 20,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 84,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 48000,
    "reference": "DEL-84",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 148,
    "customer_id": 20,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 115,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 54000,
    "reference": "DEL-115",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 149,
    "customer_id": 20,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 147,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 60000,
    "reference": "DEL-147",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 150,
    "customer_id": 20,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 178,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 66000,
    "reference": "DEL-178",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 151,
    "customer_id": 21,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 152,
    "customer_id": 21,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 22,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-22",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 153,
    "customer_id": 21,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 53,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-53",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 154,
    "customer_id": 21,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 85,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 9000,
    "reference": "DEL-85",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 155,
    "customer_id": 21,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 116,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-116",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 156,
    "customer_id": 21,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 148,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 15000,
    "reference": "DEL-148",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 157,
    "customer_id": 21,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 179,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-179",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 158,
    "customer_id": 22,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 650000,
    "credit_amount": 0,
    "running_balance": 650000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 159,
    "customer_id": 22,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 23,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 687500,
    "reference": "DEL-23",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 160,
    "customer_id": 22,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 54,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 75500,
    "credit_amount": 0,
    "running_balance": 763000,
    "reference": "DEL-54",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 161,
    "customer_id": 22,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 86,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 800500,
    "reference": "DEL-86",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 162,
    "customer_id": 22,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 6,
    "description": "Payment received via BANK_TRANSFER",
    "debit_amount": 0,
    "credit_amount": 500000,
    "running_balance": 300500,
    "reference": "PAY-6",
    "created_at": "2026-11-12T12:00:00Z"
  },
  {
    "id": 163,
    "customer_id": 22,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 117,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 75500,
    "credit_amount": 0,
    "running_balance": 376000,
    "reference": "DEL-117",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 164,
    "customer_id": 22,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 149,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 413500,
    "reference": "DEL-149",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 165,
    "customer_id": 22,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 180,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 451000,
    "reference": "DEL-180",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 166,
    "customer_id": 23,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 167,
    "customer_id": 23,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 24,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-24",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 168,
    "customer_id": 23,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 55,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-55",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 169,
    "customer_id": 23,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 87,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-87",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 170,
    "customer_id": 23,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 118,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 24000,
    "reference": "DEL-118",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 171,
    "customer_id": 23,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 150,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 30000,
    "reference": "DEL-150",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 172,
    "customer_id": 23,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 181,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 36000,
    "reference": "DEL-181",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 173,
    "customer_id": 24,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 174,
    "customer_id": 24,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 25,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-25",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 175,
    "customer_id": 24,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 56,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 12000,
    "reference": "DEL-56",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 176,
    "customer_id": 24,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 88,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 18000,
    "reference": "DEL-88",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 177,
    "customer_id": 24,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 119,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 24000,
    "reference": "DEL-119",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 178,
    "customer_id": 24,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 151,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 30000,
    "reference": "DEL-151",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 179,
    "customer_id": 24,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 182,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 36000,
    "reference": "DEL-182",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 180,
    "customer_id": 25,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 100000,
    "running_balance": -100000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 181,
    "customer_id": 25,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 26,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": -97000,
    "reference": "DEL-26",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 182,
    "customer_id": 25,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 57,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": -94000,
    "reference": "DEL-57",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 183,
    "customer_id": 25,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 89,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": -91000,
    "reference": "DEL-89",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 184,
    "customer_id": 25,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 120,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": -88000,
    "reference": "DEL-120",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 185,
    "customer_id": 25,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 152,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": -85000,
    "reference": "DEL-152",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 186,
    "customer_id": 25,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 183,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": -82000,
    "reference": "DEL-183",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 187,
    "customer_id": 26,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 55000,
    "credit_amount": 0,
    "running_balance": 55000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 188,
    "customer_id": 26,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 27,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 64000,
    "reference": "DEL-27",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 189,
    "customer_id": 26,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 58,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 73000,
    "reference": "DEL-58",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 190,
    "customer_id": 26,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 90,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 82000,
    "reference": "DEL-90",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 191,
    "customer_id": 26,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 121,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 91000,
    "reference": "DEL-121",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 192,
    "customer_id": 26,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 153,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 100000,
    "reference": "DEL-153",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 193,
    "customer_id": 26,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 184,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 9000,
    "credit_amount": 0,
    "running_balance": 109000,
    "reference": "DEL-184",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 194,
    "customer_id": 27,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 0,
    "credit_amount": 0,
    "running_balance": 0,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 195,
    "customer_id": 27,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 59,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 3000,
    "reference": "DEL-59",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 196,
    "customer_id": 27,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 122,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 6000,
    "reference": "DEL-122",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 197,
    "customer_id": 28,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 180000,
    "credit_amount": 0,
    "running_balance": 180000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 198,
    "customer_id": 28,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 28,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 186000,
    "reference": "DEL-28",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 199,
    "customer_id": 28,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 60,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 192000,
    "reference": "DEL-60",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 200,
    "customer_id": 28,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 91,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 198000,
    "reference": "DEL-91",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 201,
    "customer_id": 28,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 123,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 204000,
    "reference": "DEL-123",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 202,
    "customer_id": 28,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 154,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 210000,
    "reference": "DEL-154",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 203,
    "customer_id": 28,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 185,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 6000,
    "credit_amount": 0,
    "running_balance": 216000,
    "reference": "DEL-185",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 204,
    "customer_id": 29,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 290000,
    "credit_amount": 0,
    "running_balance": 290000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 205,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 29,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 327500,
    "reference": "DEL-29",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 206,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 30,
    "description": "Delivery charges for 2026-11-10 (Evening)",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 342500,
    "reference": "DEL-30",
    "created_at": "2026-11-10T18:00:00Z"
  },
  {
    "id": 207,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 61,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 380000,
    "reference": "DEL-61",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 208,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 62,
    "description": "Delivery charges for 2026-11-11 (Evening)",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 395000,
    "reference": "DEL-62",
    "created_at": "2026-11-11T18:00:00Z"
  },
  {
    "id": 209,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 92,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 432500,
    "reference": "DEL-92",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 210,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 93,
    "description": "Delivery charges for 2026-11-12 (Evening)",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 447500,
    "reference": "DEL-93",
    "created_at": "2026-11-12T18:00:00Z"
  },
  {
    "id": 211,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 124,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 485000,
    "reference": "DEL-124",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 212,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 125,
    "description": "Delivery charges for 2026-11-13 (Evening)",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 500000,
    "reference": "DEL-125",
    "created_at": "2026-11-13T18:00:00Z"
  },
  {
    "id": 213,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 155,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 537500,
    "reference": "DEL-155",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 214,
    "customer_id": 29,
    "transaction_type": "payment",
    "related_entity_type": "payments",
    "related_entity_id": 7,
    "description": "Payment received via UPI",
    "debit_amount": 0,
    "credit_amount": 400000,
    "running_balance": 137500,
    "reference": "PAY-7",
    "created_at": "2026-11-14T12:00:00Z"
  },
  {
    "id": 215,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 156,
    "description": "Delivery charges for 2026-11-14 (Evening)",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 152500,
    "reference": "DEL-156",
    "created_at": "2026-11-14T18:00:00Z"
  },
  {
    "id": 216,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 186,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 37500,
    "credit_amount": 0,
    "running_balance": 190000,
    "reference": "DEL-186",
    "created_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 217,
    "customer_id": 29,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 187,
    "description": "Delivery charges for 2026-11-15 (Evening)",
    "debit_amount": 15000,
    "credit_amount": 0,
    "running_balance": 205000,
    "reference": "DEL-187",
    "created_at": "2026-11-15T18:00:00Z"
  },
  {
    "id": 218,
    "customer_id": 30,
    "transaction_type": "opening_balance",
    "description": "Account Opening Balance",
    "debit_amount": 42000,
    "credit_amount": 0,
    "running_balance": 42000,
    "created_at": "2026-11-01T08:00:00Z"
  },
  {
    "id": 219,
    "customer_id": 30,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 31,
    "description": "Delivery charges for 2026-11-10",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 45000,
    "reference": "DEL-31",
    "created_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 220,
    "customer_id": 30,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 63,
    "description": "Delivery charges for 2026-11-11",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 48000,
    "reference": "DEL-63",
    "created_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 221,
    "customer_id": 30,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 94,
    "description": "Delivery charges for 2026-11-12",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 51000,
    "reference": "DEL-94",
    "created_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 222,
    "customer_id": 30,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 126,
    "description": "Delivery charges for 2026-11-13",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 54000,
    "reference": "DEL-126",
    "created_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 223,
    "customer_id": 30,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 157,
    "description": "Delivery charges for 2026-11-14",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 57000,
    "reference": "DEL-157",
    "created_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 224,
    "customer_id": 30,
    "transaction_type": "delivery",
    "related_entity_type": "deliveries",
    "related_entity_id": 188,
    "description": "Delivery charges for 2026-11-15",
    "debit_amount": 3000,
    "credit_amount": 0,
    "running_balance": 60000,
    "reference": "DEL-188",
    "created_at": "2026-11-15T07:00:00Z"
  }
];

export const DUMMY_PAYMENTS: PaymentRecord[] = [
  {
    "id": 1,
    "customer_id": 4,
    "amount": 150000,
    "payment_method": "upi",
    "payment_date": "2026-11-14",
    "reference_no": "UPI-78945612",
    "notes": "GPay payment from Aniket",
    "status": "posted"
  },
  {
    "id": 2,
    "customer_id": 1,
    "amount": 45000,
    "payment_method": "cash",
    "payment_date": "2026-11-14",
    "notes": "Cash received at shop counter",
    "status": "posted"
  },
  {
    "id": 3,
    "customer_id": 16,
    "amount": 350000,
    "payment_method": "bank_transfer",
    "payment_date": "2026-11-13",
    "reference_no": "NEFT-55443322",
    "notes": "Hotel Wagh Pride weekly transfer",
    "status": "posted"
  },
  {
    "id": 4,
    "customer_id": 8,
    "amount": 100000,
    "payment_method": "upi",
    "payment_date": "2026-11-14",
    "reference_no": "UPI-11223344",
    "notes": "PhonePe received",
    "status": "posted"
  },
  {
    "id": 5,
    "customer_id": 11,
    "amount": 100000,
    "payment_method": "upi",
    "payment_date": "2026-11-13",
    "reference_no": "UPI-33445566",
    "notes": "Google Pay",
    "status": "posted"
  },
  {
    "id": 6,
    "customer_id": 22,
    "amount": 500000,
    "payment_method": "bank_transfer",
    "payment_date": "2026-11-12",
    "reference_no": "IMPS-99887766",
    "notes": "Advance commercial payment",
    "status": "posted"
  },
  {
    "id": 7,
    "customer_id": 29,
    "amount": 400000,
    "payment_method": "upi",
    "payment_date": "2026-11-14",
    "reference_no": "UPI-88776655",
    "notes": "Tea stall batch settlement",
    "status": "posted"
  }
];

export const DUMMY_DELIVERIES: DeliveryRecord[] = [
  {
    "id": 1,
    "customer_id": 1,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 1,
        "delivery_id": 1,
        "customer_id": 1,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 2,
    "customer_id": 2,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 2,
        "delivery_id": 2,
        "customer_id": 2,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 3,
    "customer_id": 3,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 11250,
    "items": [
      {
        "id": 3,
        "delivery_id": 3,
        "customer_id": 3,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 7500,
        "line_amount": 11250,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 4,
    "customer_id": 4,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 14000,
    "items": [
      {
        "id": 4,
        "delivery_id": 4,
        "customer_id": 4,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 6000,
        "line_amount": 12000,
        "created_at": "2026-11-10T06:30:00Z"
      },
      {
        "id": 5,
        "delivery_id": 4,
        "customer_id": 4,
        "product_id": 6,
        "product_name_snapshot": "Rajuri Dahi 200gm",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 2000,
        "line_amount": 2000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 5,
    "customer_id": 5,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 6,
        "delivery_id": 5,
        "customer_id": 5,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 6,
    "customer_id": 6,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 7,
        "delivery_id": 6,
        "customer_id": 6,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 7,
    "customer_id": 7,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 8,
        "delivery_id": 7,
        "customer_id": 7,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 8,
    "customer_id": 8,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 9,
        "delivery_id": 8,
        "customer_id": 8,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 9,
    "customer_id": 9,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 10,
        "delivery_id": 9,
        "customer_id": 9,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 10,
    "customer_id": 10,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 11,
        "delivery_id": 10,
        "customer_id": 10,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 11,
    "customer_id": 11,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 18000,
    "items": [
      {
        "id": 12,
        "delivery_id": 11,
        "customer_id": 11,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 6000,
        "line_amount": 18000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 12,
    "customer_id": 12,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 13,
        "delivery_id": 12,
        "customer_id": 12,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 13,
    "customer_id": 13,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 14,
        "delivery_id": 13,
        "customer_id": 13,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 14,
    "customer_id": 14,
    "product_id": 3,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3800,
    "items": [
      {
        "id": 15,
        "delivery_id": 14,
        "customer_id": 14,
        "product_id": 3,
        "product_name_snapshot": "Buffalo Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3800,
        "line_amount": 3800,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 15,
    "customer_id": 15,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 16,
        "delivery_id": 15,
        "customer_id": 15,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 16,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 4,
    "total_amount": 30000,
    "items": [
      {
        "id": 17,
        "delivery_id": 16,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 4,
        "unit_price": 7500,
        "line_amount": 30000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 17,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 22500,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 18,
        "delivery_id": 17,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 7500,
        "line_amount": 22500,
        "created_at": "2026-11-10T17:30:00Z"
      }
    ],
    "created_at": "2026-11-10T17:45:00Z",
    "updated_at": "2026-11-10T18:00:00Z"
  },
  {
    "id": 18,
    "customer_id": 17,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 19,
        "delivery_id": 18,
        "customer_id": 17,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 19,
    "customer_id": 18,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 20,
        "delivery_id": 19,
        "customer_id": 18,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 20,
    "customer_id": 19,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 21,
        "delivery_id": 20,
        "customer_id": 19,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 21,
    "customer_id": 20,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 22,
        "delivery_id": 21,
        "customer_id": 20,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 22,
    "customer_id": 21,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 23,
        "delivery_id": 22,
        "customer_id": 21,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 23,
    "customer_id": 22,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 24,
        "delivery_id": 23,
        "customer_id": 22,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 24,
    "customer_id": 23,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 25,
        "delivery_id": 24,
        "customer_id": 23,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 25,
    "customer_id": 24,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 26,
        "delivery_id": 25,
        "customer_id": 24,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 26,
    "customer_id": 25,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 27,
        "delivery_id": 26,
        "customer_id": 25,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 27,
    "customer_id": 26,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 28,
        "delivery_id": 27,
        "customer_id": 26,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 28,
    "customer_id": 28,
    "product_id": 2,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 29,
        "delivery_id": 28,
        "customer_id": 28,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 29,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 30,
        "delivery_id": 29,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 30,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-10",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 31,
        "delivery_id": 30,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-10T17:30:00Z"
      }
    ],
    "created_at": "2026-11-10T17:45:00Z",
    "updated_at": "2026-11-10T18:00:00Z"
  },
  {
    "id": 31,
    "customer_id": 30,
    "product_id": 1,
    "delivery_date": "2026-11-10",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 32,
        "delivery_id": 31,
        "customer_id": 30,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-10T06:30:00Z"
      }
    ],
    "created_at": "2026-11-10T06:45:00Z",
    "updated_at": "2026-11-10T07:00:00Z"
  },
  {
    "id": 32,
    "customer_id": 1,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 33,
        "delivery_id": 32,
        "customer_id": 1,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 33,
    "customer_id": 2,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 34,
        "delivery_id": 33,
        "customer_id": 2,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 34,
    "customer_id": 3,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 11250,
    "items": [
      {
        "id": 35,
        "delivery_id": 34,
        "customer_id": 3,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 7500,
        "line_amount": 11250,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 35,
    "customer_id": 4,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 14000,
    "items": [
      {
        "id": 36,
        "delivery_id": 35,
        "customer_id": 4,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 6000,
        "line_amount": 12000,
        "created_at": "2026-11-11T06:30:00Z"
      },
      {
        "id": 37,
        "delivery_id": 35,
        "customer_id": 4,
        "product_id": 6,
        "product_name_snapshot": "Rajuri Dahi 200gm",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 2000,
        "line_amount": 2000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 36,
    "customer_id": 5,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 38,
        "delivery_id": 36,
        "customer_id": 5,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 37,
    "customer_id": 6,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 39,
        "delivery_id": 37,
        "customer_id": 6,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 38,
    "customer_id": 7,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 40,
        "delivery_id": 38,
        "customer_id": 7,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 39,
    "customer_id": 8,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 41,
        "delivery_id": 39,
        "customer_id": 8,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 40,
    "customer_id": 9,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 42,
        "delivery_id": 40,
        "customer_id": 9,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 41,
    "customer_id": 10,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 43,
        "delivery_id": 41,
        "customer_id": 10,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 42,
    "customer_id": 11,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 18000,
    "items": [
      {
        "id": 44,
        "delivery_id": 42,
        "customer_id": 11,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 6000,
        "line_amount": 18000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 43,
    "customer_id": 12,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 45,
        "delivery_id": 43,
        "customer_id": 12,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 44,
    "customer_id": 13,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 46,
        "delivery_id": 44,
        "customer_id": 13,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 45,
    "customer_id": 14,
    "product_id": 3,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3800,
    "items": [
      {
        "id": 47,
        "delivery_id": 45,
        "customer_id": 14,
        "product_id": 3,
        "product_name_snapshot": "Buffalo Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3800,
        "line_amount": 3800,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 46,
    "customer_id": 15,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 48,
        "delivery_id": 46,
        "customer_id": 15,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 47,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 4,
    "total_amount": 30000,
    "items": [
      {
        "id": 49,
        "delivery_id": 47,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 4,
        "unit_price": 7500,
        "line_amount": 30000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 48,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 22500,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 50,
        "delivery_id": 48,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 7500,
        "line_amount": 22500,
        "created_at": "2026-11-11T17:30:00Z"
      }
    ],
    "created_at": "2026-11-11T17:45:00Z",
    "updated_at": "2026-11-11T18:00:00Z"
  },
  {
    "id": 49,
    "customer_id": 17,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 51,
        "delivery_id": 49,
        "customer_id": 17,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 50,
    "customer_id": 18,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 52,
        "delivery_id": 50,
        "customer_id": 18,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 51,
    "customer_id": 19,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 53,
        "delivery_id": 51,
        "customer_id": 19,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 52,
    "customer_id": 20,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 54,
        "delivery_id": 52,
        "customer_id": 20,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 53,
    "customer_id": 21,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 55,
        "delivery_id": 53,
        "customer_id": 21,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 54,
    "customer_id": 22,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 6,
    "total_amount": 75500,
    "items": [
      {
        "id": 56,
        "delivery_id": 54,
        "customer_id": 22,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-11T06:30:00Z"
      },
      {
        "id": 57,
        "delivery_id": 54,
        "customer_id": 22,
        "product_id": 8,
        "product_name_snapshot": "Fresh Malai Paneer",
        "unit_snapshot": "Kilogram",
        "quantity": 1,
        "unit_price": 38000,
        "line_amount": 38000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 55,
    "customer_id": 23,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 58,
        "delivery_id": 55,
        "customer_id": 23,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 56,
    "customer_id": 24,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 59,
        "delivery_id": 56,
        "customer_id": 24,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 57,
    "customer_id": 25,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 60,
        "delivery_id": 57,
        "customer_id": 25,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 58,
    "customer_id": 26,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 61,
        "delivery_id": 58,
        "customer_id": 26,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 59,
    "customer_id": 27,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 62,
        "delivery_id": 59,
        "customer_id": 27,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 60,
    "customer_id": 28,
    "product_id": 2,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 63,
        "delivery_id": 60,
        "customer_id": 28,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 61,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 64,
        "delivery_id": 61,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 62,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-11",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 65,
        "delivery_id": 62,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-11T17:30:00Z"
      }
    ],
    "created_at": "2026-11-11T17:45:00Z",
    "updated_at": "2026-11-11T18:00:00Z"
  },
  {
    "id": 63,
    "customer_id": 30,
    "product_id": 1,
    "delivery_date": "2026-11-11",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 66,
        "delivery_id": 63,
        "customer_id": 30,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-11T06:30:00Z"
      }
    ],
    "created_at": "2026-11-11T06:45:00Z",
    "updated_at": "2026-11-11T07:00:00Z"
  },
  {
    "id": 64,
    "customer_id": 1,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 67,
        "delivery_id": 64,
        "customer_id": 1,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 65,
    "customer_id": 2,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 68,
        "delivery_id": 65,
        "customer_id": 2,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 66,
    "customer_id": 3,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 11250,
    "items": [
      {
        "id": 69,
        "delivery_id": 66,
        "customer_id": 3,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 7500,
        "line_amount": 11250,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 67,
    "customer_id": 4,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 14000,
    "items": [
      {
        "id": 70,
        "delivery_id": 67,
        "customer_id": 4,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 6000,
        "line_amount": 12000,
        "created_at": "2026-11-12T06:30:00Z"
      },
      {
        "id": 71,
        "delivery_id": 67,
        "customer_id": 4,
        "product_id": 6,
        "product_name_snapshot": "Rajuri Dahi 200gm",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 2000,
        "line_amount": 2000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 68,
    "customer_id": 5,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 72,
        "delivery_id": 68,
        "customer_id": 5,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 69,
    "customer_id": 6,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 73,
        "delivery_id": 69,
        "customer_id": 6,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 70,
    "customer_id": 7,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 6000,
    "items": [
      {
        "id": 74,
        "delivery_id": 70,
        "customer_id": 7,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 2,
        "unit_price": 3000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 71,
    "customer_id": 8,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 75,
        "delivery_id": 71,
        "customer_id": 8,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 72,
    "customer_id": 9,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 76,
        "delivery_id": 72,
        "customer_id": 9,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 73,
    "customer_id": 10,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 77,
        "delivery_id": 73,
        "customer_id": 10,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 74,
    "customer_id": 11,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 18000,
    "items": [
      {
        "id": 78,
        "delivery_id": 74,
        "customer_id": 11,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 6000,
        "line_amount": 18000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 75,
    "customer_id": 12,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 79,
        "delivery_id": 75,
        "customer_id": 12,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 76,
    "customer_id": 13,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 80,
        "delivery_id": 76,
        "customer_id": 13,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 77,
    "customer_id": 14,
    "product_id": 3,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3800,
    "items": [
      {
        "id": 81,
        "delivery_id": 77,
        "customer_id": 14,
        "product_id": 3,
        "product_name_snapshot": "Buffalo Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3800,
        "line_amount": 3800,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 78,
    "customer_id": 15,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 82,
        "delivery_id": 78,
        "customer_id": 15,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 79,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 4,
    "total_amount": 30000,
    "items": [
      {
        "id": 83,
        "delivery_id": 79,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 4,
        "unit_price": 7500,
        "line_amount": 30000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 80,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 22500,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 84,
        "delivery_id": 80,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 7500,
        "line_amount": 22500,
        "created_at": "2026-11-12T17:30:00Z"
      }
    ],
    "created_at": "2026-11-12T17:45:00Z",
    "updated_at": "2026-11-12T18:00:00Z"
  },
  {
    "id": 81,
    "customer_id": 17,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 85,
        "delivery_id": 81,
        "customer_id": 17,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 82,
    "customer_id": 18,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 86,
        "delivery_id": 82,
        "customer_id": 18,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 83,
    "customer_id": 19,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 87,
        "delivery_id": 83,
        "customer_id": 19,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 84,
    "customer_id": 20,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 88,
        "delivery_id": 84,
        "customer_id": 20,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 85,
    "customer_id": 21,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 89,
        "delivery_id": 85,
        "customer_id": 21,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 86,
    "customer_id": 22,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 90,
        "delivery_id": 86,
        "customer_id": 22,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 87,
    "customer_id": 23,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 91,
        "delivery_id": 87,
        "customer_id": 23,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 88,
    "customer_id": 24,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 92,
        "delivery_id": 88,
        "customer_id": 24,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 89,
    "customer_id": 25,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 93,
        "delivery_id": 89,
        "customer_id": 25,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 90,
    "customer_id": 26,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 94,
        "delivery_id": 90,
        "customer_id": 26,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 91,
    "customer_id": 28,
    "product_id": 2,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 95,
        "delivery_id": 91,
        "customer_id": 28,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 92,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 96,
        "delivery_id": 92,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 93,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-12",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 97,
        "delivery_id": 93,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-12T17:30:00Z"
      }
    ],
    "created_at": "2026-11-12T17:45:00Z",
    "updated_at": "2026-11-12T18:00:00Z"
  },
  {
    "id": 94,
    "customer_id": 30,
    "product_id": 1,
    "delivery_date": "2026-11-12",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 98,
        "delivery_id": 94,
        "customer_id": 30,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-12T06:30:00Z"
      }
    ],
    "created_at": "2026-11-12T06:45:00Z",
    "updated_at": "2026-11-12T07:00:00Z"
  },
  {
    "id": 95,
    "customer_id": 1,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 99,
        "delivery_id": 95,
        "customer_id": 1,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 96,
    "customer_id": 2,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 100,
        "delivery_id": 96,
        "customer_id": 2,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 97,
    "customer_id": 3,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 11250,
    "items": [
      {
        "id": 101,
        "delivery_id": 97,
        "customer_id": 3,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 7500,
        "line_amount": 11250,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 98,
    "customer_id": 4,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 14000,
    "items": [
      {
        "id": 102,
        "delivery_id": 98,
        "customer_id": 4,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 6000,
        "line_amount": 12000,
        "created_at": "2026-11-13T06:30:00Z"
      },
      {
        "id": 103,
        "delivery_id": 98,
        "customer_id": 4,
        "product_id": 6,
        "product_name_snapshot": "Rajuri Dahi 200gm",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 2000,
        "line_amount": 2000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 99,
    "customer_id": 5,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 104,
        "delivery_id": 99,
        "customer_id": 5,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 100,
    "customer_id": 6,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 105,
        "delivery_id": 100,
        "customer_id": 6,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 101,
    "customer_id": 7,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 106,
        "delivery_id": 101,
        "customer_id": 7,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 102,
    "customer_id": 8,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 107,
        "delivery_id": 102,
        "customer_id": 8,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 103,
    "customer_id": 9,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 108,
        "delivery_id": 103,
        "customer_id": 9,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 104,
    "customer_id": 10,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 109,
        "delivery_id": 104,
        "customer_id": 10,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 105,
    "customer_id": 11,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 18000,
    "items": [
      {
        "id": 110,
        "delivery_id": 105,
        "customer_id": 11,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 6000,
        "line_amount": 18000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 106,
    "customer_id": 12,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 111,
        "delivery_id": 106,
        "customer_id": 12,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 107,
    "customer_id": 13,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 112,
        "delivery_id": 107,
        "customer_id": 13,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 108,
    "customer_id": 14,
    "product_id": 3,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3800,
    "items": [
      {
        "id": 113,
        "delivery_id": 108,
        "customer_id": 14,
        "product_id": 3,
        "product_name_snapshot": "Buffalo Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3800,
        "line_amount": 3800,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 109,
    "customer_id": 15,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 114,
        "delivery_id": 109,
        "customer_id": 15,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 110,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 4,
    "total_amount": 30000,
    "items": [
      {
        "id": 115,
        "delivery_id": 110,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 4,
        "unit_price": 7500,
        "line_amount": 30000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 111,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 22500,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 116,
        "delivery_id": 111,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 7500,
        "line_amount": 22500,
        "created_at": "2026-11-13T17:30:00Z"
      }
    ],
    "created_at": "2026-11-13T17:45:00Z",
    "updated_at": "2026-11-13T18:00:00Z"
  },
  {
    "id": 112,
    "customer_id": 17,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 117,
        "delivery_id": 112,
        "customer_id": 17,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 113,
    "customer_id": 18,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 118,
        "delivery_id": 113,
        "customer_id": 18,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 114,
    "customer_id": 19,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 119,
        "delivery_id": 114,
        "customer_id": 19,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 115,
    "customer_id": 20,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 120,
        "delivery_id": 115,
        "customer_id": 20,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 116,
    "customer_id": 21,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 121,
        "delivery_id": 116,
        "customer_id": 21,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 117,
    "customer_id": 22,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 6,
    "total_amount": 75500,
    "items": [
      {
        "id": 122,
        "delivery_id": 117,
        "customer_id": 22,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-13T06:30:00Z"
      },
      {
        "id": 123,
        "delivery_id": 117,
        "customer_id": 22,
        "product_id": 8,
        "product_name_snapshot": "Fresh Malai Paneer",
        "unit_snapshot": "Kilogram",
        "quantity": 1,
        "unit_price": 38000,
        "line_amount": 38000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 118,
    "customer_id": 23,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 124,
        "delivery_id": 118,
        "customer_id": 23,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 119,
    "customer_id": 24,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 125,
        "delivery_id": 119,
        "customer_id": 24,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 120,
    "customer_id": 25,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 126,
        "delivery_id": 120,
        "customer_id": 25,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 121,
    "customer_id": 26,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 127,
        "delivery_id": 121,
        "customer_id": 26,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 122,
    "customer_id": 27,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 128,
        "delivery_id": 122,
        "customer_id": 27,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 123,
    "customer_id": 28,
    "product_id": 2,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 129,
        "delivery_id": 123,
        "customer_id": 28,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 124,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 130,
        "delivery_id": 124,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 125,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-13",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 131,
        "delivery_id": 125,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-13T17:30:00Z"
      }
    ],
    "created_at": "2026-11-13T17:45:00Z",
    "updated_at": "2026-11-13T18:00:00Z"
  },
  {
    "id": 126,
    "customer_id": 30,
    "product_id": 1,
    "delivery_date": "2026-11-13",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 132,
        "delivery_id": 126,
        "customer_id": 30,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-13T06:30:00Z"
      }
    ],
    "created_at": "2026-11-13T06:45:00Z",
    "updated_at": "2026-11-13T07:00:00Z"
  },
  {
    "id": 127,
    "customer_id": 1,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 133,
        "delivery_id": 127,
        "customer_id": 1,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 128,
    "customer_id": 2,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 134,
        "delivery_id": 128,
        "customer_id": 2,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 129,
    "customer_id": 3,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 11250,
    "items": [
      {
        "id": 135,
        "delivery_id": 129,
        "customer_id": 3,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 7500,
        "line_amount": 11250,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 130,
    "customer_id": 4,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 14000,
    "items": [
      {
        "id": 136,
        "delivery_id": 130,
        "customer_id": 4,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 6000,
        "line_amount": 12000,
        "created_at": "2026-11-14T06:30:00Z"
      },
      {
        "id": 137,
        "delivery_id": 130,
        "customer_id": 4,
        "product_id": 6,
        "product_name_snapshot": "Rajuri Dahi 200gm",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 2000,
        "line_amount": 2000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 131,
    "customer_id": 5,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 138,
        "delivery_id": 131,
        "customer_id": 5,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 132,
    "customer_id": 6,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 139,
        "delivery_id": 132,
        "customer_id": 6,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 133,
    "customer_id": 7,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 140,
        "delivery_id": 133,
        "customer_id": 7,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 134,
    "customer_id": 8,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 141,
        "delivery_id": 134,
        "customer_id": 8,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 135,
    "customer_id": 9,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 142,
        "delivery_id": 135,
        "customer_id": 9,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 136,
    "customer_id": 10,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 143,
        "delivery_id": 136,
        "customer_id": 10,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 137,
    "customer_id": 11,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 18000,
    "items": [
      {
        "id": 144,
        "delivery_id": 137,
        "customer_id": 11,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 6000,
        "line_amount": 18000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 138,
    "customer_id": 12,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 145,
        "delivery_id": 138,
        "customer_id": 12,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 139,
    "customer_id": 13,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 146,
        "delivery_id": 139,
        "customer_id": 13,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 140,
    "customer_id": 14,
    "product_id": 3,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3800,
    "items": [
      {
        "id": 147,
        "delivery_id": 140,
        "customer_id": 14,
        "product_id": 3,
        "product_name_snapshot": "Buffalo Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3800,
        "line_amount": 3800,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 141,
    "customer_id": 15,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 148,
        "delivery_id": 141,
        "customer_id": 15,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 142,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 4,
    "total_amount": 30000,
    "items": [
      {
        "id": 149,
        "delivery_id": 142,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 4,
        "unit_price": 7500,
        "line_amount": 30000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 143,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 22500,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 150,
        "delivery_id": 143,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 7500,
        "line_amount": 22500,
        "created_at": "2026-11-14T17:30:00Z"
      }
    ],
    "created_at": "2026-11-14T17:45:00Z",
    "updated_at": "2026-11-14T18:00:00Z"
  },
  {
    "id": 144,
    "customer_id": 17,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 151,
        "delivery_id": 144,
        "customer_id": 17,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 145,
    "customer_id": 18,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 152,
        "delivery_id": 145,
        "customer_id": 18,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 146,
    "customer_id": 19,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "skipped",
    "total_quantity": 1,
    "total_amount": 0,
    "notes": "Customer paused for 1 day (Travel)",
    "items": [],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 147,
    "customer_id": 20,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 154,
        "delivery_id": 147,
        "customer_id": 20,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 148,
    "customer_id": 21,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 155,
        "delivery_id": 148,
        "customer_id": 21,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 149,
    "customer_id": 22,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 156,
        "delivery_id": 149,
        "customer_id": 22,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 150,
    "customer_id": 23,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 157,
        "delivery_id": 150,
        "customer_id": 23,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 151,
    "customer_id": 24,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 158,
        "delivery_id": 151,
        "customer_id": 24,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 152,
    "customer_id": 25,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 159,
        "delivery_id": 152,
        "customer_id": 25,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 153,
    "customer_id": 26,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 160,
        "delivery_id": 153,
        "customer_id": 26,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 154,
    "customer_id": 28,
    "product_id": 2,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 161,
        "delivery_id": 154,
        "customer_id": 28,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 155,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 162,
        "delivery_id": 155,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 156,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-14",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 163,
        "delivery_id": 156,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-14T17:30:00Z"
      }
    ],
    "created_at": "2026-11-14T17:45:00Z",
    "updated_at": "2026-11-14T18:00:00Z"
  },
  {
    "id": 157,
    "customer_id": 30,
    "product_id": 1,
    "delivery_date": "2026-11-14",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 164,
        "delivery_id": 157,
        "customer_id": 30,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-14T06:30:00Z"
      }
    ],
    "created_at": "2026-11-14T06:45:00Z",
    "updated_at": "2026-11-14T07:00:00Z"
  },
  {
    "id": 158,
    "customer_id": 1,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 165,
        "delivery_id": 158,
        "customer_id": 1,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 159,
    "customer_id": 2,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 166,
        "delivery_id": 159,
        "customer_id": 2,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 160,
    "customer_id": 3,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 11250,
    "items": [
      {
        "id": 167,
        "delivery_id": 160,
        "customer_id": 3,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 7500,
        "line_amount": 11250,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 161,
    "customer_id": 4,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 14000,
    "items": [
      {
        "id": 168,
        "delivery_id": 161,
        "customer_id": 4,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 6000,
        "line_amount": 12000,
        "created_at": "2026-11-15T06:30:00Z"
      },
      {
        "id": 169,
        "delivery_id": 161,
        "customer_id": 4,
        "product_id": 6,
        "product_name_snapshot": "Rajuri Dahi 200gm",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 2000,
        "line_amount": 2000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 162,
    "customer_id": 5,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 170,
        "delivery_id": 162,
        "customer_id": 5,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 163,
    "customer_id": 6,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 171,
        "delivery_id": 163,
        "customer_id": 6,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 164,
    "customer_id": 7,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 172,
        "delivery_id": 164,
        "customer_id": 7,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 165,
    "customer_id": 8,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 173,
        "delivery_id": 165,
        "customer_id": 8,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 166,
    "customer_id": 9,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 174,
        "delivery_id": 166,
        "customer_id": 9,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 167,
    "customer_id": 10,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 175,
        "delivery_id": 167,
        "customer_id": 10,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 168,
    "customer_id": 11,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 18000,
    "items": [
      {
        "id": 176,
        "delivery_id": 168,
        "customer_id": 11,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 6000,
        "line_amount": 18000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 169,
    "customer_id": 12,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 177,
        "delivery_id": 169,
        "customer_id": 12,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 170,
    "customer_id": 13,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 178,
        "delivery_id": 170,
        "customer_id": 13,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 171,
    "customer_id": 14,
    "product_id": 3,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3800,
    "items": [
      {
        "id": 179,
        "delivery_id": 171,
        "customer_id": 14,
        "product_id": 3,
        "product_name_snapshot": "Buffalo Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3800,
        "line_amount": 3800,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 172,
    "customer_id": 15,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 180,
        "delivery_id": 172,
        "customer_id": 15,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 173,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 4,
    "total_amount": 30000,
    "items": [
      {
        "id": 181,
        "delivery_id": 173,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 4,
        "unit_price": 7500,
        "line_amount": 30000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 174,
    "customer_id": 16,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 3,
    "total_amount": 22500,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 182,
        "delivery_id": 174,
        "customer_id": 16,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 3,
        "unit_price": 7500,
        "line_amount": 22500,
        "created_at": "2026-11-15T17:30:00Z"
      }
    ],
    "created_at": "2026-11-15T17:45:00Z",
    "updated_at": "2026-11-15T18:00:00Z"
  },
  {
    "id": 175,
    "customer_id": 17,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "items": [
      {
        "id": 183,
        "delivery_id": 175,
        "customer_id": 17,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 176,
    "customer_id": 18,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 184,
        "delivery_id": 176,
        "customer_id": 18,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 177,
    "customer_id": 19,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 185,
        "delivery_id": 177,
        "customer_id": 19,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 178,
    "customer_id": 20,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 186,
        "delivery_id": 178,
        "customer_id": 20,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 179,
    "customer_id": 21,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 187,
        "delivery_id": 179,
        "customer_id": 21,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 180,
    "customer_id": 22,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 188,
        "delivery_id": 180,
        "customer_id": 22,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 181,
    "customer_id": 23,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 189,
        "delivery_id": 181,
        "customer_id": 23,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 182,
    "customer_id": 24,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 190,
        "delivery_id": 182,
        "customer_id": 24,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 183,
    "customer_id": 25,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 191,
        "delivery_id": 183,
        "customer_id": 25,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 184,
    "customer_id": 26,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1.5,
    "total_amount": 9000,
    "items": [
      {
        "id": 192,
        "delivery_id": 184,
        "customer_id": 26,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1.5,
        "unit_price": 6000,
        "line_amount": 9000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 185,
    "customer_id": 28,
    "product_id": 2,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 6000,
    "items": [
      {
        "id": 193,
        "delivery_id": 185,
        "customer_id": 28,
        "product_id": 2,
        "product_name_snapshot": "Fresh Cow Milk 1L",
        "unit_snapshot": "Litre",
        "quantity": 1,
        "unit_price": 6000,
        "line_amount": 6000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 186,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 5,
    "total_amount": 37500,
    "items": [
      {
        "id": 194,
        "delivery_id": 186,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 5,
        "unit_price": 7500,
        "line_amount": 37500,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  },
  {
    "id": 187,
    "customer_id": 29,
    "product_id": 4,
    "delivery_date": "2026-11-15",
    "session_key": "evening",
    "status": "confirmed",
    "total_quantity": 2,
    "total_amount": 15000,
    "notes": "Commercial evening batch",
    "items": [
      {
        "id": 195,
        "delivery_id": 187,
        "customer_id": 29,
        "product_id": 4,
        "product_name_snapshot": "Buffalo Milk Rich 1L",
        "unit_snapshot": "Litre",
        "quantity": 2,
        "unit_price": 7500,
        "line_amount": 15000,
        "created_at": "2026-11-15T17:30:00Z"
      }
    ],
    "created_at": "2026-11-15T17:45:00Z",
    "updated_at": "2026-11-15T18:00:00Z"
  },
  {
    "id": 188,
    "customer_id": 30,
    "product_id": 1,
    "delivery_date": "2026-11-15",
    "session_key": "morning",
    "status": "confirmed",
    "total_quantity": 1,
    "total_amount": 3000,
    "items": [
      {
        "id": 196,
        "delivery_id": 188,
        "customer_id": 30,
        "product_id": 1,
        "product_name_snapshot": "Cow Milk 500ml",
        "unit_snapshot": "Packet",
        "quantity": 1,
        "unit_price": 3000,
        "line_amount": 3000,
        "created_at": "2026-11-15T06:30:00Z"
      }
    ],
    "created_at": "2026-11-15T06:45:00Z",
    "updated_at": "2026-11-15T07:00:00Z"
  }
];
