export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in KSh
  category: "clothes" | "books";
  image?: string;
  isNew?: boolean;
  onSale?: boolean;
  originalPrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  interest: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  deliveryLocation: string;
  paymentMethod: string;
  date: string;
}

export type ScreenType = "home" | "shop" | "contact" | "admin-login" | "admin-dashboard";
