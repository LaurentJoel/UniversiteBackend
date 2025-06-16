import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';

interface UserProfileData {
  id: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface UserProfileProps {
  visible: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ visible, onClose }) => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);  const [profileData, setProfileData] = useState<UserProfileData>({
    id: user?.id || '',
    username: user?.username || user?.name || '',
    role: user?.role || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id,
        username: user.username || user.name,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!profileData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      setLoading(true);
      await updateUser({
        username: profileData.username,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      });
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    if (user) {
      setProfileData({
        id: user.id,
        username: user.username || user.name,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
    onClose();
  };  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      padding: 5,
    },
    closeButtonText: {
      fontSize: 24,
      color: theme.colors.text,
      fontWeight: 'bold',
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    section: {
      marginBottom: 20,
      backgroundColor: theme.colors.card,
      padding: 15,
      borderRadius: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    row: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    disabledInput: {
      backgroundColor: theme.colors.card,
      color: '#999',
    },
    value: {
      fontSize: 16,
      color: theme.colors.text,
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButton: {
      backgroundColor: '#4CAF50',
    },
    cancelButton: {
      backgroundColor: '#f44336',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading && isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.label, { marginTop: 10 }]}>Updating profile...</Text>
      </View>
    );
  }
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>User Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {loading && isEditing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.label, { marginTop: 10 }]}>Updating profile...</Text>
          </View>
        ) : (
          <ScrollView style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{profileData.id}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{profileData.role}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          {isEditing ? (            <TextInput
              style={styles.input}
              value={profileData.username}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, username: text }))}
              placeholder="Enter username"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.value}>{profileData.username}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>First Name</Text>
          {isEditing ? (            <TextInput
              style={styles.input}
              value={profileData.firstName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter first name"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.value}>{profileData.firstName || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Last Name</Text>
          {isEditing ? (            <TextInput
              style={styles.input}
              value={profileData.lastName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter last name"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.value}>{profileData.lastName || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
              placeholder="Enter email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{profileData.email || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          {isEditing ? (            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{profileData.phone || 'Not set'}</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default UserProfile;
