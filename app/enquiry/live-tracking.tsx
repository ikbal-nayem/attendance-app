import { IUserLocationData, useFetchUserLiveLocations } from '@/api/location.api';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Search } from 'lucide-react-native'; // ChevronLeft will come from AppHeader
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView, // Renamed to avoid conflict
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
// import Card from '@/components/Card'; // Card component might not be needed for the user list container if we style it directly
import AppHeader from '@/components/Header'; // Import AppHeader
import Input from '@/components/Input';
import AppStatusBar from '@/components/StatusBar';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT_PERCENTAGE = 0.6; // 60% of screen height for map
const MARKER_IMAGE_SIZE = 30;

export default function LiveTrackingScreen() {
  const { userLocations: allUserLocations, isLoading, error } = useFetchUserLiveLocations();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [initialRegionSet, setInitialRegionSet] = useState(false); // To track if initial region/fit has been done
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (allUserLocations.length > 0 && !initialRegionSet && mapRef.current) {
      if (allUserLocations.length === 1) {
        const userLocation = allUserLocations[0].location;
        const region = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02, // Closer zoom for single user
          longitudeDelta: 0.02,
        };
        setMapRegion(region);
        mapRef.current.animateToRegion(region, 1000);
      } else {
        const coordinates = allUserLocations.map((u) => u.location);
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, // Increased padding
          animated: true,
        });
      }
      setInitialRegionSet(true);
    } else if (allUserLocations.length > 0 && !mapRegion && !initialRegionSet) {
      // Fallback if mapRef is not ready immediately, set a general region
      const firstUserLocation = allUserLocations[0].location;
      setMapRegion({
        latitude: firstUserLocation.latitude,
        longitude: firstUserLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [allUserLocations, initialRegionSet]);

  const handleUserSelect = (user: IUserLocationData) => {
    setSelectedUserId(user.userId);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          latitudeDelta: 0.01, // Zoom in closer
          longitudeDelta: 0.01,
        },
        1000 // Animation duration
      );
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredUserLocations = allUserLocations.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading Live Locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader title="Live Tracking" bg="primary" />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {allUserLocations.map((user) => (
            <Marker
              key={user.userId}
              coordinate={user.location}
              onPress={() => handleUserSelect(user)}
              pinColor={getPinColor(user.userId)} // Default color, selection handled by custom marker view
              zIndex={selectedUserId === user.userId ? 10 : 1}
            >
              <View
                style={[
                  styles.markerContainer,
                  selectedUserId === user.userId && styles.selectedMarkerContainer,
                ]}
              >
                {user.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={styles.markerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.markerFallback}>
                    <Text style={styles.markerFallbackText}>
                      {user.userName?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{user.userName}</Text>
                  <Text style={styles.calloutDescription}>
                    Last seen: {formatTimestamp(user.location.timestamp)}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.userListContainer}>
        <Input
          placeholder="Search User..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          leftIcon={<Search size={20} color={Colors.light.subtext} />}
          containerStyle={styles.searchInputContainer}
          inputContainerStyle={styles.searchInputInnerContainer}
          inputStyle={styles.searchInput}
          size="medium"
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredUserLocations.length > 0 ? (
            filteredUserLocations.map((user) => (
              <TouchableOpacity
                key={user.userId}
                style={[styles.userItem, selectedUserId === user.userId && styles.selectedUserItem]}
                onPress={() => handleUserSelect(user)}
              >
                <View
                  style={[styles.userColorIndicator, { backgroundColor: getPinColor(user.userId) }]}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.userName}</Text>
                  <Text style={styles.userTimestamp}>
                    Last seen: {formatTimestamp(user.location.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noUsersText}>No users found.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getPinColor = (userId: string) => {
  // Simple hash function to get a color based on userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '000000'.substring(0, 6 - color.length) + color;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  loadingText: {
    marginTop: Layout.spacing.m,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.text,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.error,
    textAlign: 'center',
  },
  mapContainer: {
    height: height * MAP_HEIGHT_PERCENTAGE,
    backgroundColor: Colors.light.border,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userListContainer: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    marginTop: -Layout.spacing.m,
    paddingTop: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
  },
  searchInputContainer: {
    marginBottom: Layout.spacing.m,
  },
  searchInputInnerContainer: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderWidth: 1,
  },
  searchInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: Layout.spacing.s,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.s,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedUserItem: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
    borderWidth: 1.5,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
  },
  userColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  noUsersText: {
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.subtext,
    marginTop: Layout.spacing.xl,
  },
  markerContainer: {
    width: MARKER_IMAGE_SIZE + 8, // Add padding for border
    height: MARKER_IMAGE_SIZE + 8,
    borderRadius: (MARKER_IMAGE_SIZE + 8) / 2,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary, // Default border color
    overflow: 'hidden',
  },
  selectedMarkerContainer: {
    borderColor: Colors.light.tint, // Highlight border color
    borderWidth: 3, // Thicker border for selected
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 10,
  },
  markerImage: {
    width: MARKER_IMAGE_SIZE,
    height: MARKER_IMAGE_SIZE,
    borderRadius: MARKER_IMAGE_SIZE / 2,
  },
  markerFallback: {
    width: MARKER_IMAGE_SIZE,
    height: MARKER_IMAGE_SIZE,
    borderRadius: MARKER_IMAGE_SIZE / 2,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerFallbackText: {
    color: Colors.dark.text, // Assuming primary background is light
    fontSize: MARKER_IMAGE_SIZE / 2,
    fontFamily: 'Inter-Bold',
  },
  calloutContainer: {
    backgroundColor: Colors.light.card,
    padding: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
    borderColor: Colors.light.border,
    borderWidth: 1,
    width: width * 0.5, // Adjust width as needed
  },
  calloutTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  calloutDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
});
