// Database Types for MobileHub Delhi

export type ConditionGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
export type PhoneStatus = 'Available' | 'Reserved' | 'Sold' | 'Under Repair' | 'Quality Check' | 'Listed Online';
export type BlacklistStatus = 'Clear' | 'Blacklisted' | 'Unknown';
export type WarrantyType = 'No Warranty' | '30 Days' | '60 Days' | '90 Days' | 'Brand Warranty';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'EMI' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Partial';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Returned';
export type InquirySource = 'WhatsApp' | 'Website' | 'Walk-in' | 'OLX' | 'Phone Call';

export interface Phone {
  id: string;
  brand: string;
  model_name: string;
  model_number?: string;
  variant?: string;
  color?: string;
  
  // Identification
  imei_1: string;
  imei_2?: string;
  serial_number?: string;
  imei_verified: boolean;
  blacklist_status: BlacklistStatus;
  
  // Condition
  condition_grade: ConditionGrade;
  screen_condition?: string;
  body_condition?: string;
  battery_health_percent?: number;
  
  // Functional Tests
  face_id_working: boolean;
  fingerprint_working: boolean;
  buttons_working: boolean;
  speakers_working: boolean;
  microphone_working: boolean;
  cameras_working: string;
  wifi_working: boolean;
  bluetooth_working: boolean;
  charging_port_condition: string;
  
  // Pricing (in paise)
  cost_price_paise: number;
  selling_price_paise: number;
  original_mrp_paise?: number;
  minimum_price_paise?: number;
  
  // Refurbishment
  is_refurbished: boolean;
  refurbishment_details?: string;
  accessories_included?: string[];
  
  // Warranty
  warranty_type: WarrantyType;
  warranty_end_date?: string;
  
  // Tax & Legal
  gst_applicable: boolean;
  original_invoice_available: boolean;
  seller_id?: string;
  
  // Status
  status: PhoneStatus;
  location: string;
  listed_on?: string[];
  
  // Media
  images?: string[];
  video_url?: string;
  thumbnail_url?: string;
  
  // Dates
  purchase_date?: string;
  created_at: string;
  updated_at: string;
  sold_at?: string;
  
  // Computed
  search_text?: string;
}

export interface Seller {
  id: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  city: string;
  pincode?: string;
  notes?: string;
  total_phones_sold: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp_number?: string;
  email?: string;
  address?: string;
  city: string;
  pincode?: string;
  total_purchases: number;
  total_spent_paise: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  phone_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  
  // Pricing
  selling_price_paise: number;
  discount_paise: number;
  gst_amount_paise: number;
  final_amount_paise: number;
  
  // Payment
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  emi_provider?: string;
  emi_tenure_months?: number;
  transaction_id?: string;
  
  // Status
  status: OrderStatus;
  
  // Invoice
  gst_invoice_number?: string;
  invoice_url?: string;
  
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // Joined data
  phone?: Phone;
  customer?: Customer;
}

export interface WhatsAppConversation {
  id: string;
  customer_phone: string;
  customer_name?: string;
  message_type: 'incoming' | 'outgoing';
  message_content: string;
  message_id?: string;
  intent?: string;
  extracted_brand?: string;
  extracted_model?: string;
  extracted_budget_min?: number;
  extracted_budget_max?: number;
  response_sent: boolean;
  response_time_ms?: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  customer_id?: string;
  phone_id?: string;
  source: InquirySource;
  customer_phone: string;
  customer_name?: string;
  inquiry_text?: string;
  status: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  followed_up_at?: string;
}

// Form types
export interface PhoneFormData {
  brand: string;
  model_name: string;
  model_number?: string;
  variant?: string;
  color?: string;
  imei_1: string;
  imei_2?: string;
  condition_grade: ConditionGrade;
  battery_health_percent?: number;
  cost_price: number; // In INR (will be converted to paise)
  selling_price: number;
  original_mrp?: number;
  warranty_type: WarrantyType;
  status: PhoneStatus;
  images?: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalPhones: number;
  availablePhones: number;
  soldThisMonth: number;
  totalRevenue: number;
  averagePrice: number;
  topBrands: { brand: string; count: number }[];
  recentOrders: Order[];
  lowStock: Phone[];
}

// Search/Filter types
export interface PhoneFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ConditionGrade[];
  status?: PhoneStatus;
  search?: string;
}
