import { ITerritotyHistory, useTerritoryHistoryList, useTerritoryInit } from '@/api/territory.api';
import AnimatedRenderView from '@/components/AnimatedRenderView';
import Card from '@/components/Card';
import Drawer from '@/components/Drawer';
import { ErrorPreview } from '@/components/ErrorPreview';
import { FilterDrawerFooter, FilterDrawerHeader } from '@/components/filter-drawer';
import AppHeader from '@/components/Header';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseResponseDate, parseResponseTime } from '@/utils/date-time';
import { commonStyles } from '@/utils/styles';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays, Clock9, Filter, MapPin, MoveHorizontal, User } from 'lucide-react-native';
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
  client: string;
  territory: string;
}

const FilterComponent = ({
  control,
  onFilterSubmit,
  clearFilters,
  onClose,
  territoryData,
}: any) => (
  <View style={styles.drawerContentContainer}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <FilterDrawerHeader onClose={onClose}>Territory Filter</FilterDrawerHeader>

      <Controller
        control={control}
        name="client"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Supervisor/Manager"
            options={territoryData?.clientList || []}
            keyProp="code"
            valueProp="name"
            value={value}
            onChange={(val: string) => onChange(val)}
            placeholder="Select Supervisor/Manager"
            size="small"
          />
        )}
      />

      <Controller
        control={control}
        name="territory"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Territory"
            options={territoryData?.territoryList || []}
            keyProp="code"
            valueProp="name"
            value={value}
            onChange={(val: string) => onChange(val)}
            placeholder="Select Territory"
            size="small"
          />
        )}
      />

      <FilterDrawerFooter clearFilters={clearFilters} onFilterSubmit={onFilterSubmit} />
    </ScrollView>
  </View>
);

export default function ActivityHistoryScreen() {
  const { user } = useAuth();
  const { territoryData, isLoading: isInitLoading } = useTerritoryInit(user?.companyID!);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [selectedTerritory, setSelectedTerritory] = useState<string | undefined>();

  const { control, handleSubmit, reset } = useForm<FilterFormInputs>({
    defaultValues: { client: '', territory: '' },
  });

  const { territoryHistoryList, isLoading, error } = useTerritoryHistoryList(
    user?.userID!,
    user?.sessionID!,
    user?.companyID,
    user?.employeeCode,
    startDate,
    endDate,
    selectedClient,
    selectedTerritory
  );
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (territoryData?.fromDate && territoryData?.toDate) {
      setStartDate(parseResponseDate(territoryData.fromDate));
      setEndDate(parseResponseDate(territoryData.toDate));
    }
  }, [territoryData]);

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
    setSelectedClient(data.client || undefined);
    setSelectedTerritory(data.territory || undefined);
    setIsFilterDrawerVisible(false);
  };

  const clearFilters = () => {
    reset({ client: '', territory: '' });
    setSelectedClient(undefined);
    setSelectedTerritory(undefined);
    setIsFilterDrawerVisible(false);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: ITerritotyHistory; index: number }) => {
      return (
        <AnimatedRenderView key={index} index={index}>
          <Card variant="outlined" style={styles.itemContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.container}>
                <Text style={styles.entryTypeText} numberOfLines={1}>
                  {item?.territory}
                </Text>
                {(item.inTime || item.outTime) && (
                  <Text style={styles.territoryTimeText} numberOfLines={1}>
                    {parseResponseTime(item.inTime)} - {parseResponseTime(item.outTime)}
                  </Text>
                )}
              </View>
              <View>
                <View style={commonStyles.flexRowAlignCenter}>
                  <CalendarDays size={13} color={Colors.light.subtext} />
                  <Text style={styles.territoryDateText}>
                    {parseResponseDate(item?.accessDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={[commonStyles.flexRowAlignCenter, { justifyContent: 'flex-end' }]}>
                  <Clock9 size={12} color={Colors.light.subtext} />
                  <Text style={styles.timeDuration}>{item?.timeDuration}</Text>
                </View>
              </View>
            </View>

            {/* Employee */}
            <View style={[commonStyles.flexRowAlignCenter, styles.detailRow]}>
              <User size={16} color={Colors.light.secondary} />
              <Text style={styles.detailValue}>
                {item?.employeeName} ({item?.employeeCode})
              </Text>
            </View>

            {/* Location */}
            {item.location && (
              <View style={[commonStyles.flexRowAlignCenter, styles.detailRow]}>
                <MapPin size={16} color={Colors.light.warning} />
                <Text style={styles.detailValue}>{item?.location}</Text>
              </View>
            )}
          </Card>
        </AnimatedRenderView>
      );
    },
    [territoryData]
  );

  if (error) {
    return (
      <ErrorPreview
        header={
          <AppHeader
            title="Territory History"
            rightContent={
              <TouchableOpacity
                onPress={() => setIsFilterDrawerVisible(true)}
                style={styles.filterIconContainer}
              >
                <Filter size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            }
          />
        }
        error={error}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Territory History"
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
      ) : territoryHistoryList?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>
            No activity records found for the selected period.
          </Text>
        </View>
      ) : (
        <FlatList
          data={territoryHistoryList}
          renderItem={renderItem}
          keyExtractor={(item, idx) => idx.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Layout.spacing.m }}
        />
      )}

      <Drawer isOpen={isFilterDrawerVisible} onClose={() => setIsFilterDrawerVisible(false)}>
        <FilterComponent
          territoryData={territoryData}
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
  entryTypeText: {
    fontWeight: '600',
    fontSize: 17,
    color: Colors.light.primary,
    flexShrink: 1,
  },
  territoryTimeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.subtext,
  },
  territoryDateText: {
    fontWeight: '500',
    fontSize: 15,
    color: Colors.light.subtext,
  },
  timeDuration: {
    fontSize: 13,
    color: Colors.light.subtext,
  },
  detailRow: {
    marginTop: Layout.spacing.s,
  },
  drawerContentContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
});
