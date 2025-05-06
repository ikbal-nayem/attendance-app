import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNotifications } from '@/context/NotificationContext';
import { router } from 'expo-router';
import { History } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import AppHeader from '@/components/Header';
import NotificationCard from '@/components/NotificationCard';
import AppStatusBar from '@/components/StatusBar';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function NotificationsScreen() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Filter for recent notifications (e.g., unread or last 15)
  const recentNotifications = useMemo(() => {
    // Show unread first, then recent read ones, limit to a certain number e.g. 15
    const unread = notifications.filter((n) => !n.read);
    const read = notifications.filter((n) => n.read);
    const sorted = [...unread, ...read]
      .slice(0, 15)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted;
  }, [notifications]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [recentNotifications]);

  const handleNotificationPress = (id: string) => {
    markAsRead(id);
    router.push({ pathname: '/notifications/[id]', params: { id } });
  };

  const navigateToHistory = () => {
    router.push('/notifications/history');
  };

  const getNotificationBackgroundColor = (type?: string) => {
    switch (type) {
      case 'success':
        return `${Colors.light.success}20`; // Lighter shade
      case 'warning':
        return `${Colors.light.warning}20`;
      case 'error':
        return `${Colors.light.error}20`;
      default:
        return `${Colors.light.primary}15`;
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <NotificationCard
      item={item}
      onPress={handleNotificationPress}
      showBadge={!item.read}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="New Notifications"
        withBackButton={true}
        bg="primary"
        rightContent={
          <TouchableOpacity onPress={navigateToHistory}>
            <History color={Colors.light.background} />
          </TouchableOpacity>
        }
      />

      {recentNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No recent notifications</Text>
          <TouchableOpacity style={styles.historyTextButton} onPress={navigateToHistory}>
            <Text style={styles.historyText}>View Full History</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recentNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footerButtonsContainer}>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={[styles.footerButton, styles.markAllReadButton]}
            onPress={markAllAsRead}
          >
            <Text style={[styles.footerButtonText, styles.markAllReadText]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity
            style={[styles.footerButton, styles.clearButton]}
            onPress={clearAll}
          >
            <Text style={[styles.footerButtonText, styles.clearButtonText]}>
              Clear All Recent
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: Layout.spacing.m,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
    marginLeft: Layout.spacing.m,
  },
  footerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  footerButton: {
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.medium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  footerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
  markAllReadButton: {
    backgroundColor: `${Colors.light.primary}20`,
  },
  markAllReadText: {
    color: Colors.light.primary,
  },
  clearButton: {
    backgroundColor: `${Colors.light.error}20`,
  },
  clearButtonText: {
    color: Colors.light.error,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Layout.spacing.s,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: Colors.light.background,
  },
  timeIcon: {
    marginRight: Layout.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  emptyMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
  },
  historyTextButton: {
    marginTop: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: `${Colors.light.primary}20`,
    borderRadius: Layout.borderRadius.medium,
  },
  historyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
});
