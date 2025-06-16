// Utility for consistent API error handling
import { Alert } from 'react-native';

// Common error messages for user display
export const ERROR_MESSAGES = {
  NETWORK: 'Network connection error. Please check your internet connection.',
  SERVER: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  DEFAULT: 'An error occurred. Please try again.',
};

/**
 * Handle API errors consistently across the app
 * @param error The error object from the API call
 * @param customMessage Optional custom message to show
 */
export const handleApiError = (error: any, customMessage?: string): string => {
  console.error('API Error:', error);
  
  let message = customMessage || ERROR_MESSAGES.DEFAULT;
  
  // Check if it's a network error
  if (error.message?.includes('Network') || error.name === 'AbortError') {
    message = ERROR_MESSAGES.NETWORK;
  } 
  // Check for HTTP status based errors
  else if (error.status) {
    switch (error.status) {
      case 401:
        message = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        message = ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        message = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
        message = ERROR_MESSAGES.SERVER;
        break;
    }
  }
  
  return message;
};

/**
 * Show an error alert with consistent styling
 */
export const showErrorAlert = (message: string, title = 'Error') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};
