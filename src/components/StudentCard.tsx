import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export default function StudentCard({ student, onEdit, onDelete }: StudentCardProps): React.ReactElement {
  const { theme } = useTheme();

  return (    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{student.name}</Text>
        <Text style={[styles.detail, { color: theme.colors.text }]}>Email: {student.email}</Text>
        <Text style={[styles.detail, { color: theme.colors.text }]}>Chambre: {student.roomId || 'Aucune'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(student)}>
          <Icon name="edit" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(student.id)}>
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
  name: {
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
