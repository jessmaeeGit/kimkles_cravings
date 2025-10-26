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
      <View style={styles.headerLeft}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user.name}</Text>
        </View>
      </View>
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
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Products</Text>
          <Text style={styles.statsValue}>{products.length}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Orders</Text>
          <Text style={styles.statsValue}>{orders.length}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Users</Text>
          <Text style={styles.statsValue}>{users.length}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Revenue</Text>
          <Text style={styles.statsValue}>₱{totalRevenue.toFixed(2)}</Text>
        </View>
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
      <View style={[
        styles.statusBadge,
        item.status === 'Delivered' ? styles.statusBadgeDelivered :
        item.status === 'Cancelled' ? styles.statusBadgeCancelled :
        styles.statusBadgeDefault
      ]}>
        <Text style={[
          styles.statusText,
          item.status === 'Delivered' ? styles.statusTextDelivered :
          item.status === 'Cancelled' ? styles.statusTextCancelled :
          styles.statusTextDefault
        ]}>
          {item.status}
        </Text>
      </View>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');

  // Filter orders based on search criteria
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply date filters
    if (activeFilter !== 'all') {
      const now = new Date();
      let filterStartDate: Date;

      switch (activeFilter) {
        case 'today':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end date
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= start && orderDate <= end;
            });
          }
          return filtered;
        default:
          return filtered;
      }

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= filterStartDate;
      });
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.product.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [orders, searchQuery, startDate, endDate, activeFilter]);

  const revenueByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of filteredOrders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + o.total;
    }
    return Object.entries(map).sort();
  }, [filteredOrders]);

  const topSelling = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of filteredOrders) {
      for (const it of o.items) {
        map[it.product.name] = (map[it.product.name] || 0) + it.qty;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredOrders]);

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setActiveFilter('all');
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
      {/* Search and Filter Section */}
      <View style={styles.searchCard}>
        <Text style={styles.cardTitle}>🔍 Search & Filter Reports</Text>
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, order ID, or product..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Quick Filters:</Text>
          <View style={styles.filterButtons}>
            {(['all', 'today', 'week', 'month', 'custom'] as const).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterBtn, activeFilter === filter && styles.filterBtnActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterBtnText, activeFilter === filter && styles.filterBtnTextActive]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Date Range */}
        {activeFilter === 'custom' && (
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Start Date:</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>End Date:</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        )}

        {/* Clear Filters Button */}
        {(searchQuery || activeFilter !== 'all') && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Clear All Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>📊 Results Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{filteredOrders.length}</Text>
            <Text style={styles.summaryLabel}>Orders Found</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>₱{totalRevenue.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
        </View>
      </View>

      {/* Revenue Report */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Monthly Revenue</Text>
        {revenueByMonth.length > 0 ? (
          revenueByMonth.map(([m, v]) => (
            <View key={m} style={styles.revenueRow}>
              <Text style={styles.revenueMonth}>{m}</Text>
              <Text style={styles.revenueAmount}>₱{v.toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No revenue data for selected period</Text>
        )}
      </View>

      {/* Top Selling Products */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Top-Selling Desserts</Text>
        {topSelling.length > 0 ? (
          topSelling.map(([n, q], index) => (
            <View key={n} style={styles.topSellingRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <Text style={styles.productName}>{n}</Text>
              <Text style={styles.quantitySold}>{q} sold</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No products found for selected criteria</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Add the missing container style at the beginning
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    padding: 16 
  },
  
  // Update searchCard to match the enhanced version
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  
  // Add all the missing search and filter styles
  searchContainer: {
    marginBottom: 16
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#1E293B'
  },
  filterContainer: {
    marginBottom: 16
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  filterBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  dateInputContainer: {
    flex: 1
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  dateInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#1E293B'
  },
  clearBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500'
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  revenueMonth: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },
  revenueAmount: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700'
  },
  topSellingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  rankBadge: {
    backgroundColor: '#3B82F6',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500'
  },
  quantitySold: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600'
  },
  // Keep all your existing styles here (header, tabs, cards, etc.)
  // Just add the missing ones above
      noDataText: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
    paddingVertical: 20
  },
  
  // Essential UI styles
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  headerLogo: { 
    width: 60, 
    height: 60,
    marginRight: 12
  },
  headerTextContainer: {
    flex: 1
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  meta: { 
    color: '#6B7280', 
    marginBottom: 8,
    fontSize: 14
  },
  signOutBtn: { 
    backgroundColor: '#EF4444', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  signOutText: { 
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 14
  },
  tabs: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginBottom: 20,
    backgroundColor: '#C8F9FD',
    padding: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  tab: { 
    backgroundColor: '#FEC9F0', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center'
  },
  tabActive: { 
    backgroundColor: '#FFB74D',
    shadowColor: '#FFB74D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  tabText: { 
    color: '#6B7280', 
    fontWeight: '700',
    fontSize: 13
  },
  tabTextActive: { 
    color: '#111827',
    fontWeight: '700'
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  cardTitle: { 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 16,
    fontSize: 18
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },
  statsValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700'
  },
  label: { 
    fontWeight: '600', 
    color: '#374151', 
    marginTop: 12, 
    marginBottom: 8,
    fontSize: 14
  },
  input: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#1E293B'
  },
  primaryBtn: { 
    backgroundColor: '#FFB74D', 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    marginTop: 12,
    shadowColor: '#FFB74D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  primaryText: { 
    color: '#111827', 
    fontWeight: '800',
    fontSize: 16
  },
  pickBtn: { 
    backgroundColor: '#F1F5F9', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed'
  },
  pickText: { 
    color: '#64748B', 
    fontWeight: '600',
    fontSize: 14
  },
  previewImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0'
  },
  chip: { 
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  chipActive: { 
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  chipText: { 
    color: '#64748B', 
    fontWeight: '600',
    fontSize: 13
  },
  chipTextActive: { 
    color: '#FFFFFF',
    fontWeight: '600'
  },
  row: { 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  rowName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1E293B',
    marginBottom: 4
  },
  rowMeta: { 
    color: '#111827', 
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20
  },
  smallBtn: { 
    backgroundColor: '#F1F5F9', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  smallText: { 
    color: '#374151', 
    fontWeight: '600', 
    fontSize: 12 
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 4
  },
  statusBadgeDelivered: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeDefault: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  statusTextDelivered: {
    color: '#16A34A'
  },
  statusTextCancelled: {
    color: '#DC2626'
  },
  statusTextDefault: {
    color: '#64748B'
  }
});

