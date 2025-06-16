import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { Student, Room } from '../types';
import apiService from '../services/apiService';

interface StudentFormProps {
  initialStudent?: Student;
  onSubmit: (student: Omit<Student, 'id'>) => void;
  onCancel: () => void;
}

export default function StudentForm({ initialStudent, onSubmit, onCancel }: StudentFormProps): React.ReactElement {
  const { theme } = useTheme();  const [name, setName] = useState<string>(initialStudent?.name || '');
  const [email, setEmail] = useState<string>(initialStudent?.email || '');
  const [password, setPassword] = useState<string>(''); // Always start empty for security
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>(initialStudent?.roomId || '');
  const [role, setRole] = useState<'admin' | 'student'>(initialStudent?.role as 'admin' | 'student' || 'student');
  const [filiere, setFiliere] = useState<string>(initialStudent?.filiere || '');
  const [niveau, setNiveau] = useState<number>(initialStudent?.niveau || 1);
  const [phone, setPhone] = useState<string>(initialStudent?.phone || '');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  
  // Fetch available rooms when the component mounts
  useEffect(() => {
    fetchRooms();
  }, []);
  
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      // Fetch rooms with 'available' status
      const availableRooms = await apiService.getRoomsByStatus('available');
      setRooms(availableRooms);
      
      // If editing a student and they have a room, make sure it's included in the list
      if (initialStudent?.roomId) {
        try {
          const currentRoom = await apiService.getRoomById(initialStudent.roomId);
          if (currentRoom && !availableRooms.some(room => room.id === currentRoom.id)) {
            setRooms(prevRooms => [...prevRooms, currentRoom]);
          }
        } catch (error) {
          console.error('Error fetching current room:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les chambres disponibles.',
      });
    } finally {
      setLoadingRooms(false);
    }
  };    const handleSubmit = (): void => {
    if (!name || !email) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez remplir le nom et l\'email.',
      });
      return;
    }
      if (email && !/\S+@\S+\.\S+/.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer un email valide.',
      });
      return;
    }
    
    // Password validation - required for new students, optional for existing ones
    if (!initialStudent && (!password || password.length < 6)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Le mot de passe doit contenir au moins 6 caractères pour un nouveau étudiant.',
      });
      return;
    }
    
    if (initialStudent && password && password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Si vous modifiez le mot de passe, il doit contenir au moins 6 caractères.',
      });
      return;
    }
    
    // Prepare student data - only include password if it's provided
    const studentData: any = { 
      name, 
      email, 
      roomId, 
      role,
      filiere,
      niveau, 
      phone
    };
    
    // Only include password if it's provided (for new students or when updating password)
    if (password && password.length >= 6) {
      studentData.password = password;
    }
    
    onSubmit(studentData);
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <ScrollView>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Nom"
          placeholderTextColor={theme.colors.border}
          value={name}
          onChangeText={setName}
        />        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.border}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />        <View style={[styles.passwordContainer, { borderColor: theme.colors.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.colors.text }]}
            placeholder={initialStudent ? "Nouveau mot de passe (optionnel, min. 6 caractères)" : "Mot de passe (min. 6 caractères)"}
            placeholderTextColor={theme.colors.border}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={theme.colors.border}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Filière (INFO, GESTION, etc.)"
          placeholderTextColor={theme.colors.border}
          value={filiere}
          onChangeText={setFiliere}
        />        <Text style={[styles.label, { color: theme.colors.text }]}>Niveau d'études</Text>        <View style={[styles.pickerContainer, { 
          borderColor: theme.colors.primary, 
          backgroundColor: '#FFFFFF'
        }]}>
          <Picker
            selectedValue={niveau.toString()}
            onValueChange={(itemValue) => setNiveau(parseInt(itemValue, 10))}
            style={[styles.picker, { color: '#000000' }]}
            dropdownIconColor="#000000"
            mode="dropdown"
          >
            <Picker.Item label="1ère année" value="1" color="#000000" />
            <Picker.Item label="2ème année" value="2" color="#000000" />
            <Picker.Item label="3ème année" value="3" color="#000000" />
            <Picker.Item label="4ème année" value="4" color="#000000" />
            <Picker.Item label="5ème année" value="5" color="#000000" />
          </Picker>
        </View>

        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Téléphone"
          placeholderTextColor={theme.colors.border}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
          <Text style={[styles.label, { color: theme.colors.text }]}>Rôle du compte utilisateur</Text>        <View style={[styles.pickerContainer, { 
          borderColor: theme.colors.primary,
          backgroundColor: '#FFFFFF'
        }]}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue as 'admin' | 'student')}
            style={[styles.picker, { color: '#000000' }]}
            dropdownIconColor="#000000"
            mode="dropdown"
          >
            <Picker.Item label="Étudiant" value="student" color="#000000" />
            <Picker.Item label="Administrateur" value="admin" color="#000000" />
          </Picker>
        </View>
        <Text style={[styles.helperText, { color: theme.colors.text }]}>
          Ce rôle sera utilisé pour l'accès au système.
        </Text>
        
        <Text style={[styles.label, { color: theme.colors.text }]}>Chambre</Text>
        {loadingRooms ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement des chambres...</Text>
          </View>
        ) : (          <View style={[styles.pickerContainer, { 
            borderColor: theme.colors.primary,
            backgroundColor: '#FFFFFF'
          }]}>
            <Picker
              selectedValue={roomId}
              onValueChange={(itemValue) => setRoomId(itemValue)}
              style={[styles.picker, { color: '#000000' }]}
              dropdownIconColor="#000000"
              mode="dropdown"
            >
              <Picker.Item label="-- Sélectionner une chambre --" value="" color="#000000" />
              {rooms.map((room) => (
                <Picker.Item 
                  key={room.id} 
                  label={`Chambre ${room.number} (${room.type})`} 
                  value={room.id}
                  color="#000000"
                />
              ))}
            </Picker>
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.border }]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },  pickerContainer: {
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },picker: {
    height: 50,
    width: '100%',
    ...Platform.select({
      web: {
        backgroundColor: 'transparent',
        color: 'inherit',
      },
      default: {},
    }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add additional styling for better picker visibility
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
