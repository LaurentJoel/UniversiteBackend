import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}

export default function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const { theme } = useTheme();

  return (    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>      <View style={styles.info}>
        <Text style={[styles.number, { color: theme.colors.text }]}>Chambre {room.number}</Text>
        <Text style={[styles.detail, { color: theme.colors.text }]}>Type: {room.type}</Text>
        <Text style={[styles.detail, { color: theme.colors.text }]}>Statut: {room.status}</Text>
        {room.floor !== undefined && (
          <Text style={[styles.detail, { color: theme.colors.text }]}>Étage: {room.floor}</Text>
        )}
        {room.rent !== undefined && (
          <Text style={[styles.detail, { color: theme.colors.text }]}>Loyer: {room.rent.toLocaleString()} FCFA</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(room)}>
          <Icon name="edit" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(room.id)}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  info: {
    flex: 1,
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
