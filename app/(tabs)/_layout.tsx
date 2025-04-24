import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Clock, ListTodo, Search } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { AttendanceProvider } from '@/context/AttendanceContext';
import { ActivityProvider } from '@/context/ActivityContext';

export default function TabLayout() {
  return (
    <AttendanceProvider>
      <ActivityProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.light.primary,
            tabBarInactiveTintColor: Colors.light.tabIconDefault,
            tabBarLabelStyle: {
              fontFamily: 'Inter-Medium',
              fontSize: 12,
            },
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: Colors.light.border,
              height: 60,
              // paddingBottom: 10,
              paddingTop: 5,
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="attendance"
            options={{
              title: 'Attendance',
              tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              title: 'Activity',
              tabBarIcon: ({ color, size }) => <ListTodo size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="enquiry"
            options={{
              title: 'Enquiry',
              tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
            }}
          />
        </Tabs>
      </ActivityProvider>
    </AttendanceProvider>
  );
}