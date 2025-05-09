import {
  IAttendanceHistory,
  useAttendanceHistoryInit,
  useAttendanceHistoryList,
} from '@/api/attendance.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Card from '@/components/Card';
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseRequestDate } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  ClockArrowDown,
  ClockArrowUp,
  Edit3,
  MapPin,
  MoveHorizontal,
  XCircle,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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

export default function AttendanceHistoryScreen() {
  const { user } = useAuth();
  const { attendanceHistoryData } = useAttendanceHistoryInit(user?.companyID!);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { attendanceHistoryList, isLoading, error } = useAttendanceHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID!,
    user?.employeeCode!,
    startDate,
    endDate
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (attendanceHistoryData) {
      setStartDate(parseRequestDate(attendanceHistoryData.fromDate));
      setEndDate(parseRequestDate(attendanceHistoryData.toDate));
    }
  }, [attendanceHistoryData]);

  const handleItemPress = (item: IAttendanceHistory) => {
    router.push({
      pathname: '/(tabs)/attendance/[id]',
      params: { id: item?.entryNo, ...item },
    });
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (showDatePicker === 'start' ? startDate : endDate);
    setShowDatePicker(null);
    if (event.type === 'set' && currentDate) {
      if (showDatePicker === 'start') {
        setStartDate(currentDate);
        if (endDate && currentDate > endDate) {
          setEndDate(currentDate);
          attendanceHistoryData;
        }
      } else if (showDatePicker === 'end') {
        setEndDate(currentDate);
      }
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: IAttendanceHistory & { entryDate?: string }; index: number }) => {
      let statusText = 'Pending';
      let statusColor = Colors.light.warning;
      let StatusIcon = AlertTriangle;

      if (item.attendanceFlag === 'I') {
        statusText = 'Check In';
        statusColor = Colors.light.success;
        StatusIcon = ClockArrowUp;
      } else if (item.attendanceFlag === 'O') {
        statusText = 'Check Out';
        statusColor = Colors.light.error;
        StatusIcon = ClockArrowDown;
      }

      // const serialNo = index + 1;

      return (
        <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
          <AnimatedRenderView index={index}>
            <Card variant="outlined" style={styles.itemContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.entryTypeText} numberOfLines={1}>
                    {item.entryType}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <StatusIcon size={14} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>

              {/* Date and Entry No Row */}
              {item.entryDate && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <CalendarDays size={14} color={Colors.light.subtext} />
                    <Text style={styles.infoText}>{item.entryDate}</Text>
                  </View>
                </View>
              )}

              {item.entryLocation && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.light.subtext} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.entryLocation}
                  </Text>
                </View>
              )}

              {item.attendanceNote && (
                <View style={styles.detailRow}>
                  <Edit3 size={16} color={Colors.light.subtext} />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {item.attendanceNote}
                  </Text>
                </View>
              )}
            </Card>
          </AnimatedRenderView>
        </TouchableOpacity>
      );
    },
    []
  );

  if (error) {
    return <ErrorPreview error={error} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Attendance History"
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
      ) : attendanceHistoryList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            No attendance records found for the selected period.
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceHistoryList}
          renderItem={renderItem}
          keyExtractor={(item, idx) => item?.entryNo + idx}
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
  itemContainer: {
    padding: Layout.spacing.m,
    marginHorizontal: Layout.spacing.m,
    marginBottom: Layout.spacing.s,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  serialNoText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: Colors.light.subtext,
    marginRight: Layout.spacing.xs,
  },
  entryTypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.primary,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs / 1.5,
    paddingHorizontal: Layout.spacing.s,
    borderRadius: Layout.borderRadius.large,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: Layout.spacing.xs / 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Layout.spacing.s,
    marginBottom: Layout.spacing.xs,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.m,
    marginBottom: Layout.spacing.xs,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.subtext,
    marginLeft: Layout.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Layout.spacing.s,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.text,
    marginLeft: Layout.spacing.s,
    flex: 1,
  },
});
