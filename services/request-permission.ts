import { PermissionsAndroid } from 'react-native';

export const requestReadPhoneStatePermission = async () => {
  try {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
    );
    if (alreadyGranted) return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      {
        title: 'Phone State Permission',
        message: 'App needs access to phone state to identify your device',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Phone state permission granted');
      // Proceed with accessing phone state
      return true;
    } else {
      console.log('Phone state permission denied');
      // Handle permission denial
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
