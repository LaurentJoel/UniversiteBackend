import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import RoomCard from '../../components/RoomCard';
import RoomForm from '../../components/RoomForm';
import { Room, Status } from '../../types';
import Icon from '@expo/vector-icons/MaterialIcons';
import UserProfile from '../../components/UserProfile';
import apiService, { IApiService } from '../../services/apiService';

export default function Rooms(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();  const [profileVisible, setProfileVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Array<Room>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  useEffect(() => {
    fetchRooms();
  }, []);
  const fetchRooms = async (): Promise<void> => {
    setLoading(true);
    setError(undefined);    try {
      const data = await apiService.getRooms();      setRooms(data);
    } catch (err: unknown) {
      setError('Échec du chargement des chambres. Veuillez réessayer.');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec du chargement des chambres.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    // Filter by status
    const statusMatch = filter === 'all' || room.status === filter;
    
    // Filter by search query (room number, type, floor)
    const searchMatch = searchQuery === '' || 
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.floor && room.floor.toString().includes(searchQuery));
    
    return statusMatch && searchMatch;
  });
    const handleAddRoom = async (room: Omit<Room, 'id'>): Promise<void> => {
    setLoading(true);
    try {
      const newRoom = await apiService.createRoom(room);
      
      // Update the rooms state immediately to show the new room
      setRooms(prevRooms => [...prevRooms, newRoom]);
      
      // Close the modal immediately
      setModalVisible(false);
      setEditingRoom(undefined);
      
      Toast.show({
        type: 'success',
        text1: 'Chambre ajoutée',
        text2: `Chambre ${newRoom.number} (Étage ${newRoom.floor}) ajoutée avec succès.`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (err: unknown) {
      console.error('Error creating room:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la création de la chambre.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };const handleEditRoom = (room: Room): void => {
    setEditingRoom(room);
    setModalVisible(true);
  };
  
  const handleUpdateRoom = async (updatedRoom: Omit<Room, 'id'>): Promise<void> => {
    if (editingRoom) {
      try {
        console.log('🔄 Attempting to update room:', updatedRoom);
        const updated = await apiService.updateRoom(editingRoom.id, updatedRoom);
        console.log('✅ Room updated successfully:', updated);
        
        // Update state immediately and ensure UI reflects changes
        setRooms(
          rooms.map((r) => r.id === editingRoom.id ? updated : r)
        );
          // Close modal and reset state immediately
        setModalVisible(false);
        setEditingRoom(undefined);
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Chambre Mise à Jour',
          text2: `Chambre ${updatedRoom.number} mise à jour avec succès.`,
          position: 'bottom',
          visibilityTime: 4000,
        });
      } catch (err) {
        console.error('❌ Error updating room:', err);        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Échec de la mise à jour de la chambre.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      }
    }
  };
  
  const handleDeleteRoom = async (id: string): Promise<void> => {
    try {
      await apiService.deleteRoom(id);
      setRooms(rooms.filter((r) => r.id !== id));      Toast.show({
        type: 'success',
        text1: 'Chambre Supprimée',
        text2: 'Chambre supprimée avec succès.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (err: unknown) {      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la suppression de la chambre.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  };
  return (
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
      </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Gestion des Chambres</Text>
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Icon name="search" size={24} color={theme.colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Rechercher par numéro, type ou étage..."
          placeholderTextColor={theme.colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Icon name="clear" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'available', 'occupied', 'complet'] as (Status | 'all')[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.border },
            ]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status ? { color: '#FFFFFF' } : { color: theme.colors.text }]}>
              {status === 'all' ? 'Toutes' :
               status === 'available' ? 'Disponibles' :
               status === 'occupied' ? 'Occupées' :
               status === 'complet' ? 'Complet' : status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Results Counter */}
      {(searchQuery.length > 0 || filter !== 'all') && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsText, { color: theme.colors.text }]}>
            {filteredRooms.length} chambre{filteredRooms.length !== 1 ? 's' : ''} trouvée{filteredRooms.length !== 1 ? 's' : ''}
            {searchQuery.length > 0 && ` pour "${searchQuery}"`}
            {filter !== 'all' && ` (${filter === 'available' ? 'Disponibles' : filter === 'occupied' ? 'Occupées' : filter === 'complet' ? 'Complet' : filter})`}
          </Text>
        </View>
      )}{loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement des chambres...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={theme.colors.notification} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
            />          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-off" size={48} color={theme.colors.text} style={{ opacity: 0.3 }} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {searchQuery.length > 0 
                  ? `Aucune chambre trouvée pour "${searchQuery}"`
                  : filter !== 'all'
                  ? `Aucune chambre ${filter === 'available' ? 'disponible' : filter === 'occupied' ? 'occupée' : filter === 'complet' ? 'complète' : filter} trouvée`
                  : 'Aucune chambre trouvée'
                }
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={[styles.clearSearchButton, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.clearSearchText}>Effacer la recherche</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          refreshing={loading}
          onRefresh={fetchRooms}
        />
      )}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <RoomForm
            initialRoom={editingRoom || undefined}
            onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom}            onCancel={() => {
              setModalVisible(false);
              setEditingRoom(undefined);
            }}
          />
        </View>
      </Modal>

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
    borderRadius: 8,
  },  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  resultsContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },  resultsText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
