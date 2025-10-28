import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useAppStore } from '../store/AppStore';

type PaymentMethod = 'paypal' | 'gcash' | 'maya' | 'cod' | 'card';

export default function Checkout() {
  const { user, placeOrder, setScreen, cart } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const total = cart.reduce((s, ci) => s + ci.product.price * ci.qty, 0);
  const deliveryFee = total > 500 ? 0 : 50; // Free delivery over ₱500
  const finalTotal = total + deliveryFee;

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: '💳', color: '#003087' },
    { id: 'gcash', name: 'GCash', icon: '📱', color: '#0070BA' },
    { id: 'maya', name: 'Maya', icon: '💙', color: '#00A0E3' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: '#1F2937' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💰', color: '#059669' },
  ];

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return false;
    }
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const onPay = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(() => resolve(undefined), 2000));
      
      const order = placeOrder(address, {
        paymentMethod: selectedPayment,
        specialInstructions,
        customerName: name,
        customerPhone: phone,
      });
      
      if (order) {
        Alert.alert(
          'Payment Successful! 🎉', 
          `Your order #${order.id} has been placed successfully.\n\nPayment Method: ${paymentMethods.find(p => p.id === selectedPayment)?.name}\nTotal: ₱${finalTotal.toFixed(2)}`,
          [{ text: 'View Orders', onPress: () => setScreen('orders') }]
        );
      } else {
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Checkout</Text>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.product.id}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemDetails}>
                ₱{item.product.price} × {item.qty} = ₱{(item.product.price * item.qty).toFixed(2)}
              </Text>
            </View>
          )}
        />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Delivery Fee:</Text>
          <Text style={styles.totalValue}>
            {deliveryFee === 0 ? 'FREE' : `₱${deliveryFee.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={styles.finalTotalLabel}>Total:</Text>
          <Text style={styles.finalTotalValue}>₱{finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Delivery Address *</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter complete address"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Special Instructions (Optional)</Text>
        <TextInput
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          placeholder="Any special delivery instructions..."
          placeholderTextColor="#9CA3AF"
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPayment === method.id && styles.selectedPaymentMethod
            ]}
            onPress={() => setSelectedPayment(method.id as PaymentMethod)}
          >
            <Text style={styles.paymentIcon}>{method.icon}</Text>
            <Text style={[
              styles.paymentName,
              selectedPayment === method.id && styles.selectedPaymentName
            ]}>
              {method.name}
            </Text>
            {selectedPayment === method.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Pay Button */}
      <TouchableOpacity 
        style={[styles.payBtn, isProcessing && styles.payBtnDisabled]} 
        onPress={onPay}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payText}>
            {selectedPayment === 'cod' ? 'Place Order' : `Pay ₱${finalTotal.toFixed(2)}`}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 20 },
  headerLogo: { width: 80, height: 80 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginLeft: 12 },
  
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontWeight: '600', color: '#374151', flex: 1 },
  itemDetails: { color: '#6B7280', fontSize: 14 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { color: '#6B7280', fontSize: 16 },
  totalValue: { fontWeight: '600', color: '#111827', fontSize: 16 },
  finalTotal: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 8 },
  finalTotalLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  finalTotalValue: { fontSize: 18, fontWeight: '700', color: '#059669' },
  
  label: { fontWeight: '600', color: '#374151', marginBottom: 8, fontSize: 16 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  selectedPaymentMethod: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  paymentIcon: { fontSize: 24, marginRight: 12 },
  paymentName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#374151' },
  selectedPaymentName: { color: '#1D4ED8' },
  checkmark: { fontSize: 20, color: '#059669', fontWeight: 'bold' },
  
  payBtn: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  payBtnDisabled: { backgroundColor: '#9CA3AF' },
  payText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
 