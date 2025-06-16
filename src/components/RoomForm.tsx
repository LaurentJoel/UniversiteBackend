import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { Room, Status } from '../types';

interface RoomFormProps {
  initialRoom?: Room;
  onSubmit: (room: Omit<Room, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function RoomForm({ initialRoom, onSubmit, onCancel }: RoomFormProps): React.ReactElement {
  const { theme } = useTheme();
  const [number, setNumber] = useState<string>(initialRoom?.number || '');
  const [type, setType] = useState<string>(initialRoom?.type || '');
  const [status, setStatus] = useState<Status>(initialRoom?.status || 'available');
  const [floor, setFloor] = useState<number>(initialRoom?.floor ?? 0);
  const [rent, setRent] = useState<number>(initialRoom?.rent ?? 0);
  const [maxOccupancy, setMaxOccupancy] = useState<number>(initialRoom?.maxOccupancy ?? 1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Debug logging
  console.log('RoomForm state:', { number, type, status, floor, rent, maxOccupancy });
  console.log('InitialRoom:', initialRoom);const handleSubmit = async (): Promise<void> => {
    if (!number || !type) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez remplir tous les champs obligatoires.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    if (maxOccupancy < 1) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'La capacité maximale doit être d\'au moins 1.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Call the parent component's onSubmit function
      // occupantCount will be calculated automatically by the system
      await onSubmit({ 
        number, 
        type, 
        status, 
        floor, 
        rent, 
        maxOccupancy 
      });
      
      // Reset form fields after successful submission
      if (!initialRoom) {
        setNumber('');
        setType('');
        setStatus('available');
        setFloor(0);
        setRent(0);
        setMaxOccupancy(1);
      }
      
      // No need to handle navigation here - parent component will close the modal
    } catch (err: unknown) {
      console.error('Error submitting room form:', err);
      // Show error toast only if the parent didn't handle it
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue lors de l\'enregistrement.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon name="meeting-room" size={32} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {initialRoom ? 'Modifier la Chambre' : 'Nouvelle Chambre'}
          </Text>
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations de Base
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Numéro de Chambre *
            </Text>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.colors.border, 
                color: theme.colors.text,
                backgroundColor: theme.colors.background 
              }]}
              placeholder="Ex: 101, A12, etc."
              placeholderTextColor="#999"
              value={number}
              onChangeText={setNumber}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Type de Chambre *
            </Text>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.colors.border, 
                color: theme.colors.text,
                backgroundColor: theme.colors.background 
              }]}
              placeholder="Ex: Simple, Double, Suite, etc."
              placeholderTextColor="#999"
              value={type}
              onChangeText={setType}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Étage
              </Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background 
                }]}
                placeholder="0"
                placeholderTextColor="#999"
                value={floor.toString()}
                onChangeText={text => {
                  const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setFloor(isNaN(numericValue) ? 0 : numericValue);
                }}
                keyboardType="numeric"
                selectTextOnFocus={true}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Capacité Max *
              </Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background 
                }]}
                placeholder="1"
                placeholderTextColor="#999"
                value={maxOccupancy > 0 ? maxOccupancy.toString() : ''}
                onChangeText={text => {
                  if (text === '') {
                    setMaxOccupancy(1);
                  } else {
                    const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
                    const newValue = Math.max(1, isNaN(numericValue) ? 1 : numericValue);
                    setMaxOccupancy(newValue);
                  }
                }}
                keyboardType="numeric"
                selectTextOnFocus={true}
              />
            </View>
          </View>
        </View>

        {/* Financial Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations Financières
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Loyer Mensuel (FCFA)
            </Text>
            <View style={styles.inputContainer}>
              <Icon name="attach-money" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={[styles.inputWithIcon, { 
                  borderColor: theme.colors.border, 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background 
                }]}
                placeholder="Ex: 50000"
                placeholderTextColor="#999"
                value={rent.toString()}
                onChangeText={text => {
                  const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
                  setRent(isNaN(numericValue) ? 0 : numericValue);
                }}
                keyboardType="numeric"
                selectTextOnFocus={true}
              />
            </View>
            <Text style={[styles.helperText, { color: "#999" }]}>
              Montant que l'étudiant paiera chaque mois
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Statut de la Chambre
          </Text>
          
          <View style={styles.statusGrid}>
            {[
              { key: 'available', label: 'Disponible', icon: 'check-circle', color: '#4CAF50' },
              { key: 'occupied', label: 'Occupée', icon: 'people', color: '#FF9800' },
              { key: 'complet', label: 'Complet (Pleine)', icon: 'people', color: '#F44336' }
            ].map((statusOption) => (
              <TouchableOpacity
                key={statusOption.key}
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: status === statusOption.key ? statusOption.color : theme.colors.background,
                    borderColor: status === statusOption.key ? statusOption.color : theme.colors.border,
                  }
                ]}
                onPress={() => setStatus(statusOption.key as Status)}
              >
                <Icon 
                  name={statusOption.icon as keyof typeof Icon.glyphMap} 
                  size={24} 
                  color={status === statusOption.key ? '#FFFFFF' : statusOption.color} 
                />
                <Text style={[
                  styles.statusCardText,
                  { color: status === statusOption.key ? '#FFFFFF' : theme.colors.text }
                ]}>
                  {statusOption.label}
                </Text>
                {status === statusOption.key && (
                  <Icon name="check" size={16} color="#FFFFFF" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.primaryButton, 
              { 
                backgroundColor: submitting ? "#999" : theme.colors.primary,
                opacity: submitting ? 0.7 : 1 
              }
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View style={styles.buttonContent}>
              {submitting && (
                <ActivityIndicator 
                  size="small" 
                  color="#FFFFFF" 
                  style={{ marginRight: 8 }} 
                />
              )}
              <Icon 
                name={submitting ? "hourglass-empty" : "save"} 
                size={20} 
                color="#FFFFFF" 
                style={{ marginRight: 8 }} 
              />
              <Text style={styles.buttonText}>
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={onCancel}
            disabled={submitting}
          >
            <Icon name="close" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputWithIcon: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 8,
  },
  inputIcon: {
    marginLeft: 12,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
    paddingBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
