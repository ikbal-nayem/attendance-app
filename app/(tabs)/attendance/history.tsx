import {
  IAttendanceHistory,
  useAttendanceHistoryInit,
  useAttendanceHistoryList,
} from '@/api/attendance.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Card from '@/components/Card';
import Drawer from '@/components/Drawer';
import { FilterDrawerFooter, FilterDrawerHeader } from '@/components/filter-drawer';
import AppHeader from '@/components/Header';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseDate, parseResponseDate } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  AlertTriangle,
  CalendarDays,
  ClockArrowDown,
  ClockArrowUp,
  FilePenLine,
  Filter,
  MapPin,
  MoveHorizontal,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AttendanceHistoryScreen() {
  const { user } = useAuth();
  const { attendanceHistoryData, isLoading: isInitLoading } = useAttendanceHistoryInit(
    user?.companyID!
  );
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedAttendanceType, setSelectedAttendanceType] = useState<string | undefined>();
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm<FilterFormInputs>({
    defaultValues: { attendanceType: '' },
  });

  const { attendanceHistoryList, isLoading, error } = useAttendanceHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID!,
    user?.employeeCode!,
    startDate,
    endDate,
    selectedAttendanceType
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (attendanceHistoryData) {
      setStartDate(parseResponseDate(attendanceHistoryData?.fromDate));
      setEndDate(parseResponseDate(attendanceHistoryData?.toDate));
    }
  }, [attendanceHistoryData?.fromDate, attendanceHistoryData?.toDate]);

  const handleItemPress = (item: IAttendanceHistory) => {
    router.push({
      pathname: '/(tabs)/attendance/[id]',
      params: { id: item?.entryNo },
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

  const onFilterSubmit = (data: FilterFormInputs) => {
    setSelectedAttendanceType(data.attendanceType || '');
    setIsFilterDrawerVisible(false);
  };

  const clearFilters = () => {
    reset({ attendanceType: '' });
    setSelectedAttendanceType('');
    setIsFilterDrawerVisible(false);
  };

  const renderItem = useCallback(({ item, index }: { item: IAttendanceHistory; index: number }) => {
    let statusText = '';
    let statusColor = Colors.light.warning;
    let StatusIcon = AlertTriangle;

    if (item.attendanceFlag === 'I') {
      statusText =
        'In ' +
        parseDate(item.entryTime)?.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      statusColor = Colors.light.success;
      StatusIcon = ClockArrowUp;
    } else if (item.attendanceFlag === 'O') {
      statusText =
        'Out ' +
        parseDate(item?.entryTime!)?.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      statusColor = Colors.light.error;
      StatusIcon = ClockArrowDown;
    }

    return (
      <AnimatedRenderView index={index}>
        <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
          <Card variant="outlined" style={styles.itemContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <CalendarDays size={15} color={Colors.light.primary} />
                <Text style={styles.entryTypeText}>
                  {parseDate(item.entryTime)?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.infoText} numberOfLines={1}>
                  ({item.entryType})
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}10` }]}>
                <StatusIcon size={14} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>

            {item.attendanceNote && (
              <View style={styles.detailRow}>
                <FilePenLine size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.attendanceNote}
                </Text>
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
          </Card>
        </TouchableOpacity>
      </AnimatedRenderView>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Attendance History"
        rightContent={
          <TouchableOpacity
            onPress={() => {
              setIsFilterDrawerVisible(true);
            }}
            style={styles.filterIconContainer}
          >
            <Filter size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        }
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

      {isLoading || isInitLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ flex: 1 }} size="large" />
      ) : attendanceHistoryList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            {error || 'No attendance records found for the selected period.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceHistoryList}
          renderItem={renderItem}
          keyExtractor={(item, idx) => item?.entryNo + idx.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Layout.spacing.m }}
        />
      )}
      <Drawer isOpen={isFilterDrawerVisible} onClose={() => setIsFilterDrawerVisible(false)}>
        <FilterComponent
          attendanceHistoryData={attendanceHistoryData}
          onFilterSubmit={handleSubmit(onFilterSubmit)}
          onClose={() => setIsFilterDrawerVisible(false)}
          clearFilters={clearFilters}
          control={control}
        />
      </Drawer>
    </SafeAreaView>
  );
}

interface FilterFormInputs {
  attendanceType: string;
}

const FilterComponent = ({
  control,
  onFilterSubmit,
  clearFilters,
  onClose,
  attendanceHistoryData,
}: any) => (
  <View style={styles.drawerContentContainer}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <FilterDrawerHeader onClose={onClose}>Attendance Filter</FilterDrawerHeader>

      <Controller
        control={control}
        name="attendanceType"
        render={({ field: { onChange, value } }) => (
          <Select
            options={attendanceHistoryData?.entryTypeList || []}
            label="Attendance Type"
            keyProp="code"
            valueProp="name"
            value={value}
            onChange={(val: string) => onChange(val)}
            placeholder="Select Attendance Type"
            size="small"
          />
        )}
      />

      <FilterDrawerFooter clearFilters={clearFilters} onFilterSubmit={onFilterSubmit} />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterIconContainer: {
    padding: Layout.spacing.s,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.light.border,
    backgroundColor: `${Colors.light.primary}10`,
    borderEndEndRadius: Layout.borderRadius.xl,
    borderStartEndRadius: Layout.borderRadius.xl,
    marginTop: -Layout.borderRadius.large,
    paddingTop: Layout.spacing.l,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    marginHorizontal: Layout.spacing.m,
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
    gap: Layout.spacing.xs,
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  entryTypeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
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
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.subtext,
    marginLeft: Layout.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.s,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.text,
    marginLeft: Layout.spacing.s,
    flex: 1,
  },
  drawerContentContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
});
