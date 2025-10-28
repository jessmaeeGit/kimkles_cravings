import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/AppStore';

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { notifications, adminNotifications, addNotification, addAdminNotification, setScreen, markNotificationAsRead, markAdminNotificationAsRead, user } = useAppStore();
  
  // Use admin notifications if user is admin, otherwise use regular notifications
  const displayNotifications = user?.role === 'admin' ? adminNotifications : notifications;
  const markAsRead = user?.role === 'admin' ? markAdminNotificationAsRead : markNotificationAsRead;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'promotion':
        return '🎉';
      case 'delivery':
        return '🚚';
      case 'product':
        return '✨';
      case 'welcome':
        return '👋';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#FFB74D';
      case 'promotion':
        return '#FEC9F0';
      case 'delivery':
        return '#C8F9FD';
      case 'product':
        return '#FFD9E8';
      case 'welcome':
        return '#E8D8FF';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            // If user is admin, go back to admin, otherwise go to landing
            if (user?.role === 'admin') {
              setScreen('admin');
            } else {
              setScreen('landing');
            }
          }}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {displayNotifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationCard,
                !notification.read ? styles.unreadNotification : styles.readNotification
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
            >
              <View style={styles.notificationIconContainer}>
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationColor(notification.type) }
                ]}>
                  <Text style={styles.notificationEmoji}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.read && styles.unreadText
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTime(notification.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State (if no notifications) */}
        {displayNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔔</Text>
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateMessage}>
              You're all caught up! We'll notify you when something new happens.
            </Text>
          </View>
        )}

        {/* Add Sample Notification Button (for testing) */}
        {/* <TouchableOpacity 
          style={styles.addNotificationButton}
          onPress={() => {
            if (user?.role === 'admin') {
              addAdminNotification('Test Admin Notification', 'This is a test admin notification!', 'admin');
            } else {
              addNotification('Test Notification', 'This is a test notification to verify the system works!', 'general');
            }
          }}
        >
          <Text style={styles.addNotificationText}>
            Add Test {user?.role === 'admin' ? 'Admin ' : ''}Notification
          </Text>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FEC9F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD9E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFB74D',
    backgroundColor: '#FEF7FF',
  },
  readNotification: {
    opacity: 0.7,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationEmoji: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unreadText: {
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  addNotificationButton: {
    backgroundColor: '#FFB74D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addNotificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
