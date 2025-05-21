import {
  getUserLocationList,
  IEmployeeList,
  IEmployeeLocation,
  useEmployeeList,
} from '@/api/location.api';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Fullscreen, Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT_PERCENTAGE = 0.6;
const MARKER_IMAGE_SIZE = 20;

export default function LiveTrackingScreen() {
  const { user } = useAuth();
  const { employeeList, isLoading: employeeLoading } = useEmployeeList(user?.companyID!);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IEmployeeList | null>();
  const [userLocations, setUserLocations] = useState<IEmployeeLocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!selectedUser?.code) return;
    setLoadingLocation(true);
    getUserLocationList(
      user?.userID!,
      user?.sessionID!,
      user?.companyID!,
      selectedUser?.code!,
      employeeList?.processDate
    )
      .then((res) => {
        if (res?.success) {
          setUserLocations(res?.data);
          const coordinates = res?.data?.map((location: IEmployeeLocation) => ({
            latitude: +location?.latitude,
            longitude: +location?.longitude,
          }));
          mapRef.current?.fitToElements({
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          });
        } else showToast({ message: res?.message, type: 'error' });
      })
      .finally(() => setLoadingLocation(false));
  }, [selectedUser?.code]);

  const showAllCordinates = (locations?: IEmployeeLocation[]) => {
    if (mapRef.current) {
      const coordinates = (locations || userLocations)?.map((location: IEmployeeLocation) => ({
        latitude: +location?.latitude,
        longitude: +location?.longitude,
      }));
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  };

  const handleUserSelect = (selected: IEmployeeList) => {
    if (!selected?.code) return;

    setLoadingLocation(true);
    setSelectedUser(selected);
    getUserLocationList(
      user?.userID!,
      user?.sessionID!,
      user?.companyID!,
      selected?.code!,
      employeeList?.processDate
    )
      .then((res) => {
        if (res?.success) {
          setUserLocations(res?.data);
          const coordinates = res?.data?.map((location: IEmployeeLocation) => ({
            latitude: +location?.latitude,
            longitude: +location?.longitude,
          }));
          mapRef.current?.fitToCoordinates(coordinates, {
            // edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
          });
        } else showToast({ message: res?.message, type: 'error' });
      })
      .finally(() => setLoadingLocation(false));
  };

  const filteredUserLocations = employeeList?.employeeList?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Live Tracking"
        bg="primary"
        rightContent={
          userLocations?.length && (
            <TouchableOpacity onPress={() => showAllCordinates()} activeOpacity={0.7}>
              <Fullscreen size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          )
        }
      />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          // onMapReady={showAllUsers}
          initialRegion={{
            latitude: 25.117450242458936,
            longitude: 55.29359965284598,
            latitudeDelta: 0.4,
            longitudeDelta: 0.4,
          }}
          zoomControlEnabled
          provider={PROVIDER_GOOGLE}
        >
          {userLocations?.map((user) => (
            <Marker
              key={user.serialNo}
              coordinate={{ latitude: +user?.latitude, longitude: +user?.longitude }}
              title={selectedUser?.name}
              // onPress={() => handleUserSelect(user)}
              // pinColor={getPinColor(user.userId)}
              // zIndex={selectedUser?.code === user.userId ? 10 : 1}
            />
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
            employeeLoading ? <ActivityIndicator size="small" color={Colors.light.subtext} /> : null
          }
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {employeeLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading users...</Text>
              </View>
            ) : null}
            {filteredUserLocations.length > 0 ? (
              filteredUserLocations.map((user, idx) => (
                <TouchableOpacity
                  key={user?.code}
                  activeOpacity={0.7}
                  style={[
                    styles.userItem,
                    selectedUser?.code === user?.code && styles.selectedUserItem,
                  ]}
                  onPress={() => handleUserSelect(user)}
                >
                  <View
                    style={[
                      styles.userColorIndicator,
                      { backgroundColor: getPinColor((idx + 1).toString()) },
                    ]}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {/* <Text style={styles.userTimestamp}>
                      Last seen: {formatTimestamp(user.location.timestamp)}
                    </Text> */}
                  </View>
                  {loadingLocation && selectedUser?.code === user?.code && (
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                  )}
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
