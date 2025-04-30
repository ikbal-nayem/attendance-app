import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { useLocation } from '@/context/LocationContext';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { Linking, Text, View } from 'react-native';

export default function PermissionRequest() {
  const { requestLocationPermission } = useLocation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <MapPin
        size={64}
        color={Colors.dark.primary}
        style={{ marginBottom: 20 }}
      />
      <Text
        style={{
          fontSize: 18,
          marginBottom: 20,
          marginTop: 20,
          textAlign: 'center',
        }}
      >
        This app needs location permissions to function properly.
      </Text>
      <Button
        title="Grant Permissions"
        onPress={() => {
          Linking.openSettings();
          // Call onGranted when user returns to app

          setTimeout(() => {
            requestLocationPermission();
          }, 1000);
        }}
      />
    </View>
  );
}
