import { axiosIns } from '@/api/config';
import { API_CONSTANTS } from '@/constants/api';
import { IUser } from '@/interfaces/auth'; // Import IUser
import { localData } from '@/services/storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: FormData) => Promise<boolean>;
  logout: () => Promise<void>; // Correct return type to Promise<void>
  register: (userData: Partial<IUser>) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  tempUserData: Partial<IUser> | null;
  setTempUserData: (data: Partial<IUser> | null) => void;
};

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {}, // Match async in default
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
          setUser(JSON.parse(userJson));
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

  const login = (data: FormData): Promise<boolean> => { // Match type definition FormData
    return new Promise((resolve) => {
      setIsLoading(true);
      axiosIns
        .post(API_CONSTANTS.SIGN_IN, data)
        .then(async (response) => {
          await localData.set('user', JSON.stringify(response.data));
          setUser(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setIsLoading(false));
    });
  };

  const logout = async () => {
    setIsLoading(true);
    await localData.remove('user');
    setUser(null);
    setIsLoading(false);
  };

  const register = async (userData: Partial<IUser>): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store the registration data temporarily
    setTempUserData(userData);

    setIsLoading(false);
    return true;
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
