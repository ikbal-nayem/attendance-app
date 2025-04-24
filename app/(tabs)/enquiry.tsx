import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Layers, ListChecks, MapPin, Map } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/Card';

export default function EnquiryScreen() {
  const enquiryOptions = [
    {
      id: 'activities',
      title: 'Daily Activities',
      icon: <Layers size={24} color="#8E44AD" />,
      route: '/enquiry/activities',
    },
    {
      id: 'attendance',
      title: 'Clock-in/Clock-out History',
      icon: <ListChecks size={24} color="#2980B9" />,
      route: '/enquiry/attendance-history',
    },
    {
      id: 'geolocation',
      title: 'Geolocation & Territory History',
      icon: <MapPin size={24} color="#16A085" />,
      route: '/enquiry/geolocation',
    },
    {
      id: 'tracking',
      title: 'Live Tracking',
      icon: <Map size={24} color="#E74C3C" />,
      route: '/enquiry/live-tracking',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enquiry</Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Select an option to view</Text>
          
          <View style={styles.optionsContainer}>
            {enquiryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => router.push(option.route)}
              >
                <View style={styles.optionIconContainer}>
                  {option.icon}
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  scrollContent: {
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xxl,
  },
  card: {
    marginBottom: Layout.spacing.m,
  },
  cardTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Layout.spacing.l,
    textAlign: 'center',
  },
  optionsContainer: {
    rowGap: Layout.spacing.l,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    ...Layout.shadow.light,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.m,
  },
  optionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
});