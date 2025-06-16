// API Configuration for different environments, optimized for mobile
import { Platform } from 'react-native';

// Helper to get the correct local IP for the development environment
const getLocalApiUrl = () => {
  // When running on a physical device, we need to use the computer's network IP
  // instead of localhost which would refer to the device itself
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // 10.0.2.2 is the special IP Android emulator uses to connect to localhost on the host
    // 127.0.0.1 works for iOS simulator
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:5000' 
      : 'http://localhost:5000';
  }
  return 'http://localhost:5000';
};

const API_CONFIG = {
  development: {
    baseURL: getLocalApiUrl(),
    timeout: 30000, // Increased timeout for development
  },
  staging: {
    baseURL: 'https://staging-api.university.edu',
    timeout: 20000,
  },
  production: {
    baseURL: 'https://api.university.edu',
    timeout: 30000,
  },
};

export const getApiConfig = () => {
  // Use development config when in development mode
  const env = __DEV__ ? 'development' : 'production';
  return API_CONFIG[env];
};

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  
  // Rooms (updated to match backend routes)
  ROOMS: '/chambres',
  ROOM_BY_ID: (id: string) => `/chambres/${id}`,
  ROOMS_BY_STATUS: (status: string) => `/chambres/status/${status}`,
  ROOMS_BY_FLOOR: (floor: number) => `/chambres/floor/${floor}`,
    // Students (updated to match backend routes)
  STUDENTS: '/etudiants',
  STUDENT_BY_ID: (id: string) => `/etudiants/${id}`,
  STUDENT_BY_MATRICULE: (matricule: string) => `/etudiants/matricule/${matricule}`,
  STUDENT_REMAINING_RENT: (id: string) => `/etudiants/${id}/remaining-rent`,
  
  // Payments
  PAYMENTS: '/payments',
  STUDENT_PAYMENTS: (studentId: string) => `/payments/student/${studentId}`,
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
};
