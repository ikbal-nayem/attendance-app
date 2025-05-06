import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Animated, { FadeIn } from 'react-native-reanimated';

interface NotificationCardProps {
  item: {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type?: string;
  };
  onPress: (id: string) => void;
  showBadge?: boolean;
}

export default function NotificationCard({ item, onPress, showBadge = true }: NotificationCardProps) {
  const getNotificationBackgroundColor = (type?: string) => {
    switch (type) {
      case 'success':
        return `${Colors.light.success}20`;
      case 'warning':
        return `${Colors.light.warning}20`;
      case 'error':
        return `${Colors.light.error}20`;
      default:
        return `${Colors.light.primary}15`;
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={[
        styles.notificationItem,
        { 
          backgroundColor: getNotificationBackgroundColor(item.type),
        },
        !item.read && styles.unreadNotification,
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.8}
        style={styles.notificationTouchable}
        onPress={() => onPress(item.id)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {showBadge && !item.read && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>New</Text>
              </View>
            )}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.notificationFooter}>
            <MaterialIcons 
              name="schedule" 
              size={14} 
              color={Colors.light.subtext} 
              style={styles.timeIcon}
            />
            <Text style={styles.notificationTime}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.m,
    marginHorizontal: Layout.spacing.m,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  notificationTouchable: {
    padding: Layout.spacing.m,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
  },
  notificationMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.s,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
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
});