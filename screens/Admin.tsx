import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Alert, ScrollView } from 'react-native';
import { CATEGORIES } from '../data/products';
import { OrderStatus, PaymentStatus, Product, useAppStore } from '../store/AppStore';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['Paid', 'Pending', 'Failed', 'Refunded'];

type Tab = 'Dashboard' | 'Products' | 'Orders' | 'Users' | 'Payments' | 'Reports';

export default function Admin() {
  const { user, setScreen, logout } = useAppStore();
  const [tab, setTab] = useState<Tab>('Dashboard');

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Only</Text>
        <Text style={styles.meta}>You must be logged in as an admin to access this screen.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen('home')}>
          <Text style={styles.primaryText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['Dashboard','Products','Orders','Users','Payments','Reports'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Dashboard' && <DashboardTab />}
      {tab === 'Products' && <ProductsTab />}
      {tab === 'Orders' && <OrdersTab />}
      {tab === 'Users' && <UsersTab />}
      {tab === 'Payments' && <PaymentsTab />}
      {tab === 'Reports' && <ReportsTab />}
    </View>
  );
}

function DashboardTab() {
  const { orders, products, users, notifications } = useAppStore();
  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
      <View style={styles.card}> 
        <Text style={styles.cardTitle}>Overview</Text>
        <Text style={styles.rowMeta}>Total Products: {products.length}</Text>
        <Text style={styles.rowMeta}>Total Orders: {orders.length}</Text>
        <Text style={styles.rowMeta}>Total Users: {users.length}</Text>
        <Text style={styles.rowMeta}>Revenue: ₱{totalRevenue.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        {notifications.length === 0 ? (
          <Text style={styles.rowMeta}>No notifications yet.</Text>
        ) : (
          notifications.slice(0, 5).map(n => (
            <Text key={n.id} style={styles.rowMeta}>{new Date(n.createdAt).toLocaleString()} • {n.message} {"\n"}</Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [pickedUri, setPickedUri] = useState<string | undefined>(undefined);

  const onAdd = () => {
    const p = parseFloat(price);
    if (!name.trim() || isNaN(p)) {
      Alert.alert('Add Product', 'Please provide a valid name and price.');
      return;
    }
    const chosenUri = pickedUri || (imageUrl.trim() ? imageUrl.trim() : undefined);
    const img = chosenUri ? { uri: chosenUri } : undefined;
    const prod: Omit<Product, 'id'> = { name: name.trim(), price: p, category: category as any, available: true, image: img };
    addProduct(prod);
    setName('');
    setPrice('');
    setImageUrl('');
    setPickedUri(undefined);
  };

  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    };
    const res = await launchImageLibrary(options);
    if (res.didCancel) return;
    const uri = res.assets && res.assets[0]?.uri;
    if (uri) setPickedUri(uri);
  };

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Product</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#9CA3AF" style={styles.input} />
          <Text style={styles.label}>Price</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#9CA3AF" style={styles.input} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TouchableOpacity style={styles.pickBtn} onPress={pickImage}><Text style={styles.pickText}>Select an Image</Text></TouchableOpacity>
            {(pickedUri || imageUrl) && (
              <Image source={{ uri: (pickedUri || imageUrl)! }} style={styles.previewImage} />
            )}
          </View>
          <Text style={styles.label}>Category</Text>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(c) => c}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={onAdd}><Text style={styles.primaryText}>Add Product</Text></TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowMeta}>{item.category} • ₱{item.price} {item.available === false ? '• Unavailable' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.smallBtn} onPress={() => updateProduct({ ...item, available: !item.available })}>
            <Text style={styles.smallText}>{item.available === false ? 'Enable' : 'Disable'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#FCA5A5' }]} onPress={() => deleteProduct(item.id)}>
            <Text style={styles.smallText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 16, gap: 0 }}
    />
  );
}

