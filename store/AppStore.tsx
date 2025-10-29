import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Category, Product, CartItem, Order, OrderStatus, User, Role, PaymentStatus } from './types';
import { PRODUCTS } from '../data/products';

export type { Category, Product, CartItem, Order, OrderStatus, User, Role, PaymentStatus };

export type Screen =
  | 'welcome'
  | 'login'
  | 'register'
  | 'landing'
  | 'home'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'profile'
  | 'notifications'
  | 'admin';

export type PaymentMethod = 'paypal' | 'gcash' | 'maya' | 'cod' | 'card';

type AppStore = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  logout: () => void;
  updateProfile: (data: Partial<NonNullable<AppStore['user']>>) => void;
  notifications: { id: string; title: string; message: string; type: string; read: boolean; createdAt: number }[];
  addNotification: (title: string, message: string, type?: string) => void;
  markNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  
  adminNotifications: { id: string; title: string; message: string; type: string; read: boolean; createdAt: number }[];
  addAdminNotification: (title: string, message: string, type?: string) => void;
  markAdminNotificationsAsRead: () => void;
  markAdminNotificationAsRead: (id: string) => void;

  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Product;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  orders: Order[];
  placeOrder: (address?: string, orderDetails?: { paymentMethod?: PaymentMethod; specialInstructions?: string; customerName?: string; customerPhone?: string; transactionId?: string }) => Order | null;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  fetchUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
};

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [user, setUser] = useState<AppStore['user']>(null);
  const [users, setUsers] = useState<User[]>([
    // Pre-defined admin account
    {
      id: 1,
      name: 'Kimkles Administrator',
      username: 'kimkles.admin',
      role: 'admin',
      phone: '09123456789',
      address: 'Kimkles Main Office',
      created_at: new Date().toISOString()
    }
  ]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: string; read: boolean; createdAt: number }[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<{ id: string; title: string; message: string; type: string; read: boolean; createdAt: number }[]>([]);


  // Initialize products from static data
  useEffect(() => {
    setProducts(PRODUCTS);
  }, []);

  const value = useMemo<AppStore>(() => ({
    screen,
    setScreen,
    user,
    setUser,
    users,
    notifications,
    addNotification: (title: string, message: string, type: string = 'general') => {
      const n = { 
        id: 'NTF-' + Math.random().toString(36).slice(2, 8).toUpperCase(), 
        title, 
        message, 
        type, 
        read: false, 
        createdAt: Date.now() 
      };
      setNotifications((prev) => [n, ...prev].slice(0, 50));
    },
    markNotificationsAsRead: () => {
      setNotifications((prev) => prev.map(notification => ({ ...notification, read: true })));
    },
    markNotificationAsRead: (id: string) => {
      setNotifications((prev) => prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    },
    
    adminNotifications,
    addAdminNotification: (title: string, message: string, type: string = 'admin') => {
      const n = { 
        id: 'ADM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), 
        title, 
        message, 
        type, 
        read: false, 
        createdAt: Date.now() 
      };
      setAdminNotifications((prev) => [n, ...prev].slice(0, 50));
    },
    markAdminNotificationsAsRead: () => {
      setAdminNotifications((prev) => prev.map(notification => ({ ...notification, read: true })));
    },
    markAdminNotificationAsRead: (id: string) => {
      setAdminNotifications((prev) => prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    },
    logout: () => {
      setUser(null);
      setCart([]);
      setScreen('welcome');
    },
    updateProfile: (data) => setUser((u) => (u ? { ...u, ...data } : u)),

    products,
    addProduct: (p) => {
      const id = 'prod-' + Math.random().toString(36).slice(2, 8);
      const np: Product = { id, ...p } as Product;
      setProducts(prev => [np, ...prev]);
      return np;
    },
    updateProduct: (p) => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x)),
    deleteProduct: (id) => setProducts(prev => prev.filter(x => x.id !== id)),

    cart,
    addToCart: (p) =>
      setCart((prev) => {
        const i = prev.findIndex(ci => ci.product.id === p.id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
          return copy;
        }
        return [...prev, { product: p, qty: 1 }];
      }),
    updateQty: (id, qty) =>
      setCart((prev) => prev.map(ci => ci.product.id === id ? { ...ci, qty: Math.max(1, qty) } : ci)),
    removeFromCart: (id) => setCart((prev) => prev.filter(ci => ci.product.id !== id)),
    clearCart: () => setCart([]),

    orders,
    placeOrder: (address, orderDetails = {}) => {
      if (cart.length === 0) return null;
      
      const subtotal = cart.reduce((s, ci) => s + ci.product.price * ci.qty, 0);
      const deliveryFee = subtotal > 500 ? 0 : 50;
      const total = subtotal + deliveryFee;
      
      const order: Order = {
        id: 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        items: cart,
        total,
        status: 'Pending',
        createdAt: Date.now(),
        address,
        customerName: orderDetails.customerName || user?.name,
        customerPhone: orderDetails.customerPhone || user?.phone,
        paymentStatus: orderDetails.paymentMethod === 'cod' ? 'Pending' : 'Paid',
        paymentMethod: orderDetails.paymentMethod || 'paypal',
        transactionId: orderDetails.transactionId || (orderDetails.paymentMethod === 'cod' ? undefined : 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase()),
        specialInstructions: orderDetails.specialInstructions,
        deliveryFee,
      };
      
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      
      // Create notification for the customer
      const customerNotificationTitle = 'Order Placed! ⏳';
      const customerNotificationMessage = `Your order #${order.id} has been placed and is pending approval. Total: ₱${total.toFixed(2)}`;
      const customerNotification = { 
        id: 'NTF-' + Math.random().toString(36).slice(2, 8).toUpperCase(), 
        title: customerNotificationTitle, 
        message: customerNotificationMessage, 
        type: 'order', 
        read: false, 
        createdAt: Date.now() 
      };
      setNotifications((prev) => [customerNotification, ...prev].slice(0, 50));
      
      // Create admin notification for order approval
      const adminNotificationTitle = 'New Order Requires Approval! 📋';
      const adminNotificationMessage = `Order #${order.id} from ${user?.name || 'Customer'} needs approval. Total: ₱${total.toFixed(2)}`;
      const adminNotification = { 
        id: 'ADM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), 
        title: adminNotificationTitle, 
        message: adminNotificationMessage, 
        type: 'order', 
        read: false, 
        createdAt: Date.now() 
      };
      setAdminNotifications((prev) => [adminNotification, ...prev].slice(0, 50));
      
      return order;
    },
    updateOrderStatus: (id, status) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      
      // Create notification for customer about status update
      const customerStatusMessages = {
        'Pending': 'Your order is pending approval ⏳',
        'Preparing': 'Your order is being prepared! 👨‍🍳',
        'Out for Delivery': 'Your order is out for delivery! 🚚',
        'Delivered': 'Your order has been delivered! 📦',
        'Cancelled': 'Your order has been cancelled. 😔'
      };
      
      const customerStatusMessage = customerStatusMessages[status as keyof typeof customerStatusMessages];
      if (customerStatusMessage) {
        const customerNotification = { 
          id: 'NTF-' + Math.random().toString(36).slice(2, 8).toUpperCase(), 
          title: customerStatusMessage, 
          message: `Order #${id} status updated to: ${status}`, 
          type: 'order', 
          read: false, 
          createdAt: Date.now() 
        };
        setNotifications((prev) => [customerNotification, ...prev].slice(0, 50));
      }
      
      // Create admin notification for status update
      const adminStatusMessages = {
        'Pending': 'Order Status Updated',
        'Preparing': 'Order Status Updated', 
        'Out for Delivery': 'Order Status Updated',
        'Delivered': 'Order Status Updated',
        'Cancelled': 'Order Status Updated'
      };
      
      const adminStatusMessage = adminStatusMessages[status as keyof typeof adminStatusMessages];
      if (adminStatusMessage) {
        const adminNotification = { 
          id: 'ADM-' + Math.random().toString(36).slice(2, 8).toUpperCase(), 
          title: adminStatusMessage, 
          message: `Order #${id} status changed to: ${status}`, 
          type: 'order', 
          read: false, 
          createdAt: Date.now() 
        };
        setAdminNotifications((prev) => [adminNotification, ...prev].slice(0, 50));
      }
    },
    updatePaymentStatus: (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o)),
    fetchUsers: async () => {
      try {
        const response = await fetch('https://backend-kimklescravings.up.railway.app/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    refreshUsers: async () => {
      await value.fetchUsers();
    },
  }), [screen, user, users, products, cart, orders, notifications, adminNotifications]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
