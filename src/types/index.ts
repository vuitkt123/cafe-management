export type Role = 'admin' | 'cashier' | 'barista';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string;
  avatar?: string;
  phone?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'payment_pending';
export type TableArea = 'tang1' | 'tang2' | 'sanvuon' | 'takeaway';

export interface Table {
  id: string;
  name: string;
  area: TableArea;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface ProductSize {
  name: 'S' | 'M' | 'L';
  extraPrice: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface RecipeItem {
  ingredientId: string;
  amount: number; // số lượng cần dùng theo đơn vị nguyên liệu
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  basePrice: number;
  image: string;
  description: string;
  sizes: ProductSize[];
  availableToppings: string[]; // topping ids
  isAvailable: boolean;
  recipe?: RecipeItem[]; // công thức tiêu hao định lượng cho size chuẩn
}

export interface CartItemOption {
  size: 'S' | 'M' | 'L';
  toppings: Topping[];
  iceLevel: string; // '0%', '50%', '100%'
  sugarLevel: string; // '0%', '50%', '100%'
  note?: string;
}

export interface CartItem {
  id: string; // unique item uuid in cart
  productId: string;
  productName: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  selectedSize: 'S' | 'M' | 'L';
  selectedToppings: Topping[];
  iceLevel: string;
  sugarLevel: string;
  note: string;
  totalPrice: number;
  status?: 'pending' | 'preparing' | 'completed'; // cho Barista
}

export type PaymentMethod = 'cash' | 'vietqr' | 'card';
export type OrderStatus = 'pending' | 'processing' | 'served' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  code: string; // Mã đơn e.g. CF-20261012-001
  tableId?: string;
  tableName: string;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxAmount: number; // VAT
  total: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: 'unpaid' | 'paid';
  orderStatus: OrderStatus;
  cashReceived?: number;
  changeGiven?: number;
  customerNote?: string;
  cashierName: string;
  createdAt: string;
  paidAt?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string; // 'g', 'ml', 'hộp', 'kg', 'lon', 'cái'
  stock: number;
  minThreshold: number; // ngưỡng cảnh báo
  costPerUnit: number; // giá vốn đơn vị
  supplier?: string;
  lastUpdated: string;
}

export interface InventoryLog {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'import' | 'export_order' | 'adjustment';
  amount: number; // dương nếu nhập, âm nếu xuất
  balanceAfter: number;
  reason: string;
  timestamp: string;
  createdBy: string;
}

export interface RevenueSummary {
  todayRevenue: number;
  todayOrdersCount: number;
  todayProfit: number;
  averageOrderValue: number;
}
