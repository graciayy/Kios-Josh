export interface Product {
  id: string;
  name: string;
  category: 'Makanan' | 'Minuman' | 'Gorengan & Snack';
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'selesai' | 'dibatalkan';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  total: number;
  paymentMethod: 'cash' | 'qris';
  status: OrderStatus;
  pickupOrDelivery: 'pickup' | 'delivery';
  deliveryAddress: string;
  deliveryFee: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Ingredient {
  id: string;
  name: string;
  qty: string;
  unit: string;
  status: 'Cukup' | 'Hampir Habis' | 'Kritis';
}

export interface SalesReport {
  dailyRevenue: { date: string; amount: number; count: number }[];
  totalRevenue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}
