import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Room } from '../../types';
import Icon from '@expo/vector-icons/MaterialIcons';
import UserProfile from '../../components/UserProfile';
import apiService, { IApiService } from '../../services/apiService';

export default function MyRoom(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileVisible, setProfileVisible] = useState<boolean>(false);  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async (): Promise<void> => {
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }
    
    console.log('Fetching room for user ID:', user.id);
    setLoading(true);
    setError(undefined);

    try {
      // First get student info with the user ID
      console.log('Calling getStudentById with ID:', user.id);
      const student = await apiService.getStudentById(user.id);
      console.log('Student data received:', student);
      
      if (student && student.roomId) {
        console.log('Student has roomId:', student.roomId);
        // If student has a room, fetch room details
        const roomData = await apiService.getRoomById(student.roomId);
        console.log('Room data received:', roomData);
        setRoom(roomData);
      } else {
        console.log('Student has no room assignment:', student);
      }
    } catch (err: unknown) {
      console.error('Error fetching room:', err);
      setError('Échec du chargement des informations de la chambre. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setProfileVisible(true)} style={[styles.headerButton, { backgroundColor: theme.colors.card }]}>
          <Icon name="person" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={[styles.headerButton, { backgroundColor: theme.colors.card }]}>
          <Icon
            name={theme.dark ? 'light-mode' : 'dark-mode'}
            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={[styles.headerButton, { backgroundColor: theme.colors.card }]}>
          <Icon name="logout" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>      <Text style={[styles.title, { color: theme.colors.text }]}>Ma Chambre</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement des informations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={theme.colors.notification} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRoom}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : room ? (
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.number, { color: theme.colors.text }]}>Chambre {room.number}</Text>
          <Text style={[styles.detail, { color: theme.colors.text }]}>Type: {room.type}</Text>
          <Text style={[styles.detail, { color: theme.colors.text }]}>Statut: {room.status}</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              {room.occupantCount === 0 ? 'Disponible' : 
               room.occupantCount === 1 ? 'Actuellement Occupée' : 'Entièrement Occupée'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
          <Icon name="home" size={48} color={theme.colors.border} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Aucune chambre réservée</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.border }]}>
            Contactez le bureau du logement pour réserver une chambre
          </Text>
        </View>
      )}

      <UserProfile 
        visible={profileVisible} 
        onClose={() => setProfileVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
