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
  const { loginWithPassword, setScreen } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    const ok = loginWithPassword(username, password);
    if (!ok) {
      Alert.alert('Login Failed', 'Invalid credentials or unregistered account. Please register first or check your password.');
      return;
    }
    const nameLower = (username || '').trim().toLowerCase();
    setScreen(nameLower === 'admin' ? 'admin' : 'home');
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
