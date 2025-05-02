import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

type DeviceInfo = {
  // Platform basics
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos';
  platformVersion: string;

  // Device identification
  isPhysicalDevice: boolean;
  deviceBrand: string | null;
  deviceModel: string | null;
  deviceName: string | null;
  manufacturer: string | null;
  deviceYear: number | null;
  deviceId: string | null;

  // OS information
  osName: string;
  osVersion: string;
  osBuildId?: string;

  // Hardware info
  totalMemory: number | null;
  supportedCpuArchs: (string | null)[] | null;

  // App info
  appVersion: string | null;
  buildNumber: string | null;
  installationId: string | null;
};

export const getDeviceInfo = (): DeviceInfo => {
  const platformConstants = Platform.constants as any;

  return {
    // Core platform info
    platform: Platform.OS,
    platformVersion: Platform.Version.toString(),

    // Device hardware info
    isPhysicalDevice: Device.isDevice,
    deviceBrand: Device.brand,
    deviceModel: Device.modelName,
    deviceName: Device.deviceName,
    manufacturer: Device.manufacturer,
    deviceYear: Device.deviceYearClass,
    deviceId: Constants.installationId || Application.getAndroidId() || Device.osInternalBuildId,

    // Memory/Architecture
    totalMemory: Device.totalMemory,
    supportedCpuArchs: Device.supportedCpuArchitectures,

    // OS details
    osName: Device.osName || Platform.OS,
    osVersion: Device.osVersion || platformConstants?.Release || 'unknown',
    osBuildId: platformConstants?.Build?.ID,

    // App information
    appVersion: Application.nativeApplicationVersion || null,
    buildNumber: Application.nativeBuildVersion || null,
    installationId: Constants.installationId,
  };
};
