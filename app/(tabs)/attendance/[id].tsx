import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function AttendanceDetailScreen() {
  const params = useLocalSearchParams();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{params.entryDate}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Check In:</Text>
        <Text style={styles.value}>{params.entryTime}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Check Out:</Text>
        <Text style={styles.value}>{params.exitTime || 'N/A'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{params.location}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Note:</Text>
        <Text style={styles.value}>{params.entryNote || 'N/A'}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{params.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.l,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.l,
    color: Colors.light.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.m,
    paddingBottom: Layout.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.subtext,
  },
  value: {
    fontSize: 16,
    color: Colors.light.text,
  },
});