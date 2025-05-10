import {
  IActivityHistory,
  useActivityHistoryInit,
  useActivityHistoryList,
} from '@/api/activity.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Drawer from '@/components/Drawer'; // Import the new Drawer component
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseRequestDate } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  Activity as ActivityIcon,
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  Clock,
  Filter,
  FilterIcon,
  MapPin,
  MoveHorizontal,
  User,
  X,
  XCircle,
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

interface FilterFormInputs {
  activityType: string;
  client: string;
  territory: string;
}

const FilterComponent = ({ control, onFilterSubmit, clearFilters, onClose, activityData }: any) => (
  <View style={styles.drawerContentContainer}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedRenderView
        direction="right"
        duration={300}
        delay={100}
        style={styles.filterDrawerHeader}
      >
        <Text style={styles.drawerTitle}>Filter</Text>
        <X size={20} color={Colors.light.text} onPress={onClose} />
      </AnimatedRenderView>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Activity Type</Text>
        <Controller
          control={control}
          name="activityType"
          render={({ field: { onChange, value } }) => (
            <Select
              options={activityData?.activityTypeList || []}
              keyProp="code"
              valueProp="name"
              value={value}
              onChange={(val: string) => onChange(val)}
              placeholder="Select Activity Type"
              size="small"
              containerStyle={styles.filterSelectContainer}
            />
          )}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Client</Text>
        <Controller
          control={control}
          name="client"
          render={({ field: { onChange, value } }) => (
            <Select
              options={activityData?.clientList || []}
              keyProp="code"
              valueProp="name"
              value={value}
              onChange={(val: string) => onChange(val)}
              placeholder="Select Client"
              size="small"
              containerStyle={styles.filterSelectContainer}
            />
          )}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Territory</Text>
        <Controller
          control={control}
          name="territory"
          render={({ field: { onChange, value } }) => (
            <Select
              options={activityData?.territoryList || []}
              keyProp="code"
              valueProp="name"
              value={value}
              onChange={(val: string) => onChange(val)}
              placeholder="Select Territory"
              size="small"
              containerStyle={styles.filterSelectContainer}
            />
          )}
        />
      </View>

      <View style={styles.filterButtonGroup}>
        <Button size="small" title="Clear Filters" onPress={clearFilters} variant="outline" />
        <Button
          size="small"
          title="Apply Filters"
          onPress={onFilterSubmit}
          icon={<FilterIcon color={Colors.light.background} size={14} />}
          iconPosition="right"
        />
      </View>
      <Button
        title="Close Drawer"
        onPress={onClose}
        variant="ghost"
        textStyle={{ color: Colors.light.warning }}
        style={styles.closeButton}
      />
    </ScrollView>
  </View>
);

export default function ActivityHistoryScreen() {
  const { user } = useAuth();
  const { activityData } = useActivityHistoryInit(user?.companyID!);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<string | undefined>();
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [selectedTerritory, setSelectedTerritory] = useState<string | undefined>();

  const { control, handleSubmit, reset } = useForm<FilterFormInputs>({
    defaultValues: { activityType: '', client: '', territory: '' },
  });

  const { activityHistoryList, isLoading, error } = useActivityHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID,
    user?.employeeCode,
    startDate,
    endDate,
    selectedActivityType,
    selectedClient,
    selectedTerritory
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (activityData?.fromDate && activityData?.toDate) {
      setStartDate(parseRequestDate(activityData.fromDate));
      setEndDate(parseRequestDate(activityData.toDate));
    }
  }, [activityData]);

  const handleItemPress = (item: IActivityHistory) => {
    router.push({
      pathname: '/(tabs)/activity/[id]',
      params: { id: item?.entryNo!, ...item },
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

  const onFilterSubmit = (data: FilterFormInputs) => {
    setSelectedActivityType(data.activityType || undefined);
    setSelectedClient(data.client || undefined);
    setSelectedTerritory(data.territory || undefined);
    setIsFilterDrawerVisible(false);
  };

  const clearFilters = () => {
    reset({ activityType: '', client: '', territory: '' });
    setSelectedActivityType(undefined);
    setSelectedClient(undefined);
    setSelectedTerritory(undefined);
    setIsFilterDrawerVisible(false);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: IActivityHistory; index: number }) => {
      let statusText = 'Pending'; // Default status
      let statusColor = Colors.light.warning;
      let StatusIconComponent = AlertTriangle;

      // Use attendanceFlag for status, assuming 'C' for Completed, 'A' for Absent/Incomplete
      // Adjust these flags based on actual API behavior for activities if different from attendance
      if (item.attendanceFlag === 'C') {
        // Assuming 'C' means completed for activity context too
        statusText = 'Completed';
        statusColor = Colors.light.success;
        StatusIconComponent = CheckCircle;
      } else if (item.attendanceFlag === 'A' || item.attendanceFlag === 'I') {
        // Assuming 'A' or 'I' means Incomplete
        statusText = 'Incomplete';
        statusColor = Colors.light.error;
        StatusIconComponent = XCircle;
      }
      // If there are other flags or no flag, it remains 'Pending'

      return (
        <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
          <AnimatedRenderView index={index}>
            <Card variant="outlined" style={styles.itemContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <ActivityIcon size={18} color={Colors.light.primary} />
                  <Text style={styles.entryTypeText} numberOfLines={1}>
                    {item.entryType || 'Activity'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <StatusIconComponent size={14} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>

              {item.employeeName && (
                <View style={styles.detailRow}>
                  <User size={16} color={Colors.light.subtext} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.employeeName} ({item.userID})
                  </Text>
                </View>
              )}

              {item.entryTime && (
                <View style={styles.detailRow}>
                  <Clock size={16} color={Colors.light.subtext} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {new Date(item.entryTime).toLocaleString()} {/* Basic time formatting */}
                  </Text>
                </View>
              )}

              {/* item.description is not in IActivityHistory, so it's removed */}

              {item.entryLocation && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.light.subtext} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.entryLocation}
                  </Text>
                </View>
              )}
            </Card>
          </AnimatedRenderView>
        </TouchableOpacity>
      );
    },
    [] // Add dependencies if any are used from outside, e.g., handleItemPress
  );

  if (error) {
    return <ErrorPreview error={error} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Activity History"
        withBackButton={true}
        bg="primary"
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
          keyExtractor={(item, idx) => (item?.entryNo || 'activity') + idx} // Use entryNo
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Layout.spacing.l }}
        />
      )}

      <Drawer isOpen={isFilterDrawerVisible} onClose={() => setIsFilterDrawerVisible(false)}>
        <FilterComponent
          activityData={activityData}
          onFilterSubmit={handleSubmit(onFilterSubmit)}
          onClose={() => setIsFilterDrawerVisible(false)}
          clearFilters={clearFilters}
          control={control}
        />
      </Drawer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    borderEndEndRadius: Layout.borderRadius.large,
    borderStartEndRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.m,
    marginTop: -Layout.borderRadius.large,
    paddingTop: Layout.spacing.l,
  },
  filterButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterSelectContainer: { marginBottom: 5 },
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
    gap: Layout.spacing.s,
    flex: 1,
    marginRight: Layout.spacing.s,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.s,
    gap: Layout.spacing.s,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  drawerContentContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  drawerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: Layout.spacing.l,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs,
  },
  closeButton: {
    marginTop: Layout.spacing.s,
    marginBottom: Layout.spacing.m,
  },
});
