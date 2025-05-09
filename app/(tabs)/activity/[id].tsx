import { IActivityHistory } from '@/api/activity.api'; // Assuming a similar interface for activity
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  Briefcase, // Using Briefcase, consider changing if a more specific icon for activity is available
  CheckCircle,
  Hash,
  MapPin,
  Tag,
  Activity as ActivityIcon, // Changed from User to ActivityIcon for relevance
  XCircle,
} from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ActivityDetailScreen() {
  const params =
    useLocalSearchParams<
      Partial<
        IActivityHistory & { // Changed from IAttendanceHistory
          entryDate: string;
          entryTime: string;
          // exitTime might not be relevant for all activities, but keeping for structural similarity
          exitTime?: string;
          status: string; // Generic status
          location?: string; // Optional location
          description?: string; // Changed from entryNote to description for broader use
          activityType?: string; // Changed from entryType
          activityNo?: string; // Changed from entryNo
          activityFlag?: string; // Changed from attendanceFlag
        }
      >
    >();

  let statusText = 'Pending';
  let statusColor = Colors.light.warning;
  let StatusIconComponent = AlertTriangle; // Renamed for clarity

  // Interpret activityFlag from params (similar to attendanceFlag)
  // This logic might need to be adjusted based on actual activity statuses
  if (params.activityFlag === 'C') { // Assuming 'C' for Completed
    statusText = 'Completed';
    statusColor = Colors.light.success;
    StatusIconComponent = CheckCircle;
  } else if (params.activityFlag === 'I') { // Assuming 'I' for Incomplete or Skipped
    statusText = 'Incomplete';
    statusColor = Colors.light.error;
    StatusIconComponent = XCircle;
  }
  // Fallback for a generic status string if activityFlag is not 'C' or 'I'
  else if (params.status) {
    if (params.status.toLowerCase() === 'completed') {
      statusText = 'Completed';
      statusColor = Colors.light.success;
      StatusIconComponent = CheckCircle;
    } else if (params.status.toLowerCase() === 'incomplete' || params.status.toLowerCase() === 'skipped') {
      statusText = 'Incomplete';
      statusColor = Colors.light.error;
      StatusIconComponent = XCircle;
    } else {
      statusText = params.status; // Use the status directly
      // Default to warning if status is unknown but present
      statusColor = Colors.light.warning;
      StatusIconComponent = AlertTriangle;
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
      <AppHeader title="Activity Details" bg="primary" withBackButton />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.card}>
          <View style={styles.headerSection}>
            {/* Using ActivityIcon or Briefcase as a placeholder */}
            <ActivityIcon size={36} color={Colors.light.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.entryType}>{params.activityType || params.title || 'N/A'}</Text>
              {params.entryDate && (
                <Text style={styles.entryDateText}>Date: {params.entryDate}</Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <StatusIconComponent size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>

          {params.location && <DetailItem
            icon={MapPin}
            label="Location"
            value={params.location}
          />}
          {params.activityNo && <DetailItem icon={Hash} label="Activity No." value={params.activityNo} />}
          {params.title && !params.activityType && <DetailItem icon={Briefcase} label="Title" value={params.title} />}


          {params.entryTime && (
            <DetailItem icon={Tag} label="Start Time" value={params.entryTime} />
          )}
          {params.exitTime && ( // Kept for structural similarity, might be end time for an activity
            <DetailItem icon={Tag} label="End Time" value={params.exitTime} />
          )}
          {params.description && <DetailItem icon={Tag} label="Description" value={params.description} />}
          {/* Add other relevant activity details here */}
          {params.remarks && <DetailItem icon={Tag} label="Remarks" value={params.remarks} />}


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
  entryType: { // Kept name for style consistency, represents activity type/title
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.primary,
    marginBottom: Layout.spacing.xs / 2,
  },
  entryDateText: { // Kept name for style consistency
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
    paddingVertical: Layout.spacing.m,
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