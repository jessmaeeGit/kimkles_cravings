import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useAppStore } from '../store/AppStore';

export default function Cart() {
  const { cart, updateQty, removeFromCart, setScreen } = useAppStore();
  const total = cart.reduce((s, ci) => s + ci.product.price * ci.qty, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Kimkle's Cart</Text>
      </View>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.meta}>₱{item.product.price} x {item.qty}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, Math.max(1, item.qty - 1))}><Text>-</Text></TouchableOpacity>
              <Text style={styles.qty}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.id, item.qty + 1)}><Text>+</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.remove} onPress={() => removeFromCart(item.product.id)}>
              <Text style={{ color: '#EF4444', fontWeight: '800' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₱{total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => setScreen('checkout')}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 1 },
  headerLogo: { width: 80, height: 80},
  title: { fontSize: 18, fontWeight: '500', color: '#111827' },
  empty: { color: '#6B7280' },
  row: { backgroundColor: '#C8F9FD', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '800', color: '#111827' },
  meta: { color: '#6B7280' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 8 },
  qtyBtn: { backgroundColor: '#FFE0F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  qty: { width: 24, textAlign: 'center' },
  remove: { marginLeft: 8, color: '#D84949' },
  footer: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontSize: 16, fontWeight: '900', color: '#111827' },
  checkoutBtn: { backgroundColor: '#FFB74D', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999 },
  checkoutText: { color: '#111827', fontWeight: '900' },
});
