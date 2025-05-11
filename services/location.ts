import * as Location from 'expo-location';

export const getAddressFromCoordinates = async (
  latitude?: number,
  longitude?: number
): Promise<string> => {
  if (!latitude || !longitude) return 'Unknown location';
  try {
    const location = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (location && location.length > 0) {
      const { formattedAddress, streetNumber, street, city, region, country, postalCode } =
        location[0];

      const addressParts = [streetNumber, street, city, region, postalCode, country].filter(
        Boolean
      );
      return formattedAddress || addressParts.join(', ');
    }

    return 'Unknown location';
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return 'Unknown location';
  }
};