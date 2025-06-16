import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for tracking if the user has been notified about mock data
const MOCK_DATA_NOTIFICATION_KEY = 'mock_data_notification_shown';

/**
 * Custom hook that shows a notification to the user when mock data is being used
 * due to API connection issues. Shows the notification only once per app session.
 */
export const useMockDataNotification = (): void => {
  const [notificationShown, setNotificationShown] = useState<boolean>(false);

  useEffect(() => {
    const checkAndShowNotification = async (): Promise<void> => {
      try {
        // Check if we've already shown this notification in this session
        const shown = await AsyncStorage.getItem(MOCK_DATA_NOTIFICATION_KEY);
        
        if (shown !== 'true') {
          // Show the notification if not shown yet
          Alert.alert(
            'Using Demo Data',
            'Unable to connect to the server. The app is currently using demo data for demonstration purposes. Some features may be limited.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  // Mark as shown for this session
                  await AsyncStorage.setItem(MOCK_DATA_NOTIFICATION_KEY, 'true');
                  setNotificationShown(true);
                }
              }
            ]
          );
        } else {
          setNotificationShown(true);
        }
      } catch (error) {
        console.error('Error checking mock data notification status:', error);
      }
    };

    if (!notificationShown) {
      checkAndShowNotification();
    }
    
    // Clear the notification flag when the app is closed/restarted
    return () => {
      AsyncStorage.removeItem(MOCK_DATA_NOTIFICATION_KEY).catch(err => 
        console.error('Error clearing mock data notification status:', err)
      );
    };
  }, [notificationShown]);
};

/**
 * Resets the mock data notification status, allowing it to be shown again
 */
export const resetMockDataNotification = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MOCK_DATA_NOTIFICATION_KEY);
  } catch (error) {
    console.error('Error resetting mock data notification status:', error);
  }
};
