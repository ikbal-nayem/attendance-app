import { useNotificationHistoryInit, useNotificationHistoryList } from '@/api/notification.api';
import AppHeader from '@/components/Header';
import NotificationCard from '@/components/NotificationCard';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseResponseDate } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { CalendarDays, MoveHorizontal } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const { user } = useAuth();
  const { notificationHistoryData } = useNotificationHistoryInit(user?.companyID!);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { notificationHistoryList, isLoading, error } = useNotificationHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID!,
    user?.employeeCode!,
    startDate,
    endDate
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (notificationHistoryData) {
      setStartDate(parseResponseDate(notificationHistoryData.fromDate));
      setEndDate(parseResponseDate(notificationHistoryData.toDate));
    }
  }, [notificationHistoryData?.fromDate, notificationHistoryData?.toDate]);

  const handleNotificationPress = (item: INotification) => {
    router.push({ pathname: '/notifications/[id]', params: { id: item?.referenceNo } });
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (showDatePicker === 'start' ? startDate : endDate);
    setShowDatePicker(null);
    if (event.type === 'set' && currentDate) {
      if (showDatePicker === 'start') {
        setStartDate(currentDate);
        if (endDate && currentDate > endDate) {
          setEndDate(currentDate);
        }
      } else if (showDatePicker === 'end') {
        setEndDate(currentDate);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Notification History"
        withBackButton={true}
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
        <MoveHorizontal color={Colors.light.text} />
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
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={(showDatePicker === 'start' ? startDate : endDate) || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={showDatePicker === 'end' && startDate ? startDate : undefined}
        />
      )}

      {isLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ flex: 1 }} size="large" />
      ) : notificationHistoryList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            {error ?? 'No notifications found for the selected period.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificationHistoryList}
          renderItem={({ item }: { item: INotification }) => (
            <NotificationCard item={item} onPress={handleNotificationPress} />
          )}
          keyExtractor={(item) => item.referenceNo}
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
    paddingTop: Layout.spacing.l,
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
});
