import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useLocation } from '@/context/LocationContext';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/Card';
// import Map from '@/components/Map';

const { width } = Dimensions.get('window');

export default function GeolocationScreen() {
  const { userLocations } = useLocation();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (userLocations.length > 0) {
      setRegion({
        latitude: userLocations[0].location.latitude,
        longitude: userLocations[0].location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setSelectedUsers(userLocations.map((user) => user.userId));
    }
  }, []);

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const filteredLocations = userLocations.filter((user) =>
    selectedUsers.includes(user.userId)
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const mapMarkers = filteredLocations.map((user) => ({
    id: user.userId,
    title: user.userName,
    location: user.location,
    color: getPinColor(user.userId),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Tracking</Text>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.mapCard}>
          <Text>
            Map Component Placeholder (Replace with actual Map component)
          </Text>
          {/* <Map
            markers={mapMarkers}
            initialRegion={region}
            style={styles.map}
          /> */}
        </Card>

        <Card variant="outlined" style={styles.usersCard}>
          <Text style={styles.usersTitle}>Select Users to Track</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {userLocations.map((user) => (
              <TouchableOpacity
                key={user.userId}
                style={[
                  styles.userItem,
                  selectedUsers.includes(user.userId) &&
                    styles.selectedUserItem,
                ]}
                onPress={() => toggleUserSelection(user.userId)}
              >
                <View
                  style={[
                    styles.userColorIndicator,
                    { backgroundColor: getPinColor(user.userId) },
                  ]}
                />

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.userName}</Text>
                  <Text style={styles.userTimestamp}>
                    Last seen: {formatTimestamp(user.location.timestamp)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.selectionIndicator,
                    selectedUsers.includes(user.userId) &&
                      styles.selectedIndicator,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const getPinColor = (userId: string) => {
  const colors = [
    '#E74C3C',
    '#3498DB',
    '#2ECC71',
    '#F39C12',
    '#9B59B6',
    '#1ABC9C',
  ];
  const index = parseInt(userId, 10) % colors.length;
  return colors[index];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.l,
  },
  mapCard: {
    marginBottom: Layout.spacing.m,
    padding: 0,
    overflow: 'hidden',
    height: '60%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  usersCard: {
    flex: 1,
  },
  usersTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  selectedUserItem: {
    backgroundColor: `${Colors.light.primary}10`,
  },
  userColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Layout.spacing.m,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2,
  },
  userTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedIndicator: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
});
