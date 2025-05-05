import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNotifications } from '@/context/NotificationContext';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NotificationsScreen() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleNotificationPress = (id: string) => {
    markAsRead(id);
    router.push(`/notifications/${id}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) {
      return 'Just now';
    } else if (diffInMins < 60) {
      return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupNotificationsByDate = () => {
    const groups: { [key: string]: typeof notifications } = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.date);
      let key = 'Today';

      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const isYesterday =
        date.getDate() === now.getDate() - 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        key = 'Today';
      } else if (isYesterday) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString();
      }

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(notification);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      data: items,
    }));
  };

  const getNotificationBackgroundColor = (type?: string) => {
    switch (type) {
      case 'success':
        return `${Colors.light.success}15`;
      case 'warning':
        return `${Colors.light.warning}15`;
      case 'error':
        return `${Colors.light.error}15`;
      default:
        return `${Colors.light.primary}15`;
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: getNotificationBackgroundColor(item.type) },
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>
          {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { date: string } }) => (
    <Text style={styles.sectionHeader}>{section.date}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notifications {notifications.length > 0 ? `(${notifications.length})` : ''}
        </Text>

        <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={groupNotificationsByDate()}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.sectionHeader}>{item.date}</Text>
              {item.data.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    {
                      backgroundColor: getNotificationBackgroundColor(notification.type),
                    },
                    !notification.read && styles.unreadNotification,
                  ]}
                  onPress={() => handleNotificationPress(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {!notification.read && <View style={styles.unreadIndicator} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllReadButton} onPress={markAllAsRead}>
          <Text style={styles.markAllReadText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  clearButton: {
    padding: Layout.spacing.xs,
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
  },
  listContent: {
    padding: Layout.spacing.l,
  },
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.s,
    marginTop: Layout.spacing.m,
  },
  notificationItem: {
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  notificationMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs,
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
    marginLeft: Layout.spacing.s,
  },
  markAllReadButton: {
    padding: Layout.spacing.m,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  markAllReadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
});
