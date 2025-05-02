import { axiosIns } from '@/api/config';
import { API_CONSTANTS } from '@/constants/api';
import { localData } from '@/services/storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: FormData) => Promise<boolean | string>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean | string>;
  verifyOtp: (otp: string) => Promise<boolean>;
  tempUserData: Partial<IUser> | null;
  setTempUserData: (data: Partial<IUser> | null) => void;
};

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  verifyOtp: async () => false,
  tempUserData: null,
  setTempUserData: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState<Partial<IUser> | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const userJson = await localData.get('user');
        if (userJson) {
          console.log('User found: ', userJson);
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

  const login = (data: FormData): Promise<boolean | string> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      axiosIns
        .post(API_CONSTANTS.AUTH.SIGN_IN, data)
        .then(async (response) => {
          if (response.data?.success && response.data?.sMessageCode === '0') {
            await localData.set('user', response.data);
            setUser(response.data);
            resolve(true);
          }
          reject(response.data.sMessageInfo);
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

  const register = async (userData: FormData): Promise<boolean | string> => {
    setIsLoading(true);
    try {
      const response = await axiosIns.post(
        API_CONSTANTS.AUTH.REGISTER,
        userData
      );
      console.log(response);
      if (response.data?.success && response.data?.messageCode === '0') {
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

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple dummy validation - any 6-digit OTP is accepted
    const isValid = /^\d{6}$/.test(otp);

    setIsLoading(false);
    return isValid;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    verifyOtp,
    tempUserData,
    setTempUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
