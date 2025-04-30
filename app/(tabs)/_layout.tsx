import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Home, Clock, ListTodo, Search } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Animated, View, StyleSheet } from 'react-native';
import { AttendanceProvider } from '@/context/AttendanceContext';
import { ActivityProvider } from '@/context/ActivityContext';
import Header from '@/components/Header';

const AnimatedIcon = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

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
              marginBottom: 5,
            },
            tabBarShowLabel: true,
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: Colors.light.border,
              height: 65,
              paddingTop: 5,
              backgroundColor: 'white',
            },
            headerShown: false,
            // header: ({ options }) => <Header title={options.title || ''} withBackButton={false} />,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size, focused }) => (
                <AnimatedIcon focused={focused}>
                  <Home size={size * 1.1} color={color} />
                </AnimatedIcon>
              ),
            }}
          />
          <Tabs.Screen
            name="attendance"
            options={{
              title: 'Attendance',
              tabBarIcon: ({ color, size, focused }) => (
                <AnimatedIcon focused={focused}>
                  <Clock size={size * 1.1} color={color} />
                </AnimatedIcon>
              ),
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              title: 'Activity',
              tabBarIcon: ({ color, size, focused }) => (
                <AnimatedIcon focused={focused}>
                  <ListTodo size={size * 1.1} color={color} />
                </AnimatedIcon>
              ),
            }}
          />
          <Tabs.Screen
            name="enquiry"
            options={{
              title: 'Enquiry',
              tabBarIcon: ({ color, size, focused }) => (
                <AnimatedIcon focused={focused}>
                  <Search size={size * 1.1} color={color} />
                </AnimatedIcon>
              ),
            }}
          />
        </Tabs>
      </ActivityProvider>
    </AttendanceProvider>
  );
}