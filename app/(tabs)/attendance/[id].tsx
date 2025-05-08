import { IAttendanceHistory } from '@/api/attendance.api'; // Assuming params match this
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Hash,
  MapPin,
  Tag,
  User,
  XCircle,
} from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AttendanceDetailScreen() {
  const params =
    useLocalSearchParams<
      Partial<
        IAttendanceHistory & {
          entryDate: string;
          entryTime: string;
          exitTime: string;
          status: string;
          location: string;
          entryNote: string;
        }
      >
    >(); // Use Partial for safety, as not all fields from IAttendanceHistory might be passed or some old fields might still be there.

  let statusText = 'Pending';
  let statusColor = Colors.light.warning;
  let StatusIcon = AlertTriangle;

  // Interpret attendanceFlag from params
  if (params.attendanceFlag === 'P') {
    statusText = 'Present';
    statusColor = Colors.light.success;
    StatusIcon = CheckCircle;
  } else if (params.attendanceFlag === 'A') {
    statusText = 'Absent';
    statusColor = Colors.light.error;
    StatusIcon = XCircle;
  }
  // For older params structure if still being passed (fallback)
  else if (params.status) {
    if (params.status === 'Present') {
      statusText = 'Present';
      statusColor = Colors.light.success;
      StatusIcon = CheckCircle;
    } else if (params.status === 'Absent') {
      statusText = 'Absent';
      statusColor = Colors.light.error;
      StatusIcon = XCircle;
    } else {
      statusText = params.status; // Use the status directly if it's something else like 'Late'
    }
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
      <AppHeader title="Attendance Details" bg="primary" withBackButton />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Briefcase size={36} color={Colors.light.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.entryType}>{params.entryType || 'N/A'}</Text>
              {params.entryDate && (
                <Text style={styles.entryDateText}>Date: {params.entryDate}</Text>
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
            value={params.entryLocation || params.location}
          />
          <DetailItem icon={Hash} label="Entry No." value={params.entryNo} />

          {params.entryTime && (
            <DetailItem icon={Tag} label="Check In Time" value={params.entryTime} />
          )}
          {params.exitTime && (
            <DetailItem icon={Tag} label="Check Out Time" value={params.exitTime} />
          )}
          {params.entryNote && <DetailItem icon={Tag} label="Note" value={params.entryNote} />}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
