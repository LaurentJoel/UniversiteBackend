import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import StudentCard from '../../components/StudentCard';
import StudentForm from '../../components/StudentForm';
import { Student } from '../../types';
import Icon from '@expo/vector-icons/MaterialIcons';
import UserProfile from '../../components/UserProfile';
import apiService from '../../services/apiService';

export default function Students() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [profileVisible, setProfileVisible] = useState(false);    const [students, setStudents] = useState<Array<Student>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  useEffect(() => {
    fetchStudents();
  }, []);
    const fetchStudents = async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    
    try {
      console.log('📋 Fetching students from API...');
      const data: Array<Student> = await apiService.getStudents();
      console.log('📋 Received students data:', data);
      setStudents(data);
    } catch (err: unknown) {
      console.error('❌ Error fetching students:', err);
      setError('Échec du chargement des étudiants. Veuillez réessayer.');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec du chargement des étudiants.',
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      (student.matricule && student.matricule.toLowerCase().includes(search.toLowerCase()))
  );
  
  // Debug logging
  console.log('🔍 Current students state:', students);
  console.log('🔍 Filtered students:', filteredStudents);
  console.log('🔍 Loading state:', loading);
  console.log('🔍 Error state:', error);const handleAddStudent = async (student: Omit<Student, 'id'>): Promise<void> => {
    try {
      console.log('🔄 About to create student:', student);
      const newStudent = await apiService.createStudent(student);
      console.log('✅ Student created successfully, API returned:', newStudent);
      
      // Update the students state immediately to show the new student
      setStudents(prevStudents => {
        const updatedStudents = [...prevStudents, newStudent];
        console.log('📋 Updated students list:', updatedStudents);
        return updatedStudents;
      });
      
      // Close the modal immediately
      setModalVisible(false);
      setEditingStudent(null);
      
      Toast.show({
        type: 'success',
        text1: 'Étudiant Ajouté',
        text2: `${student.name} créé avec succès.`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (err: unknown) {
      console.error('❌ Error creating student:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la création de l\'étudiant.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  };

  const handleEditStudent = (student: Student): void => {
    setEditingStudent(student);
    setModalVisible(true);
  };
    const handleUpdateStudent = async (updatedStudent: Omit<Student, 'id'>): Promise<void> => {
    if (editingStudent) {
      try {
        console.log('🔄 Attempting to update student:', updatedStudent);
        const updated = await apiService.updateStudent(editingStudent.id, updatedStudent);
        console.log('✅ Student updated successfully:', updated);
        
        // Update state immediately and ensure UI reflects changes
        setStudents(
          students.map((s) => s.id === editingStudent.id ? updated : s)
        );
        
        // Close modal and reset state immediately
        setModalVisible(false);
        setEditingStudent(null);
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Étudiant Mis à Jour',
          text2: `${updatedStudent.name} mis à jour avec succès.`,
          position: 'bottom',
          visibilityTime: 4000,
        });
      } catch (err: unknown) {
        console.error('Error updating student:', err);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Échec de la mise à jour de l\'étudiant.',
          position: 'bottom',
          visibilityTime: 4000,
        });
      }
    }
  };  const handleDeleteStudent = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Attempting to delete student with ID:', id);
      console.log('Current students before delete:', students.length);
      
      await apiService.deleteStudent(id);
      console.log('✅ Student deleted successfully from backend');
      
      // Update state immediately using functional update pattern
      setStudents(prevStudents => {
        const updatedStudents = prevStudents.filter((s) => s.id !== id);
        console.log('Students after delete:', updatedStudents.length);
        return updatedStudents;
      });
      
      Toast.show({
        type: 'success',
        text1: 'Étudiant Supprimé',
        text2: 'Étudiant supprimé avec succès.',
        position: 'bottom',
        visibilityTime: 4000,
      });    } catch (err: unknown) {
      console.error('❌ Error deleting student in handleDeleteStudent:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Check if this is actually a successful deletion that was misinterpreted
      const error = err as any;
      if (error && error.status === 204) {
        console.log('✅ Actually successful - 204 response received');
        // Update state anyway since the deletion was successful
        setStudents(prevStudents => {
          const updatedStudents = prevStudents.filter((s) => s.id !== id);
          console.log('Students after delete (from catch block):', updatedStudents.length);
          return updatedStudents;
        });
        
        Toast.show({
          type: 'success',
          text1: 'Étudiant Supprimé',
          text2: 'Étudiant supprimé avec succès.',
          position: 'bottom',
          visibilityTime: 4000,
        });
        return;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la suppression de l\'étudiant.',
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
      
      <Text style={[styles.title, { color: theme.colors.text }]}>Gestion des Étudiants</Text>
      
      <TextInput
        style={[styles.searchInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Rechercher des étudiants..."
        placeholderTextColor={theme.colors.border}
        value={search}
        onChangeText={setSearch}
      />      
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={theme.colors.notification} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStudents}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.text }]}>Aucun étudiant trouvé.</Text>}
          refreshing={loading}
          onRefresh={fetchStudents}
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
          <StudentForm
            initialStudent={editingStudent || undefined}
            onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
            onCancel={() => {
              setModalVisible(false);
              setEditingStudent(null);
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginTop: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
