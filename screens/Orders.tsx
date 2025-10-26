import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Order, useAppStore } from '../store/AppStore';

export default function Orders() {
  const { orders, user } = useAppStore();
  const myOrders = useMemo(() => {
    if (!user) return [] as Order[];
    return orders.filter(o => o.customerName && o.customerName === user.name);
  }, [orders, user]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}> Kimkle's Orders</Text>
      </View>
      <FlatList
        data={myOrders}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
        renderItem={({ item }) => <OrderRow order={item} />}
      />
    </View>
  );
}

function OrderRow({ order }: { order: Order }) {
  const date = new Date(order.createdAt).toLocaleString();
  const { updateOrderStatus, addNotification, user } = useAppStore();
  const canCancel = order.status !== 'Delivered' && order.status !== 'Cancelled';
  return (
    <View style={styles.row}>
      <Text style={styles.id}>{order.customerName || order.id}</Text>
      <Text style={styles.meta}>
        {order.items.length} items • ₱{order.total} • 
        <Text style={{ color: order.status === 'Delivered' ? '#059669' : order.status === 'Cancelled' ? '#EF4444' : '#374151' }}>
          {order.status}
        </Text>
      </Text>
      <Text style={styles.date}>{date}</Text>
      {canCancel && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() =>
            Alert.alert(
              'Cancel Order',
              'Are you sure you want to cancel this order?',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes, cancel', style: 'destructive', onPress: () => {
                    updateOrderStatus(order.id, 'Cancelled');
                    addNotification(`Order ${order.id} cancelled by ${user?.name || 'Customer'}`);
                  }
                },
              ]
            )
          }
        >
          <Text style={styles.cancelText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 1 },
  headerLogo: { width: 80, height: 80},
  title: { fontSize: 18, fontWeight: '500', color: '#111827' },
  empty: { color: '#6B7280' },
  row: { backgroundColor: '#C8F9FD', padding: 12, borderRadius: 12, marginBottom: 10 },
  id: { fontWeight: '900', color: '#111827' },
  meta: { color: '#374151', marginTop: 4 },
  date: { color: '#6B7280', marginTop: 2 },
  cancelBtn: { backgroundColor: '#FCA5A5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 8 },
  cancelText: { color: '#111827', fontWeight: '800' },
});
