import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useAppStore } from '../store/AppStore';

export default function Checkout() {
  const { user, placeOrder, setScreen } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const onPay = () => {
    // Placeholder for PayPal integration
    const order = placeOrder(address);
    if (order) {
      Alert.alert('Payment', `Paid via PayPal`);
      setScreen('orders');
    } else {
      Alert.alert('Cart', 'Your cart is empty.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Checkout</Text>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your Fullname"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <TouchableOpacity style={styles.paypalBtn} onPress={onPay}>
        <Text style={styles.paypalText}>Pay with PayPal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 },
  headerLogo: { width: 80, height: 80 },
  title: { fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 12 },
  label: { fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  input: { backgroundColor: '#C8F9FD', borderRadius: 12, paddingHorizontal: 12, height: 42, marginBottom: 16 },
  paypalBtn: { backgroundColor: '#003087', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  paypalText: { color: '#fff', fontWeight: '900' },
});
 