import React from 'react';
import { StatusBar, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useAppStore } from './store/AppStore';
import Login from './auth/login';
import Register from './auth/register';
import Landing from './screens/Landing';
import Home from './screens/Home';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import Orders from './screens/Orders';
import Profile from './screens/Profile';
import Notifications from './screens/Notifications';
import Admin from './screens/Admin.tsx';
import BottomTabs from './components/BottomTabs';
import Header from './components/Header';

function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <Header />
        <RootRouter />
        <BottomTabs />
      </SafeAreaProvider>
    </AppProvider>
  );
}

function RootRouter() {
  const { screen, user } = useAppStore();
  if (screen === 'welcome') return <AppContent />;
  if (screen === 'login') return <Login />;
  if (screen === 'register') return <Register />;
  if (screen === 'landing') return user ? <Landing /> : <Login />;
  if (screen === 'home') return user ? <Home /> : <Login />;
  if (screen === 'cart') return <Cart />;
  if (screen === 'checkout') return <Checkout />;
  if (screen === 'orders') return <Orders />;
  if (screen === 'profile') return <Profile />;
  if (screen === 'notifications') return <Notifications />;
  if (screen === 'admin') return <Admin />;
  return null;
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { setScreen } = useAppStore();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <View style={styles.content}>
        <Image
          source={require('./images/kimkles_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => setScreen('login')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>@Kimkles 2021 | Made with Love</Text>
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
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  button: {
    backgroundColor: '#FFD9E8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    minWidth: 260,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    marginBottom: 24,
    color: '#6B7280',
    fontSize: 14,
  },
});

export default App;
