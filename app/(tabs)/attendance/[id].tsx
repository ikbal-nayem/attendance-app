import { useAttendanceDetails } from '@/api/attendance.api';
import Card from '@/components/Card';
import { ErrorPreview } from '@/components/ErrorPreview';
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { parseDate } from '@/utils/date-time';
import { isNull } from '@/utils/validation';
import { useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  Briefcase,
  ClockArrowDown,
  ClockArrowUp,
  FilePenLine,
  MapPin,
} from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AttendanceDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { attendanceDetails, isLoading, error } = useAttendanceDetails(
    user?.companyID!,
    user?.userID!,
    user?.sessionID!,
    user?.employeeCode!,
    params?.id
  );

  console.log(attendanceDetails);
  

  let statusText = '';
  let statusColor = Colors.light.warning;
  let StatusIcon = AlertTriangle;

  if (attendanceDetails?.attendanceFlag === 'I') {
    statusText =
      'In ' +
      parseDate(attendanceDetails?.entryTime!)?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    statusColor = Colors.light.success;
    StatusIcon = ClockArrowUp;
  } else if (attendanceDetails?.attendanceFlag === 'O') {
    statusText =
      'Out ' +
      parseDate(attendanceDetails?.entryTime!)?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    statusColor = Colors.light.error;
    StatusIcon = ClockArrowDown;
  }

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    hiddenBorder = false,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string | number | null;
    hiddenBorder?: boolean;
  }) => (
    <View style={[styles.detailItemContainer, hiddenBorder && { borderBottomWidth: 0 }]}>
      <Icon size={20} color={Colors.light.primary} style={styles.detailIcon} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <ErrorPreview
        error={error}
        header={
          <AppHeader
            title="Attendance Details"
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
      <AppHeader
        title="Attendance Details"
        bg="primary"
        withBackButton
        rightContent={<View style={{ width: 24 }} />}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        <Card variant="outlined" isLoading={isLoading}>
          <View style={styles.cardHeader}>
            <Briefcase size={36} color={Colors.light.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.entryType}>{attendanceDetails?.entryType || 'N/A'}</Text>
              {attendanceDetails?.entryTime && (
                <Text style={styles.entryDateText}>
                  {parseDate(attendanceDetails?.entryTime)?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <StatusIcon size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>

          <DetailItem
            icon={MapPin}
            label="Location"
            value={attendanceDetails?.entryLocation}
            hiddenBorder={isNull(attendanceDetails?.attendanceNote)}
          />

          {attendanceDetails?.attendanceNote && (
            <DetailItem
              icon={FilePenLine}
              label="Note"
              value={attendanceDetails?.attendanceNote}
              hiddenBorder
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: Layout.spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTextContainer: {
    marginLeft: Layout.spacing.m,
    flex: 1,
  },
  entryType: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.primary,
    marginBottom: Layout.spacing.xs / 2,
  },
  entryDateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.subtext,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.s,
    borderRadius: Layout.borderRadius.large,
    marginLeft: Layout.spacing.s,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: Layout.spacing.xs / 2,
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
});
