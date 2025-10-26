export type Category = 'Brownies' | 'Cookies' | 'Crinkles';

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  image?: any;
  available?: boolean;
  description?: string;
  stock?: number;
};

export type Role = 'customer' | 'admin';

export type User = {
  name: string;
  role: Role;
  username?: string;
  address?: string;
  phone?: string;
};

export type CartItem = { product: Product; qty: number };

export type OrderStatus = 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  address?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
};
