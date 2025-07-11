import { Platform } from 'react-native';

// Build configuration
export const BUILD_CONFIG = {
  APP_NAME: 'University Room Management',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Bundle identifiers
  IOS_BUNDLE_ID: 'com.university.roommanagement',
  ANDROID_PACKAGE: 'com.university.roommanagement',
  
  // App store info
  APP_STORE_ID: '', // Will be assigned after first submission
  PLAY_STORE_URL: '', // Will be assigned after first submission
};

// EAS Build configuration for app.json
export const EAS_CONFIG = {
  expo: {
    name: BUILD_CONFIG.APP_NAME,
    slug: 'university-room-management',
    version: BUILD_CONFIG.VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#4CAF50',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: BUILD_CONFIG.IOS_BUNDLE_ID,
      buildNumber: BUILD_CONFIG.BUILD_NUMBER,
      infoPlist: {
        NSCameraUsageDescription: 'This app uses camera for QR code scanning.',
        NSLocationWhenInUseUsageDescription: 'This app uses location for room mapping.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#4CAF50',
      },
      package: BUILD_CONFIG.ANDROID_PACKAGE,
      versionCode: parseInt(BUILD_CONFIG.BUILD_NUMBER),
      permissions: [
        'CAMERA',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '', // Will be generated by EAS
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '13.0',
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 21,
          },
        },
      ],
    ],
  },
};

// EAS Build profiles
export const EAS_BUILD_PROFILES = {
  build: {
    development: {
      distribution: 'internal',
      android: {
        gradleCommand: ':app:assembleDebug',
      },
      ios: {
        buildConfiguration: 'Debug',
      },
    },
    preview: {
      distribution: 'internal',
      android: {
        buildType: 'apk',
      },
    },
    production: {
      android: {
        buildType: 'aab',
      },
    },
  },
  submit: {
    production: {},
  },
};

// Deployment commands
export const DEPLOYMENT_COMMANDS = {
  // Development build
  buildDev: 'eas build --profile development --platform all',
  
  // Preview build (for testing)
  buildPreview: 'eas build --profile preview --platform all',
  
  // Production build
  buildProd: 'eas build --profile production --platform all',
  
  // Submit to stores
  submitIOS: 'eas submit --platform ios',
  submitAndroid: 'eas submit --platform android',
  
  // Update over-the-air
  updatePublish: 'eas update --auto',
};
