import { IAttendanceHistory } from '@/api/attendance.api';
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { parseDate } from '@/utils/date-time';
import { useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  Briefcase,
  ClockArrowDown,
  ClockArrowUp,
  MapPin,
  Tag,
} from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AttendanceDetailScreen() {
  const params = useLocalSearchParams<Partial<IAttendanceHistory>>();

  let statusText = '';
  let statusColor = Colors.light.warning;
  let StatusIcon = AlertTriangle;

  if (params.attendanceFlag === 'I') {
    statusText =
      'In ' +
      parseDate(params?.entryTime!)?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    statusColor = Colors.light.success;
    StatusIcon = ClockArrowUp;
  } else if (params.attendanceFlag === 'O') {
    statusText =
      'Out ' +
      parseDate(params?.entryTime!)?.toLocaleTimeString('en-US', {
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
  }: {
    icon: React.ElementType;
    label: string;
    value?: string | number | null;
  }) => (
    <View style={styles.detailItemContainer}>
      <Icon size={20} color={Colors.light.primary} style={styles.detailIcon} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

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
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Briefcase size={36} color={Colors.light.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.entryType}>{params.entryType || 'N/A'}</Text>
              {params.entryTime && (
                <Text style={styles.entryDateText}>
                  {parseDate(params?.entryTime)?.toLocaleDateString('en-US', {
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

          <DetailItem icon={MapPin} label="Location" value={params.entryLocation} />

          {params.attendanceNote && (
            <DetailItem icon={Tag} label="Note" value={params.attendanceNote} />
          )}
        </View>
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
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Layout.borderRadius.medium,
    elevation: 3,
  },
  headerSection: {
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
    alignItems: 'flex-start', // Align items to start for multi-line values
    paddingVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border + '50', // Lighter border
  },
  detailIcon: {
    marginRight: Layout.spacing.m,
    marginTop: Layout.spacing.xs / 2, // Align icon with first line of text
  },
  detailTextContainer: {
    flex: 1, // Allow text to wrap
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
