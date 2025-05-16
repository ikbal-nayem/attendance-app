import Popover from '@/components/Popover';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { getDuration, parseDate } from '@/utils/date-time';
import { generateUserImage } from '@/utils/generator';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Activity,
  ArrowRightCircle,
  Bell,
  BellDot,
  BellPlus,
  CalendarClock,
  ChevronsLeft,
  Clock,
  Edit,
  FileSearch,
  ListTodo,
  LogOut,
  Map,
  MapPin,
  QrCode,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

const header = (user: IUser, handleLogout: () => void, unreadCount: number) => (
  <LinearGradient colors={['#0096c7', '#00b4d8']} style={styles.header}>
    <View style={styles.userInfo}>
      <Popover content={popoverContent(handleLogout)}>
        <Image
          source={{
            uri: generateUserImage(user.userID, user.sessionID, user.companyID),
          }}
          style={styles.avatar}
        />
      </Popover>
      <View>
        <Text style={styles.userName}>{user.userName}</Text>
      </View>
    </View>
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.iconButton}
      onPress={() => router.push('/notifications')}
    >
      <View style={[styles.notificationCount, { display: unreadCount > 0 ? 'flex' : 'none' }]}>
        <Text style={{ color: 'white', fontSize: 11 }}>{unreadCount}</Text>
      </View>
      <Bell size={26} color={Colors.light.card} />
    </TouchableOpacity>
  </LinearGradient>
);

const userCard = (user: IUser) => (
  <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.profileCard}>
    <View style={styles.profileCardContent}>
      <View style={styles.profileDetails}>
        <Text style={styles.userRole}>{user.designation}</Text>
        <Text style={styles.userDepartment}>{user.department}</Text>
        <Text style={styles.userId}>Code: {user.staffID}</Text>
        <Text style={styles.detailText}>{user.companyName}</Text>
      </View>

      <View style={styles.profileActions}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => router.push('/profile/update')}
        >
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

const CheckinDuration = ({ checkInTime }: { checkInTime?: Date }) => {
  if (!checkInTime) return '';

  const [duration, setDuration] = useState<IObject>(getDuration(checkInTime, new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(getDuration(checkInTime, new Date()));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [checkInTime]);

  return `${duration?.hours?.toString().padStart(2, '0')}:${duration?.minutes
    ?.toString()
    .padStart(2, '0')} hrs`;
};

const menu1 = [
  {
    name: 'Attendance',
    icon: <Clock size={30} color={Colors.light.secondary} />,
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
    name: 'Notification',
    icon: <BellPlus size={24} color={Colors.light.warning} />,
    onPress: () => {
      router.push('/notifications/send');
    },
  },
  {
    name: 'Enquiry',
    icon: <FileSearch size={24} color={Colors.light.primaryDark} />,
    onPress: () => {
      router.setParams({ screen: 'enquiry' });
    },
  },
];

const menu2 = [
  {
    name: 'Daily Activity',
    icon: <Activity size={24} color={Colors.light.accent} />,
    onPress: () => router.push('/(tabs)/activity/history'),
  },
  {
    name: 'Clock In/Out history',
    icon: <CalendarClock size={30} color={Colors.light.secondary} />,
    onPress: () => router.push('/(tabs)/attendance/history'),
  },
  {
    name: 'Notification History',
    icon: <BellDot size={24} color={Colors.light.warning} />,
    onPress: () => router.push('/notifications/history'),
  },
  {
    name: 'Territory History',
    icon: <MapPin size={24} color={Colors.light.tint} />,
    onPress: () => router.push('/enquiry/territory'),
  },
  {
    name: 'Live Tracking',
    icon: <Map size={24} color={Colors.light.error} />,
    onPress: () => router.push('/enquiry/live-tracking'),
  },
];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
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

  const checkIn = parseDate(user?.todayCheckIn);
  const lastCheckinTime = checkIn?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const lastCheckinDate = checkIn?.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      {header(user, handleLogout, unreadCount)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {userCard(user)}

          {/* Punch Info */}
          <View style={styles.punchInfoCard}>
            <View style={styles.punchHeader}>
              <ArrowRightCircle size={20} color={Colors.light.success} />
              <Text style={styles.punchHeaderText}>Check In at</Text>
            </View>
            <Text style={styles.punchTime}>
              {lastCheckinTime} | <Text style={styles.punchDate}>{lastCheckinDate}</Text>
            </Text>
            <Text style={styles.todaysTime}>
              Duration: <CheckinDuration checkInTime={checkIn} />
            </Text>
          </View>

          <View style={styles.enquiryContainer}>
            {(params.screen === 'enquiry' ? menu2 : menu1).map((item, index) => (
              <TouchableOpacity style={styles.enquiryCard} onPress={item.onPress} key={item.name}>
                <View style={styles.enquiryIconContainer}>{item.icon}</View>
                <Text style={styles.enquiryTitle}>{item?.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {params.screen === 'enquiry' && (
            <TouchableOpacity onPress={() => router.setParams({ screen: 'home' })}>
              <ChevronsLeft style={{ alignSelf: 'center' }} color={Colors.light.primary} />
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
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingTop: Layout.spacing.s,
    paddingBottom: Layout.spacing.s,
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: Layout.borderRadius.xl,
    borderBottomRightRadius: Layout.borderRadius.xl,
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
    borderColor: Colors.light.tint + '50',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.dark.text,
  },
  notificationCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  userId: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.subtext,
  },
  iconButton: {
    padding: Layout.spacing.s,
  },
  profileCard: {
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.l,
    padding: Layout.spacing.m,
    ...Layout.shadow.medium,
  },
  profileCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileDetails: {
    flex: 1,
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
    color: Colors.light.primary,
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
    marginBottom: Layout.spacing.m,
  },
  enquiryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
