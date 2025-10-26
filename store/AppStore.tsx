import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Category, Product, CartItem, Order, OrderStatus, User, Role, PaymentStatus } from './types';
import { PRODUCTS } from '../data/products';
import { getItem, setItem } from './storage';

export type { Category, Product, CartItem, Order, OrderStatus, User, Role, PaymentStatus };

export type Screen =
  | 'welcome'
  | 'login'
  | 'register'
  | 'home'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'profile'
  | 'admin';

type AppStore = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  user: User | null;
  users: User[];
  login: (name: string) => void;
  loginWithPassword: (name: string, password: string) => boolean;
  registerUser: (data: { name: string; username?: string; phone?: string; address?: string }) => void;
  deleteUser: (key: { name?: string; username?: string }) => void;
  logout: () => void;
  updateProfile: (data: Partial<NonNullable<AppStore['user']>>) => void;
  notifications: { id: string; message: string; createdAt: number }[];
  addNotification: (message: string) => void;

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
  placeOrder: (address?: string) => Order | null;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
};

const Ctx = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [user, setUser] = useState<AppStore['user']>(null);
  const [users, setUsers] = useState<User[]>([{ name: 'Admin', role: 'admin', username: 'admin' }]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; message: string; createdAt: number }[]>([]);

  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'kimkles2021';

  // Hydrate users and products from local storage on app start
  useEffect(() => {
    (async () => {
      try {
        const su = await getItem('db.users');
        if (su) {
          const parsed = JSON.parse(su) as User[];
          setUsers(() => {
            const hasAdmin = parsed.some(u => (u.role === 'admin') && (u.username?.toLowerCase() === ADMIN_USERNAME));
            return hasAdmin ? parsed : [{ name: 'Admin', role: 'admin', username: 'admin' }, ...parsed];
          });
        } else {
          await setItem('db.users', JSON.stringify([{ name: 'Admin', role: 'admin', username: 'admin' }]));
        }

        const sp = await getItem('db.products');
        if (sp) {
          const parsed = JSON.parse(sp) as Product[];
          setProducts(parsed);
        } else {
          await setItem('db.products', JSON.stringify(PRODUCTS));
        }
      } catch {
        // ignore storage errors in fallback environments
      }
    })();
  }, []);

  // Persist users and products whenever they change
  useEffect(() => {
    (async () => {
      try { await setItem('db.users', JSON.stringify(users)); } catch {}
    })();
  }, [users]);

  useEffect(() => {
    (async () => {
      try { await setItem('db.products', JSON.stringify(products)); } catch {}
    })();
  }, [products]);

  const value = useMemo<AppStore>(() => ({
    screen,
    setScreen,
    user,
    users,
    notifications,
    login: (name: string) => {
      const trimmed = (name || '').trim();
      const role: Role = trimmed.toLowerCase() === 'admin' ? 'admin' : 'customer';
      const u: User = { name: trimmed, role };
      setUser(u);
      setUsers((prev) => {
        if (!trimmed) return prev;
        const exists = prev.some(x => x.name.toLowerCase() === trimmed.toLowerCase());
        return exists ? prev : [...prev, u];
      });
    },
    loginWithPassword: (name: string, password: string) => {
      const trimmed = (name || '').trim();
      const isAdminName = trimmed.toLowerCase() === ADMIN_USERNAME;
      if (isAdminName) {
        if (password !== ADMIN_PASSWORD) return false;
        const u: User = { name: 'Admin', role: 'admin', username: 'admin' };
        setUser(u);
        setUsers((prev) => (prev.some(x => x.name.toLowerCase() === 'admin') ? prev : [...prev, u]));
        return true;
      }
      // Non-admin: must be registered
      const key = trimmed.toLowerCase();
      const existing = users.find(u => (u.username ? u.username.toLowerCase() === key : false) || u.name.toLowerCase() === key);
      if (!existing) return false;
      setUser(existing);
      return true;
    },
    registerUser: ({ name, username, phone, address }) => {
      const trimmed = (name || '').trim() || 'Customer';
      const u: User = { name: trimmed, role: 'customer', username, phone, address };
      setUsers((prev) => {
        const exists = prev.some(x =>
          (username ? x.username?.toLowerCase() === username.toLowerCase() : false) ||
          x.name.toLowerCase() === trimmed.toLowerCase()
        );
        return exists ? prev.map(x => (x.name.toLowerCase() === trimmed.toLowerCase() ? { ...x, ...u } : x)) : [...prev, u];
      });
    },
    addNotification: (message: string) => {
      const n = { id: 'NTF-' + Math.random().toString(36).slice(2, 8).toUpperCase(), message, createdAt: Date.now() };
      setNotifications((prev) => [n, ...prev].slice(0, 50));
    },
    deleteUser: ({ name, username }) => {
      setUsers((prev) => {
        const target = prev.find(u =>
          (username ? u.username?.toLowerCase() === username.toLowerCase() : false) ||
          (name ? u.name.toLowerCase() === name.toLowerCase() : false)
        );
        if (!target) return prev;
        if (target.role === 'admin') return prev; // do not remove admin
        const filtered = prev.filter(u => u !== target);
        // Logout if the current user is removed
        setUser((curr) => {
          const match = curr && ((username && curr.username?.toLowerCase() === username.toLowerCase()) || (name && curr.name.toLowerCase() === name.toLowerCase()));
          if (match) {
            setCart([]);
            setScreen('login');
            return null;
          }
          return curr;
        });
        return filtered;
      });
    },
    logout: () => {
      setUser(null);
      setCart([]);
      setScreen('login');
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
    placeOrder: (address) => {
      if (cart.length === 0) return null;
      const total = cart.reduce((s, ci) => s + ci.product.price * ci.qty, 0);
      const order: Order = {
        id: 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        items: cart,
        total,
        status: 'Pending',
        createdAt: Date.now(),
        address,
        customerName: user?.name,
        customerPhone: user?.phone,
        paymentStatus: 'Paid',
        transactionId: 'TX-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    updateOrderStatus: (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)),
    updatePaymentStatus: (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o)),
  }), [screen, user, users, products, cart, orders]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
