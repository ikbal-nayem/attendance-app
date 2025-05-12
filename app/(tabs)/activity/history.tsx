import {
  IActivityHistory,
  useActivityHistoryInit,
  useActivityHistoryList,
} from '@/api/activity.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Drawer from '@/components/Drawer';
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseResponseDate, parseResponseTime } from '@/utils/date-time';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  Activity as ActivityIcon,
  CalendarDays,
  FilePenLine,
  Filter,
  FilterIcon,
  MapPin,
  MoveHorizontal,
  User,
  X,
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
  const { activityData, isLoading: isInitLoading } = useActivityHistoryInit(user?.companyID!);
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
      setStartDate(parseResponseDate(activityData.fromDate));
      setEndDate(parseResponseDate(activityData.toDate));
    }
  }, [activityData]);

  const handleItemPress = useCallback((item: IActivityHistory) => {
    router.push({
      pathname: '/(tabs)/activity/[id]',
      params: { id: item?.entryNo, ...item },
    });
  }, []);

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
      return (
        <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.8}>
          <AnimatedRenderView index={index}>
            <Card variant="outlined" style={styles.itemContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <ActivityIcon size={18} color={Colors.light.primary} />
                  <View>
                    <Text style={styles.entryTypeText} numberOfLines={1}>
                      {
                        activityData?.activityTypeList?.find((a) => a.code === item.activityType)
                          ?.name
                      }
                    </Text>
                    {(item.activityStartTime || item.activityStopTime) && (
                      <Text style={styles.activityTimeText} numberOfLines={1}>
                        {parseResponseTime(item.activityStartTime)} -{' '}
                        {parseResponseTime(item.activityStopTime)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.activityDateText}>
                  <CalendarDays size={14} color={Colors.light.subtext} />{' '}
                  {parseResponseDate(item.activityDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {/* Client */}
              {item?.client && (
                <View style={styles.detailRow}>
                  <User size={16} color={Colors.light.success} />
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {activityData?.clientList?.find((c) => c.code === item.client)?.name}
                  </Text>
                </View>
              )}

              {/* Territory */}
              {item.territory && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.light.warning} />
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {activityData?.territoryList?.find((t) => t.code === item.territory)?.name}
                  </Text>
                </View>
              )}

              {/* Activity Details */}
              {item.activityDetails && (
                <View style={styles.detailRow}>
                  <FilePenLine size={16} color={Colors.light.subtext} />
                  <Text
                    style={[styles.detailValue, { color: Colors.light.subtext }]}
                    numberOfLines={2}
                  >
                    {item.activityDetails}
                  </Text>
                </View>
              )}
            </Card>
          </AnimatedRenderView>
        </TouchableOpacity>
      );
    },
    [handleItemPress, activityData]
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
          maximumDate={new Date()}
          minimumDate={showDatePicker === 'end' && startDate ? startDate : undefined}
        />
      )}

      {isLoading || isInitLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ flex: 1 }} size="large" />
      ) : activityHistoryList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            No activity records found for the selected period.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activityHistoryList}
          renderItem={renderItem}
          keyExtractor={(item, idx) => item?.entryNo + idx.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Layout.spacing.m }}
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
    alignItems: 'flex-start',
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
    fontWeight: '600',
    fontSize: 17,
    color: Colors.light.primary,
    flexShrink: 1,
  },
  activityTimeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.subtext,
  },
  activityDateText: {
    fontWeight: '500',
    fontSize: 15,
    color: Colors.light.subtext,
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
  detailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
});
