import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useAppStore } from '../store/AppStore';

export default function Profile() {
  const { user, updateProfile, logout, setScreen } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const onSave = () => {
    updateProfile({ name, address, phone });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.title}>Kimkle's Profile</Text>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Address</Text>
      <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Address" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="Phone" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}><Text style={styles.saveText}>Save</Text></TouchableOpacity>

      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.link} onPress={() => setScreen('admin')}>
          <Text style={styles.linkText}>Admin Dashboard</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.link} onPress={() => setScreen('orders')}><Text style={styles.linkText}>View Orders</Text></TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={logout}><Text style={[styles.linkText, { color: '#EF4444' }]}>Sign Out</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 1 },
  headerLogo: { width: 80, height: 80},
  title: { fontSize: 18, fontWeight: '500', color: '#111827' },
  label: { fontWeight: '800', color: '#1F2937', marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: '#C8F9FD', borderRadius: 12, paddingHorizontal: 12, height: 42 },
  saveBtn: { backgroundColor: '#FFB74D', marginTop: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '900' },
  link: { marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontWeight: '900', color: '#111827'},
});
