import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Alert, ScrollView } from 'react-native';
import { CATEGORIES } from '../data/products';
import { OrderStatus, PaymentStatus, Product, useAppStore } from '../store/AppStore';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['Paid', 'Pending', 'Failed', 'Refunded'];

type Tab = 'Dashboard' | 'Products' | 'Orders' | 'Users' | 'Payments' | 'Reports';

export default function Admin() {
  const { user, setScreen, logout, adminNotifications, addAdminNotification, markAdminNotificationsAsRead } = useAppStore();
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Only</Text>
        <Text style={styles.meta}>You must be logged in as an admin to access this screen.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen('welcome')}>
          <Text style={styles.primaryText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

 return (
  <View style={styles.adminContainer}>
    {/* Admin Header */}
    <View style={styles.adminHeader}>
      <View style={styles.adminHeaderLeft}>
        <View style={styles.adminLogoContainer}>
          <Image source={require('../images/kimkles_logo.png')} style={styles.adminLogo} resizeMode="contain" />
        </View>
        <View style={styles.adminHeaderInfo}>
          <Text style={styles.adminTitle}>Admin Control Panel</Text>
          <Text style={styles.adminSubtitle}>Welcome back, {user.name}</Text>
          <Text style={styles.adminRole}>Administrator</Text>
      </View>
      </View>
      
      <View style={styles.adminHeaderActions}>
        <TouchableOpacity 
          style={styles.adminNotificationButton}
          onPress={() => {
            console.log('Admin notification button pressed');
            markAdminNotificationsAsRead();
            setShowNotifications(true);
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require('../images/notification.png')}
            style={styles.adminNotificationIcon}
            resizeMode="contain"
          />
          {adminNotifications.filter(n => !n.read).length > 0 && (
            <View style={styles.adminNotificationBadge}>
              <Text style={styles.adminNotificationBadgeText}>
                {adminNotifications.filter(n => !n.read).length > 9 ? '9+' : adminNotifications.filter(n => !n.read).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.adminLogoutButton} 
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout }
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.adminLogoutText}>Sign Out</Text>
      </TouchableOpacity>
      </View>
    </View>

    {/* Admin Navigation */}
    <View style={styles.adminNavigation}>
      <View style={styles.adminNavGrid}>
      {(['Dashboard','Products','Orders','Users','Payments','Reports'] as Tab[]).map(t => (
          <TouchableOpacity 
            key={t} 
            style={[styles.adminNavItem, tab === t && styles.adminNavItemActive]} 
            onPress={() => setTab(t)}
          >
            <Text style={[styles.adminNavText, tab === t && styles.adminNavTextActive]}>{t}</Text>
        </TouchableOpacity>
      ))}
      </View>
    </View>

    {/* Admin Content */}
    <View style={styles.adminContent}>
    {tab === 'Dashboard' && <DashboardTab />}
    {tab === 'Products' && <ProductsTab />}
    {tab === 'Orders' && <OrdersTab />}
    {tab === 'Users' && <UsersTab />}
    {tab === 'Payments' && <PaymentsTab />}
    {tab === 'Reports' && <ReportsTab />}
    </View>

    {/* Admin Notifications Modal */}
    {showNotifications && (
      <View style={styles.notificationsModal}>
        <View style={styles.notificationsModalContent}>
          <View style={styles.notificationsModalHeader}>
            <Text style={styles.notificationsModalTitle}>Admin Notifications</Text>
            <TouchableOpacity
              style={styles.notificationsModalClose}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.notificationsModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.notificationsModalList}>
            {adminNotifications.map((notification) => (
              <View key={notification.id} style={styles.notificationsModalItem}>
                <View style={styles.notificationsModalIcon}>
                  <Text style={styles.notificationsModalEmoji}>
                    {notification.type === 'order' ? '🛒' : notification.type === 'admin' ? '👨‍💼' : '🔔'}
                  </Text>
                </View>
                <View style={styles.notificationsModalItemContent}>
                  <Text style={styles.notificationsModalItemTitle}>{notification.title}</Text>
                  <Text style={styles.notificationsModalItemMessage}>{notification.message}</Text>
                  <Text style={styles.notificationsModalItemTime}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
            
            {adminNotifications.length === 0 && (
              <View style={styles.notificationsModalEmpty}>
                <Text style={styles.notificationsModalEmptyIcon}>🔔</Text>
                <Text style={styles.notificationsModalEmptyTitle}>No Notifications</Text>
                <Text style={styles.notificationsModalEmptyMessage}>
                  You're all caught up! We'll notify you when something new happens.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    )}
  </View>
);
}

function DashboardTab() {
  const { orders, products, users, adminNotifications, markAdminNotificationsAsRead, logout } = useAppStore();
  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  
  return (
    <ScrollView style={styles.adminScrollView} showsVerticalScrollIndicator={false}>
      {/* Key Metrics Cards */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={styles.metricIconContainer}>
            <Text style={styles.metricIcon}>📦</Text>
        </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{products.length}</Text>
            <Text style={styles.metricLabel}>Total Products</Text>
            <Text style={styles.metricChange}>+2 this week</Text>
        </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconContainer}>
            <Text style={styles.metricIcon}>🛒</Text>
        </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{orders.length}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricChange}>+12 today</Text>
      </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconContainer}>
            <Text style={styles.metricIcon}>👥</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>{users.length}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
            <Text style={styles.metricChange}>+5 this week</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconContainer}>
            <Text style={styles.metricIcon}>💰</Text>
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricValue}>₱{totalRevenue.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricChange}>+15% this month</Text>
          </View>
        </View>
      </View>

      {/* Pending Orders Alert */}
      {pendingOrders > 0 && (
        <View style={styles.pendingOrdersAlert}>
          <View style={styles.pendingOrdersIcon}>
            <Text style={styles.pendingOrdersEmoji}>⚠️</Text>
          </View>
          <View style={styles.pendingOrdersContent}>
            <Text style={styles.pendingOrdersTitle}>
              {pendingOrders} Order{pendingOrders > 1 ? 's' : ''} Pending Approval
            </Text>
            <Text style={styles.pendingOrdersMessage}>
              {pendingOrders === 1 
                ? 'There is 1 order waiting for your approval.' 
                : `There are ${pendingOrders} orders waiting for your approval.`
              }
            </Text>
          </View>
        </View>
      )}

      {/* Order Status Overview */}
      <View style={styles.statusOverviewCard}>
        <Text style={styles.sectionTitle}>Order Status Overview</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusCount}>{pendingOrders}</Text>
            <Text style={styles.statusLabel}>Pending</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.statusCount}>{preparingOrders}</Text>
            <Text style={styles.statusLabel}>Preparing</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusCount}>{deliveredOrders}</Text>
            <Text style={styles.statusLabel}>Delivered</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {adminNotifications.slice(0, 4).map((notification, index) => (
            <View key={notification.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>
                  {notification.type === 'order' ? '🛒' : notification.type === 'admin' ? '👨‍💼' : '🔔'}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{notification.title}</Text>
                <Text style={styles.activityDescription}>{notification.message}</Text>
                <Text style={styles.activityTime}>
                  {new Date(notification.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

       {/* Quick Actions */}
       <View style={styles.quickActionsCard}>
         <Text style={styles.sectionTitle}>Quick Actions</Text>
         <View style={styles.quickActionsGrid}>
           <TouchableOpacity style={styles.quickActionButton}>
             <Text style={styles.quickActionIcon}>➕</Text>
             <Text style={styles.quickActionText}>Add Product</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickActionButton}>
             <Text style={styles.quickActionIcon}>📊</Text>
             <Text style={styles.quickActionText}>View Reports</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickActionButton}>
             <Text style={styles.quickActionIcon}>👥</Text>
             <Text style={styles.quickActionText}>Manage Users</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.quickActionButton}>
             <Text style={styles.quickActionIcon}>⚙️</Text>
             <Text style={styles.quickActionText}>Settings</Text>
           </TouchableOpacity>
         </View>
       </View>

       {/* Admin Actions */}
       {/* <View style={styles.adminActionsCard}>
         <Text style={styles.sectionTitle}>Admin Actions</Text>
         <View style={styles.adminActionsGrid}>
                  <TouchableOpacity
                    style={styles.adminActionButton}
                    onPress={() => {
                      markAdminNotificationsAsRead();
                      // This will be handled by the parent component's showNotifications state
                    }}
                  >
                    <Text style={styles.adminActionIcon}>🔔</Text>
                    <Text style={styles.adminActionText}>Notifications</Text>
                    {adminNotifications.filter(n => !n.read).length > 0 && (
                      <View style={styles.adminActionBadge}>
                        <Text style={styles.adminActionBadgeText}>
                          {adminNotifications.filter(n => !n.read).length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
           
           <TouchableOpacity 
             style={[styles.adminActionButton, styles.adminActionButtonDanger]}
             onPress={() => {
               Alert.alert(
                 'Sign Out',
                 'Are you sure you want to sign out?',
                 [
                   { text: 'Cancel', style: 'cancel' },
                   { text: 'Sign Out', style: 'destructive', onPress: logout }
                 ]
               );
             }}
           >
             <Text style={styles.adminActionText}>Sign Out</Text>
           </TouchableOpacity>
      </View>
      </View> */}
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
  const { orders, updateOrderStatus, addNotification, addAdminNotification } = useAppStore();
  
  // Sort orders with pending orders first
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (b.status === 'Pending' && a.status !== 'Pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    // Create notification for customer about status update
    const statusMessages = {
      'Pending': 'Your order is confirmed and pending! ⏳',
      'Preparing': 'Your order is being prepared! 👨‍🍳',
      'Out for Delivery': 'Your order is out for delivery! 🚚',
      'Delivered': 'Your order has been delivered! 📦',
      'Cancelled': 'Your order has been cancelled. 😔'
    };
    
    const statusMessage = statusMessages[newStatus];
    if (statusMessage) {
      addNotification(statusMessage, `Order #${orderId} status updated to: ${newStatus}`, 'order');
    }
    
    // Create admin notification for status update
    const adminStatusMessages = {
      'Pending': 'Order Status Updated',
      'Preparing': 'Order Status Updated', 
      'Out for Delivery': 'Order Status Updated',
      'Delivered': 'Order Status Updated',
      'Cancelled': 'Order Status Updated'
    };
    
    const adminMessage = adminStatusMessages[newStatus];
    if (adminMessage) {
      addAdminNotification(
        adminMessage, 
        `Order #${orderId} status changed to: ${newStatus}`, 
        'order'
      );
    }
  };
  
  const handleQuickApprove = (orderId: string) => {
    Alert.alert(
      'Approve Order',
      'Are you sure you want to approve this order and start preparing it?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve & Start Preparing', 
          onPress: () => {
            handleStatusUpdate(orderId, 'Preparing');
            addAdminNotification(
              'Order Approved! ✅',
              `Order #${orderId} has been approved and is now being prepared.`,
              'order'
            );
          }
        }
      ]
    );
  };
  
  return (
    <FlatList
      data={sortedOrders}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => (
        <View style={[
          styles.row,
          item.status === 'Pending' && styles.pendingOrderRow
        ]}>
          <View style={{ flex: 1 }}>
            <View style={styles.orderHeader}>
              <Text style={styles.rowName}>Order #{item.id}</Text>
              <View style={[
                styles.statusBadge,
                item.status === 'Pending' ? styles.statusBadgePending :
                item.status === 'Delivered' ? styles.statusBadgeDelivered :
                item.status === 'Cancelled' ? styles.statusBadgeCancelled :
                styles.statusBadgeDefault
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'Pending' ? styles.statusTextPending :
                  item.status === 'Delivered' ? styles.statusTextDelivered :
                  item.status === 'Cancelled' ? styles.statusTextCancelled :
                  styles.statusTextDefault
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
            
            <Text style={styles.customerName}>{item.customerName || 'Unknown Customer'}</Text>
            <Text style={styles.rowMeta}>{item.items.length} items • ₱{item.total.toFixed(2)} • {new Date(item.createdAt).toLocaleString()}</Text>
            
            {item.customerPhone && <Text style={styles.rowMeta}>📞 {item.customerPhone}</Text>}
            {item.address && <Text style={styles.rowMeta}>📍 {item.address}</Text>}
            
            <Text style={styles.itemsTitle}>Items:</Text>
            {item.items.map(it => (
              <Text key={it.product.id} style={styles.itemText}>
                • {it.product.name} x {it.qty} (₱{(it.product.price * it.qty).toFixed(2)})
              </Text>
            ))}
          </View>
          
          <View style={styles.orderActions}>
            {item.status === 'Pending' && (
              <TouchableOpacity 
                style={[styles.smallBtn, styles.approveBtn]} 
                onPress={() => handleQuickApprove(item.id)}
              >
                <Text style={[styles.smallText, styles.approveText]}>✅ Approve</Text>
              </TouchableOpacity>
            )}
            
            {ORDER_STATUSES.map(s => (
              <TouchableOpacity 
                key={s} 
                style={[
                  styles.smallBtn, 
                  item.status === s && styles.activeStatusBtn
                ]} 
                onPress={() => handleStatusUpdate(item.id, s)}
              >
                <Text style={[
                  styles.smallText,
                  item.status === s && styles.activeStatusText
                ]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
}

function UsersTab() {
  const { users, fetchUsers } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.usersContainer}>
      <View style={styles.usersHeader}>
        <Text style={styles.usersTitle}>Users ({users.length})</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? '🔄' : '↻'} Refresh
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={users}
        keyExtractor={(u, i) => u.id?.toString() || u.name + i}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={[styles.row, item.role === 'admin' && styles.adminRow]}>
            <View style={{ flex: 1 }}>
              <View style={styles.userHeader}>
                <Text style={styles.rowName}>{item.name}</Text>
                {item.role === 'admin' && (
                  <Text style={styles.adminBadge}>ADMIN</Text>
                )}
              </View>
              <Text style={styles.rowMeta}>Username: {item.username || '-'}</Text>
              <Text style={styles.rowMeta}>Phone: {item.phone || '-'}</Text>
              <Text style={styles.rowMeta}>Address: {item.address || '-'}</Text>
              <Text style={styles.rowMeta}>Role: {item.role}</Text>
              {item.created_at && (
                <Text style={styles.rowMeta}>
                  Joined: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View style={styles.userActions}>
              {item.role !== 'admin' && (
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#FCA5A5' }]}
                  onPress={() =>
                    Alert.alert('User Info', `User: ${item.name}\nUsername: ${item.username}\nPhone: ${item.phone}\nAddress: ${item.address}`)
                  }
                >
                  <Text style={styles.smallText}>Info</Text>
                </TouchableOpacity>
              )}
            </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      }
    />
  </View>
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
  // Admin-specific container
  adminContainer: { 
    flex: 1, 
    backgroundColor: '#E4D7FF', 
    paddingTop: 0
  },
  
  // Admin Header
  adminHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  adminHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  adminLogoContainer: {
    width: 20,
    height: 20,
    borderRadius: 25,
    backgroundColor: '#FFB74D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  adminLogo: {
    width: 70,
    height: 70,
  },
  adminHeaderInfo: {
    flex: 1
  },
  adminTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2
  },
  adminSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2
  },
  adminRole: {
    fontSize: 12,
    color: '#FFB74D',
    fontWeight: '600'
  },
  adminHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  adminNotificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD9E8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  adminNotificationIcon: {
    width: 22,
    height: 22,
    tintColor: '#111827'
  },
  adminNotificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  adminNotificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700'
  },
  adminLogoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  adminLogoutIcon: {
    fontSize: 14,
    marginRight: 4
  },
  adminLogoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12
  },

  // Admin Navigation
  adminNavigation: {
    backgroundColor: '#C8F9FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  adminNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  adminNavItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
    flex: 1,
    maxWidth: '48%'
  },
  adminNavItemActive: {
    backgroundColor: '#FFB74D'
  },
  adminNavText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12
  },
  adminNavTextActive: {
    color: '#FFFFFF'
  },

  // Admin Content
  adminContent: {
    flex: 1,
    backgroundColor: '#E4D7FF'
  },
  adminScrollView: {
    flex: 1,
    padding: 20
  },

  // Dashboard Styles
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#C8F9FD',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEC9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  metricIcon: {
    fontSize: 24
  },
  metricContent: {
    flex: 1
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  metricChange: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600'
  },

  statusOverviewCard: {
    backgroundColor: '#C8F9FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statusItem: {
    alignItems: 'center'
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280'
  },

  activityCard: {
    backgroundColor: '#C8F9FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  activityList: {
    gap: 16
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEC9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  activityEmoji: {
    fontSize: 20
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  activityDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  activityTime: {
    fontSize: 10,
    color: '#9CA3AF'
  },

  quickActionsCard: {
    backgroundColor: '#C8F9FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FEC9F0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600'
  },

  // Admin Actions
  adminActionsCard: {
    backgroundColor: '#C8F9FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  adminActionsGrid: {
    flexDirection: 'row',
    gap: 12
  },
  adminActionButton: {
    flex: 1,
    backgroundColor: '#FEC9F0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative'
  },
  adminActionButtonDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5'
  },
  adminActionIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  adminActionText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600'
  },
  adminActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  adminActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },

  // Admin Orders Styles
  adminOrdersContainer: {
    gap: 16
  },
  adminOrderCard: {
    backgroundColor: '#C8F9FD',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  adminOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  adminOrderInfo: {
    flex: 1
  },
  adminOrderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  adminOrderCustomer: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  adminOrderDate: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  adminOrderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12
  },
  adminOrderStatusPending: {
    backgroundColor: '#F59E0B'
  },
  adminOrderStatusPreparing: {
    backgroundColor: '#3B82F6'
  },
  adminOrderStatusDelivered: {
    backgroundColor: '#10B981'
  },
  adminOrderStatusCancelled: {
    backgroundColor: '#EF4444'
  },
  adminOrderStatusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  adminOrderStatusTextPending: {
    color: '#FFFFFF'
  },
  adminOrderStatusTextPreparing: {
    color: '#FFFFFF'
  },
  adminOrderStatusTextDelivered: {
    color: '#FFFFFF'
  },
  adminOrderStatusTextCancelled: {
    color: '#FFFFFF'
  },
  adminOrderDetails: {
    marginBottom: 16
  },
  adminOrderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  adminOrderItems: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  adminOrderContact: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  adminOrderAddress: {
    fontSize: 12,
    color: '#6B7280'
  },
  adminOrderItemsList: {
    marginBottom: 16
  },
  adminOrderItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  adminOrderItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2
  },
  adminOrderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  adminStatusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  adminStatusButtonActive: {
    backgroundColor: '#FFB74D',
    borderColor: '#FFB74D'
  },
  adminStatusButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  adminStatusButtonTextActive: {
    color: '#FFFFFF'
  },

  // Legacy styles for other tabs
  container: { 
    flex: 1, 
    backgroundColor: '#E4D7FF', 
    padding: 16 
  },
  
  // Update searchCard to match the enhanced version
  searchCard: {
    backgroundColor: '#C8F9FD',
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
    backgroundColor: '#C8F9FD',
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
    backgroundColor: '#FEC9F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterBtnActive: {
    backgroundColor: '#C8F9FD',
    borderColor: '#C8F9FD'
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
    backgroundColor: '#C8F9FD',
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
    backgroundColor: '#C8F9FD',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD9E8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative'
  },
  notificationIcon: {
    width: 22,
    height: 22,
    tintColor: '#111827'
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
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
    gap: 10, 
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  tab: { 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 18, 
    paddingVertical: 12, 
    borderRadius: 16,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  tabActive: { 
    backgroundColor: '#FFB74D',
    borderColor: '#FFB74D',
    shadowColor: '#FFB74D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }]
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
    backgroundColor: '#C8F9FD', 
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8
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
    backgroundColor: '#C8F9FD', 
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
    backgroundColor: '#FEC9F0', 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 12, 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    marginTop: 12,
    shadowColor: '#FEC9F0',
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
    backgroundColor: '#C8F9FD', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: '#FEC9F0', 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  smallText: { 
    color: '#374151', 
    fontWeight: '600', 
    fontSize: 12 
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
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
  },

  // Enhanced Order Styles
  pendingOrderRow: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FEF3C7'
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4
  },
  itemText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2
  },
  orderActions: {
    gap: 6,
    alignItems: 'flex-end'
  },
  approveBtn: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  approveText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  activeStatusBtn: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  activeStatusText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B'
  },
  statusTextPending: {
    color: '#D97706',
    fontWeight: '700'
  },

  // Pending Orders Alert Styles
  pendingOrdersAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  pendingOrdersIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  pendingOrdersEmoji: {
    fontSize: 24
  },
  pendingOrdersContent: {
    flex: 1
  },
  pendingOrdersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 4
  },
  pendingOrdersMessage: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20
  },

  // Admin Notifications Modal Styles
  notificationsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  notificationsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  notificationsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  notificationsModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  notificationsModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationsModalCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600'
  },
  notificationsModalList: {
    maxHeight: 400,
    padding: 16
  },
  notificationsModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  notificationsModalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEC9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  notificationsModalEmoji: {
    fontSize: 20
  },
  notificationsModalItemContent: {
    flex: 1
  },
  notificationsModalItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  notificationsModalItemMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  notificationsModalItemTime: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  notificationsModalEmpty: {
    alignItems: 'center',
    padding: 40
  },
  notificationsModalEmptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  notificationsModalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  notificationsModalEmptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  },
  
  usersContainer: {
    flex: 1,
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminRow: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  adminBadge: {
    backgroundColor: '#F59E0B',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
