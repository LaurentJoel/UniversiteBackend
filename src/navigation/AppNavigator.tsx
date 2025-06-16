import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '@expo/vector-icons/MaterialIcons';

// Auth Screens
import Login from '../screens/auth/Login';

// Admin Screens
import Dashboard from '../screens/admin/Dashboard';
import Rooms from '../screens/admin/Rooms';
import Students from '../screens/admin/Students';
import Payments from '../screens/admin/Payments';

// Student Screens
import MyRoom from '../screens/student/MyRoom';
import MyPayments from '../screens/student/MyPayments';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Rooms') {
            iconName = 'room';
          } else if (route.name === 'Students') {
            iconName = 'people';
          } else if (route.name === 'Payments') {
            iconName = 'payment';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.border,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={Rooms} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Students" 
        component={Students} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Payments" 
        component={Payments} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function StudentTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'MyRoom') {
            iconName = 'home';
          } else if (route.name === 'MyPayments') {
            iconName = 'payment';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.border,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="MyRoom" 
        component={MyRoom} 
        options={{ 
          title: 'My Room',
          headerShown: false 
        }}
      />
      <Tab.Screen 
        name="MyPayments" 
        component={MyPayments} 
        options={{ 
          title: 'Payments',
          headerShown: false 
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  console.log('Navigation state:', { isAuthenticated, userRole: user?.role, loading });

  // Don't render the navigator until auth state is loaded
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="hourglass-empty" size={40} color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.text }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ headerShown: false }}
          />
        ) : user?.role === 'admin' ? (
          <Stack.Screen 
            name="AdminTabs" 
            component={AdminTabs} 
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen 
            name="StudentTabs" 
            component={StudentTabs} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
