import React, { useEffect, useRef } from 'react'; // Import useEffect, useRef
import { Tabs } from 'expo-router';
import { Home, Clock, ListTodo, Search } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Animated, View, StyleSheet } from 'react-native'; // Import Animated, View, StyleSheet
import { AttendanceProvider } from '@/context/AttendanceContext';
import { ActivityProvider } from '@/context/ActivityContext';

// Animated Icon Component
const AnimatedIcon = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.2 : 1)).current; // Initial scale based on focus

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1, // Scale up if focused, down if not
      friction: 5, // Adjust animation feel
      useNativeDriver: true,
    }).start();
  }, [focused]); // Re-run animation when focus changes

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
            tabBarLabelStyle: { // Bring back labels
              fontFamily: 'Inter-Medium',
              fontSize: 12,
              marginBottom: 5, // Add some space below label
            },
            tabBarShowLabel: true, // Show labels
            tabBarStyle: {
              // Standard tab bar style
              borderTopWidth: 1,
              borderTopColor: Colors.light.border,
              height: 65, // Adjust height if needed
              paddingTop: 5,
              backgroundColor: 'white', // Ensure background is set
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home', // Keep title for accessibility/header fallback
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