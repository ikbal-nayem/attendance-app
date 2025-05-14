import { useActivityDetails, useActivityHistoryInit } from '@/api/activity.api';
import Card from '@/components/Card';
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseResponseDate, parseResponseTime } from '@/utils/date-time';
import { useLocalSearchParams } from 'expo-router';
import {
  Activity as ActivityIcon,
  Building,
  CalendarDays,
  FilePenLine,
  Info,
  MapPin,
  UserCircle,
} from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActivityDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { activityData, isLoading: initLoading } = useActivityHistoryInit(user?.companyID!);
  const { activityDetails, isLoading, error } = useActivityDetails(
    user?.companyID!,
    user?.userID!,
    user?.sessionID!,
    user?.employeeCode!,
    params?.id
  );

  // const attachmentFile01 = params?.attachmentFile01
  //   ? (JSON.parse(params?.attachmentFile01 || '[]') as Array<any>)
  //   : [];

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    isPressable = false,
    onPress,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string | number | null;
    isPressable?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isPressable}
      activeOpacity={isPressable ? 0.7 : 1}
    >
      <View style={styles.detailItemContainer}>
        <Icon size={20} color={Colors.light.primary} style={styles.detailIcon} />
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={[styles.detailValue, isPressable && styles.pressableValue]}>
            {value || 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const activityTypeName = activityData?.activityTypeList?.find(
    (at) => at.code === activityDetails?.activityType
  )?.name;
  const clientName = activityData?.clientList?.find(
    (c) => c.code === activityDetails?.client
  )?.name;
  const territoryName = activityData?.territoryList?.find(
    (t) => t.code === activityDetails?.territory
  )?.name;

  if (error) {
    return (
      <ErrorPreview
        error={error}
        header={
          <AppHeader
            title="Activity Details"
            bg="primary"
            withBackButton
            rightContent={<View style={{ width: 24 }} />}
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppStatusBar />
      <AppHeader title="Activity Details" bg="primary" withBackButton />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        <Card variant="outlined" isLoading={initLoading || isLoading}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <ActivityIcon size={20} color={Colors.light.primary} />
              <View>
                <Text style={styles.entryTypeText} numberOfLines={1}>
                  {activityTypeName}
                </Text>
                {(activityDetails?.activityStartTime || activityDetails?.activityStopTime) && (
                  <Text style={styles.activityTimeText} numberOfLines={1}>
                    {parseResponseTime(activityDetails?.activityStartTime)} -{' '}
                    {parseResponseTime(activityDetails?.activityStopTime)}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.activityDateText}>
              <CalendarDays size={14} color={Colors.light.subtext} />{' '}
              {parseResponseDate(activityDetails?.activityDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <DetailItem
            icon={Building}
            label="Client"
            value={clientName || activityDetails?.client}
          />
          <DetailItem
            icon={UserCircle}
            label="Contact Person"
            value={activityDetails?.contactPerson}
          />
          <DetailItem
            icon={MapPin}
            label="Territory"
            value={territoryName || activityDetails?.territory}
          />
          <DetailItem
            icon={Info}
            label="Activity Details"
            value={activityDetails?.activityDetails}
          />
          <DetailItem
            icon={FilePenLine}
            label="Activity Note"
            value={activityDetails?.activityNote}
          />

          {/* {attachmentFile01 && attachmentFile01?.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <View style={styles.detailItemContainerNoBorder}>
                <Paperclip size={20} color={Colors.light.primary} style={styles.detailIcon} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Attachments</Text>
                </View>
              </View>
              {attachmentFile01?.map((file: any, index: number) => (
                <DetailItem
                  key={index}
                  icon={FileText}
                  label={`File ${index + 1}`}
                  value={
                    typeof file === 'string'
                      ? file.split('/').pop()
                      : file.name || `Attachment ${index + 1}`
                  }
                  isPressable={typeof file === 'string'}
                  onPress={() => {
                    if (typeof file === 'string') {
                      Linking.canOpenURL(file).then((supported) => {
                        if (supported) {
                          Linking.openURL(file);
                        } else {
                          console.log("Don't know how to open URI: " + file);
                        }
                      });
                    }
                  }}
                />
              ))}
            </View>
          )} */}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContentContainer: {
    padding: Layout.spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    fontSize: 18,
    color: Colors.light.primary,
    flexShrink: 1,
  },
  activityTimeText: {
    fontSize: 15,
    color: Colors.light.subtext,
  },
  activityDateText: {
    fontWeight: '500',
    fontSize: 15,
    color: Colors.light.subtext,
  },
  detailItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Layout.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border + '50',
  },
  detailIcon: {
    marginRight: Layout.spacing.m,
    marginTop: Layout.spacing.xs / 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.xs / 2,
  },
  detailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.light.text,
  },
  pressableValue: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  attachmentsContainer: {
    marginTop: Layout.spacing.m,
  },
  detailItemContainerNoBorder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Layout.spacing.m,
  },
});
