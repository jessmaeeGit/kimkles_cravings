 import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/AppStore';

export default function Login() {
  const insets = useSafeAreaInsets();
  const { setScreen, setUser, users, addNotification, addAdminNotification } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const validationForm = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Login', 'Please fill in all fields.');
      return false;
    }
    return true;
  };

  const onLogin = async () => {
    if (validationForm()) {
      // Check for local admin account first
      if (username === 'kimkles.admin' && password === 'kimkles2021') {
        const adminUser = users.find(u => u.username === 'kimkles.admin');
        if (adminUser) {
          setUser(adminUser);
          setScreen('admin');
          setUsername('');
          setPassword('');
          Alert.alert('Success', 'Admin logged in successfully.');
          
          // Add welcome notification for admin
          addAdminNotification('Welcome Admin! 👨‍💼', 'You have successfully logged in as administrator.', 'welcome');
          return;
        }
      }

      // If not admin, try backend API
      try{
        const res = await fetch('https://backend-kimklescravings.up.railway.app/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        })
        let data: any = null;
        try {
          data = await res.json();
        } catch (e) {
          const text = await res.text().catch(() => '');
          if (!res.ok) {
            Alert.alert('Error', text || `Login failed. (${res.status})`);
            return;
          }
          throw e;
        }
        if (res.ok) {
          Alert.alert('Success', 'User logged in successfully.');
          // Set user data from API response
          setUser({
            name: data.user?.name || data.user?.username || username,
            role: data.user?.role || 'customer',
            username: data.user?.username || username,
            phone: data.user?.phone,
            address: data.user?.address
          });
          setScreen('landing');
          setUsername('');
          setPassword('');
          
          // Add welcome notification
          addNotification('Welcome to Kimkles Cravings! 👋', 'Thank you for logging in. Explore our delicious treats!', 'welcome');
        } else {
          Alert.alert('Error', data?.error || `Login failed. (${res.status})`);
        }
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'An error occurred while logging in.');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>WELCOME TO</Text>
          <Image
            source={require('../images/kimkles_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your Username"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.usernameInput]}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.passwordInput]}
              secureTextEntry
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity style={styles.loginButton} activeOpacity={0.85} onPress={onLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.registerText}>
            New to Kimkles?{' '}
            <Text style={styles.registerLink} onPress={() => setScreen('register')}>
              Register Here
            </Text>
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
  heading: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
  },
  logo: {
    width: 240,
    height: 240,
    marginVertical: 8,
  },
  fieldGroup: {
    width: '100%',
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  usernameInput: {
    backgroundColor: '#FFD9E8',
  },
  passwordInput: {
    backgroundColor: '#CFFAFE',
  },
  loginButton: {
    marginTop: 28,
    backgroundColor: '#FFB74D',
    height: 52,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
    paddingHorizontal: 24,
    elevation: 2,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  registerText: {
    marginTop: 20,
    marginBottom: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  registerLink: {
    color: '#6366F1',
    fontWeight: '800',
  },
});
