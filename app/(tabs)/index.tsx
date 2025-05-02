import Popover from '@/components/Popover';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ArrowRightCircle,
  Bell,
  ChevronsLeft,
  Clock,
  Edit,
  Layers,
  ListChecks,
  ListTodo,
  LogOut,
  Map,
  MapPin,
  QrCode,
  ScanSearch,
  SendHorizontal as SendHorizonal,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const popoverContent = (handleLogout: () => void) => (
  <TouchableOpacity onPress={handleLogout}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogOut size={20} color={Colors.light.text} />
      <Text>Logout</Text>
    </View>
  </TouchableOpacity>
);

const header = (user: IUser, handleLogout: () => void) => (
  <View style={styles.header}>
    <View style={styles.userInfo}>
      <Popover content={popoverContent(handleLogout)}>
        <Image
          source={{
            uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
          }}
          style={styles.avatar}
        />
      </Popover>
      <View>
        <Text style={styles.userId}>{user.employeeCode}</Text>
        <Text style={styles.userName}>{user.userName}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.iconButton}>
      <Bell size={26} color={Colors.light.text} />
    </TouchableOpacity>
  </View>
);

const userCard = (user: IUser) => (
  <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.profileCard}>
    <View style={styles.profileCardContent}>
      <View style={styles.profileDetails}>
        <Text style={styles.userRole}>{user.designation}</Text>
        <Text style={styles.userDepartment}>{user.department}</Text>
        <Text style={styles.detailText}>{user.companyName}</Text>
        {/* joiningDate does not exist on IUser */}
        {/* <Text style={styles.detailText}>
                Joining Date: {user.joiningDate || '12-2-2020'}
              </Text> */}
        {/* tenure relies on joiningDate */}
        {/* <Text style={styles.detailText}>{tenure}</Text> */}
      </View>

      <View style={styles.profileActions}>
        <TouchableOpacity style={styles.updateButton}>
          <Edit size={16} color={Colors.light.primary} />
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>
        <View style={styles.qrSection}>
          <Text style={styles.virtualCardText}>Virtual Card</Text>
          <View style={styles.qrCodeContainer}>
            <QrCode size={60} color={Colors.light.text} />
            {/* Replace with actual QR code component if needed */}
            {/* <Image source={{ uri: 'QR_CODE_URI' }} style={styles.qrCodeImage} /> */}
          </View>
        </View>
      </View>
    </View>
  </LinearGradient>
);

const menu1 = [
  {
    name: 'Attendance',
    icon: <Clock size={30} color="#00ACC1" />,
    onPress: () => {
      router.push('/(tabs)/attendance');
    },
  },
  {
    name: 'Activity',
    icon: <ListTodo size={24} color={Colors.light.accent} />,
    onPress: () => {
      router.push('/(tabs)/activity');
    },
  },
  {
    name: 'notification',
    icon: <SendHorizonal size={24} color={Colors.light.secondary} />,
    onPress: () => {
      router.push('/notifications/send');
    },
  },
  {
    name: 'Enquiry',
    icon: <ScanSearch size={24} color={Colors.light.info} />,
    onPress: () => {
      router.setParams({ screen: 'enquiry' });
    },
  },
];

const menu2 = [
  {
    name: 'Daily Activity',
    icon: <Layers size={24} color="#8E44AD" />,
    onPress: () => router.push('/enquiry/activities'),
  },
  {
    name: 'Clock In/Out history',
    icon: <ListChecks size={24} color="#2980B9" />,
    onPress: () => router.push('/enquiry/attendance-history'),
  },
  {
    name: 'Geolocation & Territory',
    icon: <MapPin size={24} color="#16A085" />,
    onPress: () => router.push('/enquiry/geolocation'),
  },
  {
    name: 'Live Tracking',
    icon: <Map size={24} color="#E74C3C" />,
    onPress: () => router.push('/enquiry/live-tracking'),
  },
];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const params = useLocalSearchParams<{ screen?: string }>();

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      return () => {};
    }, [])
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <AppStatusBar />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const lastPunchTime = '07:33 AM';
  const punchDate = 'Wed, 11th Mar. 2020';
  const todaysTime = '04:33hr';

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      {header(user, handleLogout)}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {userCard(user)}

          {/* Punch Info */}
          <View style={styles.punchInfoCard}>
            <View style={styles.punchHeader}>
              <ArrowRightCircle size={20} color="#4CAF50" />
              <Text style={styles.punchHeaderText}>Check In at</Text>
            </View>
            <Text style={styles.punchTime}>
              {lastPunchTime} |{' '}
              <Text style={styles.punchDate}>{punchDate}</Text>
            </Text>
            <Text style={styles.todaysTime}>Today's Time: {todaysTime}</Text>
          </View>

          <View style={styles.enquiryContainer}>
            {(params.screen === 'enquiry' ? menu2 : menu1).map(
              (item, index) => (
                <TouchableOpacity
                  style={styles.enquiryCard}
                  onPress={item.onPress}
                  key={item.name}
                >
                  <View style={styles.enquiryIconContainer}>{item.icon}</View>
                  <Text style={styles.enquiryTitle}>{item?.name}</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {params.screen === 'enquiry' && (
            <TouchableOpacity
              onPress={() => router.setParams({ screen: 'home' })}
            >
              <ChevronsLeft
                style={{ alignSelf: 'center' }}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background, // Or a slightly off-white like #F8F9FA
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Layout.spacing.m, // Consistent padding
    paddingBottom: Layout.spacing.xl * 2, // Extra padding at bottom for scroll
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m, // Use main padding
    paddingTop: Layout.spacing.s, // Adjust as needed
    paddingBottom: Layout.spacing.m,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Layout.spacing.m,
    borderWidth: 1,
    borderColor: Colors.light.tint + '50', // Subtle border
  },
  userId: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.subtext,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
  },
  iconButton: {
    padding: Layout.spacing.s,
  },
  profileCard: {
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.l,
    padding: Layout.spacing.m,
    ...Layout.shadow.medium, // Add shadow for depth
  },
  profileCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileDetails: {
    flex: 1, // Take available space
    marginRight: Layout.spacing.m,
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.subtext,
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary, // Use primary color
    marginBottom: Layout.spacing.s,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.text,
    marginBottom: 3,
  },
  profileActions: {
    alignItems: 'flex-end', // Align items to the right
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Layout.borderRadius.large, // More rounded
    marginBottom: Layout.spacing.m,
    ...Layout.shadow.light,
  },
  updateButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary,
    marginLeft: 5,
  },
  qrSection: {
    alignItems: 'center',
  },
  virtualCardText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
    ...Layout.shadow.light,
  },
  // qrCodeImage: { // If using an actual image
  //   width: 60,
  //   height: 60,
  // },
  punchInfoCard: {
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
    ...Layout.shadow.light,
  },
  punchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  punchHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.subtext,
    marginLeft: Layout.spacing.xs,
  },
  punchTime: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    marginBottom: 3,
  },
  punchDate: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.light.subtext,
  },
  todaysTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.subtext,
  },
  enquiryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enquiryCard: {
    width: '48%', // Two cards per row
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.large, // Consistent radius
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    ...Layout.shadow.light, // Consistent shadow
    alignItems: 'center', // Center content
  },
  enquiryIconContainer: {
    // Container for icon
    marginBottom: Layout.spacing.m,
  },
  enquiryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
