import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  title: string;
  name: string;
  staffId: string;
  mobile: string;
  email: string;
  photo: string;
  isCompanyDevice: boolean;
  role: string;
  department: string;
  joiningDate: string;
  status: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (staffId: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  tempUserData: Partial<User> | null;
  setTempUserData: (data: Partial<User> | null) => void;
};

const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  verifyOtp: async () => false,
  tempUserData: null,
  setTempUserData: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// Dummy user data
const dummyUser: User = {
  id: '1',
  title: 'Mr.',
  name: 'Yead Mosharof',
  staffId: '123456',
  mobile: '+8801712345678',
  email: 'user@email.com',
  photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
  isCompanyDevice: true,
  role: 'Asst. Admin Officer',
  department: 'Administration',
  joiningDate: '12-2-2020',
  status: 'Full Time',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState<Partial<User> | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoginStatus = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (staffId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple dummy validation
    if (staffId === dummyUser.staffId || staffId === dummyUser.email) {
      await AsyncStorage.setItem('user', JSON.stringify(dummyUser));
      setUser(dummyUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsLoading(false);
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store the registration data temporarily
    setTempUserData(userData);
    
    setIsLoading(false);
    return true;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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