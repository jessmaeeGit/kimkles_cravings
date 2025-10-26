import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { Screen, useAppStore } from '../store/AppStore';

const TABS: { key: Screen; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'cart', label: 'Cart' },
  { key: 'orders', label: 'Orders' },
  { key: 'profile', label: 'Profile' },
];

export default function BottomTabs() {
  const { screen, setScreen, cart } = useAppStore();
  const cartCount = cart.reduce((sum, ci) => sum + ci.qty, 0);
  if (screen === 'welcome' || screen === 'login' || screen === 'register' || screen === 'admin') return null;

  return (
    <View style={styles.bar}>
      {TABS.map(t => (
        <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setScreen(t.key)}>
          <View style={styles.iconWrap}>
            <Image
              source={iconFor(t.key)}
              style={[styles.icon, screen === t.key && styles.iconActive]}
              resizeMode="contain"
            />
            {t.key === 'cart' && cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, screen === t.key && styles.active]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function iconFor(key: Screen) {
  switch (key) {
    case 'home':
      return require('../images/home.png');
    case 'cart':
      return require('../images/cart.png');
    case 'orders':
      return require('../images/orders.png');
    case 'profile':
      return require('../images/profile.png');
    default:
      return require('../images/home.png');
  }
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FEC9F0',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  iconWrap: {
    position: 'relative',
  },
  icon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    tintColor: '#6B7280',
  },
  iconActive: {
    tintColor: '#111827',
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  label: {
    color: '#6B7280',
    fontWeight: '700',
  },
  active: {
    color: '#111827',
  },
});
