import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { CalendarDays, Filter } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
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

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type?: string;
}

export const formatNotificationDateTime = (date: Date): string => {
  const now = new Date();
  const notificationDate = new Date(date);

  const isToday =
    notificationDate.getDate() === now.getDate() &&
    notificationDate.getMonth() === now.getMonth() &&
    notificationDate.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    notificationDate.getDate() === yesterday.getDate() &&
    notificationDate.getMonth() === yesterday.getMonth() &&
    notificationDate.getFullYear() === yesterday.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  if (isToday) {
    return `Today ${notificationDate.toLocaleTimeString([], timeOptions)}`;
  } else if (isYesterday) {
    return `Yesterday ${notificationDate.toLocaleTimeString([], timeOptions)}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    return `${notificationDate.toLocaleDateString(
      [],
      dateOptions
    )} ${notificationDate.toLocaleTimeString([], timeOptions)}`;
  }
};

export default function AllNotificationsScreen() {
  const { notifications, markAsRead } = useNotifications();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const { user } = useAuth();

  const handleNotificationPress = (id: string) => {
    markAsRead(id);
    router.push({ pathname: '/notifications/[id]', params: { id } });
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (startDate) {
      // Set start date to beginning of day for inclusive filtering
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      filtered = filtered.filter((n) => new Date(n.date) >= startOfDay);
    }
    if (endDate) {
      // Set end date to end of day for inclusive filtering
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter((n) => new Date(n.date) <= endOfDay);
    }

    // Sort by date descending
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [notifications, startDate, endDate]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [filteredNotifications]);

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

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate =
      selectedDate || (showDatePicker === 'start' ? startDate : endDate);
    setShowDatePicker(null); // Hide picker
    if (event.type === 'set' && currentDate) {
      if (showDatePicker === 'start') {
        setStartDate(currentDate);
        if (endDate && currentDate > endDate) {
          setEndDate(undefined); // Reset end date if start is after end
        }
      } else if (showDatePicker === 'end') {
        setEndDate(currentDate);
      }
    }
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
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
          {formatNotificationDateTime(new Date(item.date))}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Notification History"
        withBackButton={true}
        bg="primary"
        rightContent={<View style={{ width: 24 }} />}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.dateButton}
          onPress={() => setShowDatePicker('start')}
        >
          <CalendarDays size={18} color={Colors.light.primary} />
          <Text style={styles.dateButtonText}>
            {startDate ? startDate.toLocaleDateString() : 'Start Date'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.dateButton}
          onPress={() => setShowDatePicker('end')}
        >
          <CalendarDays size={18} color={Colors.light.primary} />
          <Text style={styles.dateButtonText}>
            {endDate ? endDate.toLocaleDateString() : 'End Date'}
          </Text>
        </TouchableOpacity>
        {(startDate || endDate) && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
            <Filter size={18} color={Colors.light.error} />
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={(showDatePicker === 'start' ? startDate : endDate) || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Optional: prevent selecting future dates
          minimumDate={showDatePicker === 'end' && startDate ? startDate : undefined}
        />
      )}

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            No notifications found for the selected period.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.light.border,
    backgroundColor: `${Colors.light.primary}10`,
    borderEndEndRadius: Layout.borderRadius.large,
    borderStartEndRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.m,
    marginTop: -Layout.borderRadius.large,
    paddingTop: Layout.spacing.s,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
  },
  dateButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: Layout.spacing.xs,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: `${Colors.light.error}20`,
    borderRadius: Layout.borderRadius.medium,
  },
  clearFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.error,
    marginLeft: Layout.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  emptyMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Layout.spacing.l,
    paddingBottom: Layout.spacing.l,
  },
  notificationItem: {
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.light.card, // Default background for items
  },
  unreadNotification: {
    borderLeftWidth: 4,
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
    marginLeft: Layout.spacing.m,
  },
});
