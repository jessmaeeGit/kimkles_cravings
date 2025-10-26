 import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/AppStore';

export default function Register() {
  const insets = useSafeAreaInsets();
  const { registerUser, setScreen } = useAppStore();
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const onSignUp = () => {
    const name = fullname || username || 'Customer';
    registerUser({ name, username, phone, address });
    setScreen('login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image source={require('../images/kimkles_logo.png')} style={styles.logo} resizeMode="contain" />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Fullname</Text>
            <TextInput
              value={fullname}
              onChangeText={setFullname}
              placeholder="Fullname"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.aqua]}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.pink]}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+63 9XXXXXXXXX"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.aqua]}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.pink]}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Password"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.aqua]}
              secureTextEntry
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity style={styles.signupButton} activeOpacity={0.85} onPress={onSignUp}>
            <Text style={styles.signupButtonText}>Sign-Up</Text>
          </TouchableOpacity>

          <Text style={styles.loginText}>
            Already have an Kimkles Account?{' '}
            <Text style={styles.loginLink} onPress={() => setScreen('login')}>Login Here</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D8FF',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    flex: 1,
    width: 250,
    height: 250,
    // marginTop: 8,
    // marginBottom: 1,
  },
  fieldGroup: {
    width: '100%',
    // marginTop: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#111827',
  },
  aqua: { backgroundColor: '#CFFAFE' },
  pink: { backgroundColor: '#FFD9E8' },
  signupButton: {
    marginTop: 15,
    backgroundColor: '#EB5757',
    height: 40,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    paddingHorizontal: 24,
    elevation: 1,
  },
  signupButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  loginText: {
    marginTop: 30,
    marginBottom: 5,
    fontSize: 12,
    color: '#1F2937',
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
