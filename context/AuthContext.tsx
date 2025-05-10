import { axiosIns } from '@/api/config';
import { API_CONSTANTS } from '@/constants/api';
import { USER_DEVICE_ID } from '@/constants/common';
import { localData } from '@/services/storage';
import { getNewDeviceId } from '@/utils/generator';
import { AxiosResponse } from 'axios';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useToast } from './ToastContext';

type AuthContextType = {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: FormData) => Promise<string | IObject>;
  logout: () => Promise<void>;
  registerRequest: (userData: FormData) => Promise<boolean | string>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; message: string }>;
  tempUserData: FormData | null;
  setTempUserData: (data: any) => void;
};

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => '',
  logout: async () => {},
  registerRequest: async () => false,
  verifyOtp: async () => ({ success: false, message: '' }),
  tempUserData: null,
  setTempUserData: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState<FormData | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const userJson = await localData.get('user');
        if (userJson) {
          // console.log('User found: ', userJson);
          setUser(userJson);
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const getDeviceId = async () => {
      try {
        let deviceId = await localData.get(USER_DEVICE_ID);
        if (!deviceId) {
          deviceId = await getNewDeviceId();
          await localData.set(USER_DEVICE_ID, deviceId);
        }
        console.log('Device ID: ', deviceId);
      } catch (error) {
        console.error('error', error);
        Alert.alert('Error', 'Failed to retrieve device ID, ' + JSON.stringify(error));
        showToast({ message: 'Error retrieving device ID', type: 'error' });
      }
    };
    getDeviceId();
  }, []);

  const login = (data: FormData): Promise<string | IObject> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      axiosIns
        .post(API_CONSTANTS.AUTH.SIGN_IN, data)
        .then(async (response: AxiosResponse<IResponse & IUser>) => {
          if (response.data?.messageCode === '0') {
            await localData.set('user', response.data);
            setUser(response.data);
            resolve({ success: true, data: response?.data });
          }
          reject(response.data?.messageDesc);
        })
        .catch((error) => {
          console.error(error);
          reject('An error occurred during login. Please try again.');
        })
        .finally(() => setIsLoading(false));
    });
  };

  const logout = async () => {
    setIsLoading(true);
    axiosIns
      .post(API_CONSTANTS.AUTH.LOG_OUT, {
        sUserID: user?.userID,
        sSessionID: user?.sessionID,
        sCompanyID: user?.companyID,
      })
      .finally(() => setIsLoading(false));
    await localData.remove('user');
    setIsLoading(false);
    setUser(null);
  };

  const registerRequest = async (userData: FormData): Promise<boolean | string> => {
    setIsLoading(true);
    try {
      const response = await axiosIns.post(API_CONSTANTS.AUTH.REGISTER_REQUEST, userData);
      console.log(response);
      if (response.data?.messageCode === '0') {
        userData.append('requestNo', response.data?.requestNo);
        setTempUserData(userData);
        return true;
      }
      return response.data.messageDesc;
    } catch (error) {
      console.error(error);
      return 'An error occurred during registration. Please try again.';
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      tempUserData?.append('sInfoOPT', otp);
      const response = await axiosIns.post(API_CONSTANTS.AUTH.REGISTER_SUBMIT, tempUserData);
      if (response.data?.messageCode === '0') {
        setTempUserData(null);
        return { success: true, message: response.data.messageDesc };
      }
      return { success: false, message: response.data.messageDesc };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'An error occurred during verification. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    registerRequest,
    verifyOtp,
    tempUserData,
    setTempUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
