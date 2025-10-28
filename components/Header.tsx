import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, useAppStore } from '../store/AppStore';

export default function Header() {
  const insets = useSafeAreaInsets();
  const { screen, setScreen, user, notifications, markNotificationsAsRead } = useAppStore();
  
  // Don't show header on welcome, login, register, notifications, or admin screens
  if (screen === 'welcome' || screen === 'login' || screen === 'register' || screen === 'notifications' || screen === 'admin') {
    return null;
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../images/kimkles_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => {
                      markNotificationsAsRead();
                      setScreen('notifications');
                    }}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require('../images/notification.png')}
                      style={styles.notificationIcon}
                      resizeMode="contain"
                    />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>
                          {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setScreen('profile')}
            activeOpacity={0.7}
          >
            <Image
              source={user?.profileImage ? { uri: user.profileImage } : require('../images/profile.png')}
              style={styles.profileIcon}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FEC9F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD9E8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    position: 'relative',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    tintColor: '#111827',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD9E8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    overflow: 'hidden',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

