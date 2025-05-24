import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { parseDate } from '@/utils/date-time';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedRenderView from './AnimatedRenderView';

const formatNotificationDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = parseDate(dateString) || new Date();
  const now = new Date();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  const timeString = date.toLocaleTimeString('en-US', timeOptions);

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return `Today, ${timeString}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
    };
    const datePartString = date.toLocaleDateString('en-US', dateOptions);
    return `${datePartString} | ${timeString}`;
  }
};

interface NotificationCardProps {
  item: INotification;
  onPress: (item: INotification) => void;
  isUnread?: boolean;
  index?: number;
}

export default function NotificationCard({
  item,
  onPress,
  isUnread,
  index,
}: NotificationCardProps) {
  isUnread = isUnread ? isUnread : item?.messageStatus === 'Unread';
  return (
    <AnimatedRenderView
      index={index}
      style={[styles.notificationItem, isUnread ? styles.unreadNotification : styles.readNotification]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.notificationTouchable}
        onPress={() => onPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.topRow}>
            <Text style={styles.fromText} numberOfLines={1}>
              {item?.messageFrom}
            </Text>
            <Text style={styles.dateTimeText}>
              {formatNotificationDate(item?.messageDate || item?.referenceDate)}
            </Text>
          </View>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item?.messageTitle}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {item?.messageDetails}
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedRenderView>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.m,
    marginHorizontal: Layout.spacing.m,
    backgroundColor: Colors.light.card,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    backgroundColor: `${Colors.light.warning}10`,
  },
  readNotification: {
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  notificationTouchable: {
    padding: Layout.spacing.m,
  },
  notificationContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.s,
  },
  fromText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.light.primaryDark,
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  dateTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'right',
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
    lineHeight: 14 * 1.4,
  },
});
