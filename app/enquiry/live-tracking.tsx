import {
  IUserLocationData,
  useFetchUserLiveLocations,
  useLiveLocationData,
} from '@/api/location.api';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { Fullscreen, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT_PERCENTAGE = 0.6;
const MARKER_IMAGE_SIZE = 30;

export default function LiveTrackingScreen() {
  const { userLocations: allUserLocations, isLoading, error } = useFetchUserLiveLocations();
  const { user } = useAuth();
  const { locationData } = useLiveLocationData(user?.companyID!);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef<MapView>(null);

  console.log(locationData)

  useEffect(() => {
    if (!isLoading) {
      showAllUsers();
    }
  }, [isLoading]);

  const showAllUsers = useCallback(() => {
    if (mapRef.current) {
      const coordinates = allUserLocations?.map((user) => user.location);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
    setSelectedUserId(null);
  }, [allUserLocations]);

  const handleUserSelect = (user: IUserLocationData) => {
    setSelectedUserId(user.userId);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <AppStatusBar />
        <AppHeader title="Live Tracking" bg="primary" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Live Tracking"
        bg="primary"
        rightContent={
          <TouchableOpacity onPress={showAllUsers} activeOpacity={0.7}>
            <Fullscreen size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        }
      />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          onMapReady={showAllUsers}
          zoomControlEnabled
          provider={PROVIDER_GOOGLE}
        >
          {allUserLocations?.map((user) => (
            <Marker
              key={user.userId}
              coordinate={user.location}
              onPress={() => handleUserSelect(user)}
              pinColor={getPinColor(user.userId)}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.userListContainer}
      >
        <Input
          placeholder="Search User..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          leftIcon={<Search size={20} color={Colors.light.subtext} />}
          inputContainerStyle={styles.searchInputInnerContainer}
          inputStyle={styles.searchInput}
          size="medium"
          rightIcon={
            isLoading ? <ActivityIndicator size="small" color={Colors.light.subtext} /> : null
          }
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredUserLocations.length > 0 ? (
              filteredUserLocations.map((user) => (
                <TouchableOpacity
                  key={user.userId}
                  activeOpacity={0.7}
                  style={[
                    styles.userItem,
                    selectedUserId === user.userId && styles.selectedUserItem,
                  ]}
                  onPress={() => handleUserSelect(user)}
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
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noUsersText}>No users found.</Text>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  container: { flex: 1 },
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
    width: MARKER_IMAGE_SIZE + 8,
    height: MARKER_IMAGE_SIZE + 8,
    borderRadius: (MARKER_IMAGE_SIZE + 8) / 2,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    overflow: 'hidden',
  },
  selectedMarkerContainer: {
    borderColor: Colors.light.tint,
    borderWidth: 3,
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
    color: Colors.dark.text,
    fontSize: MARKER_IMAGE_SIZE / 2,
    fontFamily: 'Inter-Bold',
  },
  calloutContainer: {
    backgroundColor: Colors.light.card,
    padding: Layout.spacing.s,
    borderRadius: Layout.borderRadius.medium,
    borderColor: Colors.light.border,
    borderWidth: 1,
    width: width * 0.5,
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
