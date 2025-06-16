import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService, { IApiService } from '../services/apiService';
import { API_ENDPOINTS } from '../config/api';

interface AuthContextType {
  user: User | undefined;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Load stored authentication on startup
    loadStoredAuth();
    
    // Auto logout after 30 minutes of inactivity
    const timer = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored authentication...');
      setLoading(true);
      
      const storedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      console.log('Stored user:', storedUser ? 'Found' : 'Not found');
      console.log('Stored token:', token ? 'Found' : 'Not found');
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        console.log('Setting user from storage:', userData);
        setUser(userData);
      } else {
        // If either token or user is missing, clear both for consistency
        if (storedUser || token) {
          console.log('Inconsistent auth state, clearing storage');
          await AsyncStorage.multiRemove(['user', 'token']);
        }
        setUser(undefined);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      setUser(undefined);
      // Clear potentially corrupted storage
      await AsyncStorage.multiRemove(['user', 'token']);
    } finally {
      setLoading(false);
    }
  };const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', email);
      // Call the login API
      const response = await apiService.login(email, password);
      
      console.log('Login response:', JSON.stringify(response));
      
      if (response && response.token) {
        // Extract user data from response
        const userData = response.user;
        
        if (!userData) {
          console.error('No user data in login response');
          return false;
        }
        
        console.log('Setting user data:', userData);
        
        // Save token and user data
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Update the state
        setUser(userData);
        return true;
      } else {
        console.error('Invalid login response format:', response);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call the logout API if the user is logged in
      if (user) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {      // Clear local storage and state regardless of API success
      setUser(undefined);
      await AsyncStorage.multiRemove(['user', 'token']);
    }
  };  const refreshUserInfo = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      // Call the API endpoint to get current user info using the getCurrentUser method
      const userData = await apiService.getCurrentUser();
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error);
      // If we can't get the user info, the token might be expired
      // so we should log the user out
      if (error.message?.includes('401')) {
        logout();
      }    }
  };
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Call the API to update the user
      const updatedUser = await apiService.updateUser(userData);
      
      // Update local state
      setUser(updatedUser);
      
      // Save to async storage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUserInfo,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
