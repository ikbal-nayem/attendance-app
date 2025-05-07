import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { parseDate } from '@/utils/date-time';
import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface NotificationCardProps {
  item: INotification;
  onPress: (item: INotification) => void;
  isUnread?: boolean;
}

export default function NotificationCard({ item, onPress, isUnread }: NotificationCardProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.notificationItem, isUnread && styles.unreadNotification]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.notificationTouchable}
        onPress={() => onPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {item?.messageTitle}
            </Text>
            <View style={styles.unreadBadge} />
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item?.messageDetails}
          </Text>
          <View style={styles.notificationFooter}>
            <Clock size={13} style={styles.timeIcon} />
            <Text style={styles.notificationTime}>
              {parseDate(item?.referenceDate).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
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
    backgroundColor: `${Colors.light.primary}15`,
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
    height: 8,
    width: 8,
    borderRadius: Layout.borderRadius.large,
  },
  timeIcon: {
    marginRight: Layout.spacing.xs,
    color: Colors.light.subtext,
  },
});
