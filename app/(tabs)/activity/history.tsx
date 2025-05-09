import { IActivityHistory, useActivityData } from '@/api/activity.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Card from '@/components/Card';
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseDate, parseRequestDate } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  Activity as ActivityIcon,
  AlertTriangle,
  CalendarDays,
  CheckCircle, // For completed status
  Edit3,
  MapPin,
  MoveHorizontal, // Using Activity icon
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

// Placeholder for actual activity history list fetching hook
const useActivityHistoryList = (
  userId: string,
  sessionId: string,
  companyId: string,
  // employeeCode: string, // May not be relevant for all activities
  startDate?: Date,
  endDate?: Date,
  selectedActivityType?: string
): {
  activityHistoryList: IActivityHistory[] | undefined;
  isLoading: boolean;
  error: string | null;
} => {
  const [list, setList] = useState<IActivityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock data - replace with actual API fetching logic
      const mockData: IActivityHistory[] = [
        {
          id: '1',
          activityNo: 'ACT001',
          title: 'Client Meeting',
          entryDate: '2023-10-26',
          entryTime: '2023-10-26T10:00:00Z',
          activityType: 'Meeting',
          status: 'Completed',
          activityFlag: 'C',
          location: 'Client Office',
          description: 'Discuss project proposal.',
        },
        {
          id: '2',
          activityNo: 'ACT002',
          title: 'Site Visit',
          entryDate: '2023-10-25',
          entryTime: '2023-10-25T14:30:00Z',
          activityType: 'Visit',
          status: 'Incomplete',
          activityFlag: 'I',
          location: 'Construction Site X',
          description: 'Check progress.',
        },
      ];
      // Filter mock data based on dates and type for demonstration
      let filteredData = mockData;
      if (startDate && endDate) {
        filteredData = mockData.filter((item) => {
          const itemDate = item.entryDate ? new Date(item.entryDate) : new Date();
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      if (selectedActivityType) {
        filteredData = filteredData.filter((item) => item.activityType === selectedActivityType);
      }

      setList(filteredData);
      setLoading(false);
      // setErr("Failed to load data"); // Uncomment to test error state
    }, 1000);
  }, [startDate, endDate, selectedActivityType]);

  return { activityHistoryList: list, isLoading: loading, error: err };
};

export default function ActivityHistoryScreen() {
  const { user } = useAuth();
  const { activityData: initialActivityData } = useActivityData(user?.companyID!);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedActivityType, setSelectedActivityType] = useState<string | undefined>(undefined);

  // Placeholder for activity types - fetch or define these as needed
  const activityTypes = [
    { label: 'All Types', value: undefined },
    { label: 'Meeting', value: 'Meeting' },
    { label: 'Visit', value: 'Visit' },
    { label: 'Task', value: 'Task' },
  ];

  const { activityHistoryList, isLoading, error } = useActivityHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID!,
    startDate,
    endDate,
    selectedActivityType
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    // Assuming initialActivityData might provide default date ranges
    // Adjust if the structure of initialActivityData is different
    if (
      initialActivityData &&
      (initialActivityData as any).fromDate &&
      (initialActivityData as any).toDate
    ) {
      setStartDate(parseRequestDate((initialActivityData as any).fromDate));
      setEndDate(parseRequestDate((initialActivityData as any).toDate));
    } else {
      // Default to a range if not provided, e.g., last 7 days
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      setStartDate(lastWeek);
      setEndDate(today);
    }
  }, [initialActivityData]);

  const handleItemPress = (item: IActivityHistory) => {
    router.push({
      pathname: '/(tabs)/activity/[id]',
      params: { id: item?.activityNo!, ...item },
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
        }
      } else if (showDatePicker === 'end') {
        setEndDate(currentDate);
      }
    }
  };

  const renderItem = useCallback(({ item, index }: { item: IActivityHistory; index: number }) => {
    let statusText = item.status || 'Pending';
    let statusColor = Colors.light.warning;
    let StatusIconComponent = AlertTriangle;

    if (item.activityFlag === 'C') {
      statusText = 'Completed';
      statusColor = Colors.light.success;
      StatusIconComponent = CheckCircle;
    } else if (item.activityFlag === 'I') {
      statusText = 'Incomplete';
      statusColor = Colors.light.error;
      StatusIconComponent = XCircle;
    } else if (item.status) {
      // Fallback to status string
      if (item.status.toLowerCase() === 'completed') {
        statusText = 'Completed';
        statusColor = Colors.light.success;
        StatusIconComponent = CheckCircle;
      } else if (
        item.status.toLowerCase() === 'incomplete' ||
        item.status.toLowerCase() === 'skipped'
      ) {
        statusText = 'Incomplete';
        statusColor = Colors.light.error;
        StatusIconComponent = XCircle;
      }
    }

    return (
      <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
        <AnimatedRenderView index={index}>
          <Card variant="outlined" style={styles.itemContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <ActivityIcon size={16} color={Colors.light.primary} />
                <Text style={styles.entryTypeText} numberOfLines={1}>
                  {item.title || item.activityType || 'Activity'}
                </Text>
                {/* {item.entryDate && (
                  <Text style={styles.infoText} numberOfLines={1}>
                    {parseDate(item.entryDate)?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                )} */}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <StatusIconComponent size={14} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </View>

            {item.description && (
              <View style={styles.detailRow}>
                <Edit3 size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            )}

            {item.location && (
              <View style={styles.detailRow}>
                <MapPin size={16} color={Colors.light.subtext} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}
          </Card>
        </AnimatedRenderView>
      </TouchableOpacity>
    );
  }, []);

  if (error) {
    return <ErrorPreview error={error} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Activity History" // Changed title
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
        <Select
          options={activityTypes} // Changed to activityTypes
          keyProp="value" // Assuming value is the key
          valueProp="label" // Assuming label is for display
          value={selectedActivityType}
          onChange={(itemValue: string) => setSelectedActivityType(itemValue || undefined)}
          placeholder="Type"
          containerStyle={styles.selectFilterContainer}
          selectStyle={styles.selectFilter}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={(showDatePicker === 'start' ? startDate : endDate) || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Can be adjusted based on requirements
          minimumDate={showDatePicker === 'end' && startDate ? startDate : undefined}
        />
      )}

      {isLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ flex: 1 }} size="large" />
      ) : activityHistoryList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            No activity records found for the selected period. {/* Changed message */}
          </Text>
        </View>
      ) : (
        <FlatList
          data={activityHistoryList}
          renderItem={renderItem}
          keyExtractor={(item, idx) => (item?.activityNo || item?.id || 'activity') + idx} // Changed key
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Layout.spacing.l }}
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
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    marginHorizontal: Layout.spacing.xs,
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
    gap: Layout.spacing.s, // Adjusted gap
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  entryTypeText: {
    // Reused style name, content is different
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
    // Reused style name
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.subtext,
    // marginLeft: Layout.spacing.xs, // Removed to use gap in headerLeft
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
  selectFilterContainer: {
    marginHorizontal: Layout.spacing.xs,
    marginBottom: 0,
  },
  selectFilter: {
    height: Layout.inputHeight - Layout.spacing.s,
    paddingVertical: 0,
    paddingHorizontal: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
  },
});
