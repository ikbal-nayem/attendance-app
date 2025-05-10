import { API_CONSTANTS } from '@/constants/api';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export const getNewDeviceId = async () => {
  const deviceId =
    Platform.OS === 'android'
      ? Application?.getAndroidId()
      : await Application?.getIosIdForVendorAsync();
  return deviceId || uuidv4();
};

export const generateUserImage = (userId: string, sessionID: string, companyID: string) => {
  return (
    API_CONSTANTS.BASE_URL +
    API_CONSTANTS.USER_IMAGE +
    `?sUserID=${userId}&sSessionID=${sessionID}&sCompanyID=${companyID}`
  );
};
