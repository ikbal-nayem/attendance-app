import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Bell, LogOut, CreditCard as Edit, Layers, SendHorizontal as SendHorizonal, ListChecks, MapPin, Map, Clock, ListTodo } from 'lucide-react-native';
import { router, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/Card';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [clockAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(clockAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(clockAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, []);
  
  const scale = clockAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <Link href="/notifications" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color={Colors.light.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <LogOut size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user.photo || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
              style={styles.profileImage}
            />
            
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{user.name}</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Edit size={16} color={Colors.light.primary} />
                  <Text style={styles.editButtonText}>Update Profile</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.profileRole}>{user.role}</Text>
              <Text style={styles.profileDepartment}>{user.department}</Text>
              
              <View style={styles.profileDetail}>
                <Text style={styles.profileDetailLabel}>Status:</Text>
                <Text style={styles.profileDetailValue}>{user.status}</Text>
              </View>
              
              <View style={styles.profileDetail}>
                <Text style={styles.profileDetailLabel}>Joining Date:</Text>
                <Text style={styles.profileDetailValue}>{user.joiningDate}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.virtualCardSection}>
            <View style={styles.virtualCardHeader}>
              <Text style={styles.virtualCardHeaderText}>Virtual Card</Text>
            </View>
            
            <View style={styles.qrCodeContainer}>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/1200px-QR_Code_Example.svg.png' }}
                style={styles.qrCode}
              />
            </View>
            
            <View style={styles.staffIdContainer}>
              <Text style={styles.staffIdLabel}>Staff ID</Text>
              <Text style={styles.staffId}>{user.staffId}</Text>
            </View>
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsContainer}>
          <Link href="/attendance" asChild>
            <TouchableOpacity style={styles.quickActionButton}>
              <Animated.View style={[styles.quickActionIcon, { transform: [{ scale }] }]}>
                <Clock size={24} color={Colors.light.primary} />
              </Animated.View>
              <Text style={styles.quickActionText}>Attendance</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/activity" asChild>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <ListTodo size={24} color={Colors.light.accent} />
              </View>
              <Text style={styles.quickActionText}>Activity</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/notifications/send" asChild>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <SendHorizonal size={24} color={Colors.light.secondary} />
              </View>
              <Text style={styles.quickActionText}>Send Notification</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <Text style={styles.sectionTitle}>Enquiry</Text>
        
        <View style={styles.enquiryContainer}>
          <Link href="/enquiry/activities" asChild>
            <TouchableOpacity style={styles.enquiryCard}>
              <View style={styles.enquiryIcon}>
                <Layers size={24} color="#8E44AD" />
              </View>
              <Text style={styles.enquiryTitle}>Daily Activities</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/enquiry/attendance-history" asChild>
            <TouchableOpacity style={styles.enquiryCard}>
              <View style={styles.enquiryIcon}>
                <ListChecks size={24} color="#2980B9" />
              </View>
              <Text style={styles.enquiryTitle}>Clock-in/Clock-out History</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/enquiry/geolocation" asChild>
            <TouchableOpacity style={styles.enquiryCard}>
              <View style={styles.enquiryIcon}>
                <MapPin size={24} color="#16A085" />
              </View>
              <Text style={styles.enquiryTitle}>Geolocation & Territory History</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/enquiry/live-tracking" asChild>
            <TouchableOpacity style={styles.enquiryCard}>
              <View style={styles.enquiryIcon}>
                <Map size={24} color="#E74C3C" />
              </View>
              <Text style={styles.enquiryTitle}>Live Tracking</Text>
            </TouchableOpacity>
          </Link>
        </View>
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
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
  },
  headerLeft: {},
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: Colors.light.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: Layout.spacing.s,
    marginLeft: Layout.spacing.s,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: 'white',
  },
  scrollContent: {
    padding: Layout.spacing.l,
  },
  profileCard: {
    marginBottom: Layout.spacing.l,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.m,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Layout.spacing.m,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.primary}15`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Layout.borderRadius.small,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.primary,
    marginLeft: 4,
  },
  profileRole: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  profileDepartment: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: Layout.spacing.s,
  },
  profileDetail: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  profileDetailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.subtext,
    width: 100,
  },
  profileDetailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
  },
  virtualCardSection: {
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    alignItems: 'center',
  },
  virtualCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
  },
  virtualCardHeaderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.small,
    padding: Layout.spacing.s,
    marginBottom: Layout.spacing.m,
  },
  qrCode: {
    width: 150,
    height: 150,
  },
  staffIdContainer: {
    alignItems: 'center',
  },
  staffIdLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    marginBottom: 2,
  },
  staffId: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
  },
  quickActionButton: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
    ...Layout.shadow.medium,
  },
  quickActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  enquiryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enquiryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    ...Layout.shadow.light,
  },
  enquiryIcon: {
    marginBottom: Layout.spacing.s,
  },
  enquiryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
});