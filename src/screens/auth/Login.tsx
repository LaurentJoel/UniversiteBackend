import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '@expo/vector-icons/MaterialIcons';

export default function Login(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to login with:', email);
      const success = await login(email, password);
      console.log('Login success:', success);
      
      if (!success) {
        Alert.alert('Erreur', 'Identifiants invalides');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Erreur de connexion', 
        'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };
  // Admin credentials are now seeded in the database

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Icon
              name={theme.dark ? 'light-mode' : 'dark-mode'}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Gestion des Chambres
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Système de Logement Universitaire
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.border, color: theme.colors.text },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.border}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.border, color: theme.colors.text },
              ]}
              placeholder="Mot de passe"
              placeholderTextColor={theme.colors.border}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Connexion en cours...' : 'Connexion'}
              </Text>            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  themeToggle: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButtons: {
    alignItems: 'center',
  },
  demoText: {
    fontSize: 16,
    marginBottom: 12,
  },
  demoButton: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    minWidth: 120,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
