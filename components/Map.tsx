import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

// Only import MapView on native platforms
let MapView: any;
let Marker: any;
let Callout: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

type Location = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type MapMarker = {
  id: string;
  title: string;
  location: Location;
  color?: string;
};

type MapProps = {
  markers: MapMarker[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  style?: any;
};

export default function Map({ markers, initialRegion, style }: MapProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.webMapFallback}>
          <Text style={styles.webMapTitle}>Location Information</Text>
          {markers.map((marker) => (
            <View key={marker.id} style={styles.webMapItem}>
              <Text style={styles.webMapMarkerTitle}>{marker.title}</Text>
              <Text style={styles.webMapCoordinates}>
                Latitude: {marker.location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.webMapCoordinates}>
                Longitude: {marker.location.longitude.toFixed(6)}
              </Text>
              <Text style={styles.webMapTimestamp}>
                Last updated: {new Date(marker.location.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!MapView) return null;

  return (
    <MapView
      style={[styles.container, style]}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.location.latitude,
            longitude: marker.location.longitude,
          }}
          title={marker.title}
          pinColor={marker.color}
        >
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{marker.title}</Text>
              <Text style={styles.calloutText}>
                Last updated: {new Date(marker.location.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webMapFallback: {
    flex: 1,
    padding: Layout.spacing.m,
    backgroundColor: Colors.light.background,
  },
  webMapTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: Layout.spacing.m,
  },
  webMapItem: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    ...Layout.shadow.light,
  },
  webMapMarkerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  webMapCoordinates: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  webMapTimestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: Layout.spacing.xs,
  },
  callout: {
    padding: Layout.spacing.s,
    minWidth: 150,
  },
  calloutTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  calloutText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
  },
});