function OrdersTab() {
  const { orders, updateOrderStatus } = useAppStore();
  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName}>{item.customerName || item.id}</Text>
            <Text style={styles.rowMeta}>{item.items.length} items • ₱{item.total} • {new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.rowMeta}>
              Status: <Text style={{ color: item.status === 'Delivered' ? '#059669' : item.status === 'Cancelled' ? '#EF4444' : '#374151' }}>{item.status}</Text>
            </Text>
            {item.customerPhone ? (<Text style={styles.rowMeta}>Phone: {item.customerPhone}</Text>) : null}
            {item.address ? (<Text style={styles.rowMeta}>Address: {item.address}</Text>) : null}
            <Text style={styles.rowMeta}>Items:</Text>
            {item.items.map(it => (
              <Text key={it.product.id} style={styles.rowMeta}>{it.product.name} x {it.qty}</Text>
            ))}
          </View>
          <View style={{ gap: 6 }}>
            {ORDER_STATUSES.map(s => (
              <TouchableOpacity key={s} style={styles.smallBtn} onPress={() => updateOrderStatus(item.id, s)}>
                <Text style={styles.smallText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
}

function UsersTab() {
  const { users, deleteUser } = useAppStore();
  return (
    <FlatList
      data={users}
      keyExtractor={(u, i) => u.name + i}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowMeta}>Username: {item.username || '-'}</Text>
            <Text style={styles.rowMeta}>Phone: {item.phone || '-'}</Text>
            <Text style={styles.rowMeta}>Address: {item.address || '-'}</Text>
            <Text style={styles.rowMeta}>Role: {item.role}</Text>
          </View>
          {item.role !== 'admin' && (
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: '#FCA5A5' }]}
              onPress={() =>
                Alert.alert('Remove User', `Remove ${item.name}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => deleteUser({ username: item.username, name: item.name }) },
                ])
              }
            >
              <Text style={styles.smallText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

function PaymentsTab() {
  const { orders, updatePaymentStatus } = useAppStore();
  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName}>{item.customerName || item.id}</Text>
            <Text style={styles.rowMeta}>Payment: {item.paymentStatus || 'Pending'} </Text>
          </View>
          <View style={{ gap: 6 }}>
            {PAYMENT_STATUSES.map(s => (
              <TouchableOpacity key={s} style={styles.smallBtn} onPress={() => updatePaymentStatus(item.id, s)}>
                <Text style={styles.smallText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
}

function ReportsTab() {
  const { orders } = useAppStore();

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + o.total;
    }
    return Object.entries(map).sort();
  }, [orders]);

  const topSelling = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      for (const it of o.items) {
        map[it.product.name] = (map[it.product.name] || 0) + it.qty;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Revenue</Text>
        {revenueByMonth.map(([m, v]) => (
          <Text key={m} style={styles.rowMeta}>{m}: ₱{v.toFixed(2)}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top-Selling Desserts</Text>
        {topSelling.map(([n, q]) => (
          <Text key={n} style={styles.rowMeta}>{n}: {q}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 },
  headerLogo: { width: 80, height: 80 },
  title: { fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 12 },
  meta: { color: '#6B7280', marginBottom: 8 },
  actionBar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  signOutBtn: { backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  signOutText: { color: '#fff', fontWeight: '900' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tab: { backgroundColor: '#FEC9F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999 },
  tabActive: { backgroundColor: '#C8F9FD' },
  tabText: { color: '#6B7280', fontWeight: '700' },
  tabTextActive: { color: '#111827' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { fontWeight: '900', color: '#111827', marginBottom: 8 },

  label: { fontWeight: '800', color: '#1F2937', marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: '#C8F9FD', borderRadius: 12, paddingHorizontal: 12, height: 42, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#FFB74D', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', alignSelf: 'flex-start', marginTop: 8 },
  primaryText: { color: '#111827', fontWeight: '900' },
  pickBtn: { backgroundColor: '#FEC9F0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  pickText: { color: '#111827', fontWeight: '800' },
  previewImage: { width: 48, height: 48, borderRadius: 8 },

  chip: { backgroundColor: '#FEC9F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999 },
  chipActive: { backgroundColor: '#C8F9FD' },
  chipText: { color: '#6B7280', fontWeight: '700' },
  chipTextActive: { color: '#111827' },

  row: { backgroundColor: '#C8F9FD', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  rowMeta: { color: '#374151', marginTop: 2 },
  smallBtn: { backgroundColor: '#FEC9F0', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center' },
  smallText: { color: '#111827', fontWeight: '800', fontSize: 12 },
});
