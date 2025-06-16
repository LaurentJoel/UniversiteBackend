import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '@expo/vector-icons/MaterialIcons';
import UserProfile from '../../components/UserProfile';
import apiService, { IApiService } from '../../services/apiService';

const { width } = Dimensions.get('window');

interface DashboardCardProps {
  title: string;
  icon: keyof typeof Icon.glyphMap;
  color: string;
  onPress: () => void;
  description: string;
  gradient?: boolean;
}

function DashboardCard({ title, icon, color, onPress, description, gradient }: DashboardCardProps): React.ReactElement {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.modernCard,
        { 
          backgroundColor: color,
          shadowColor: color,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Icon name={icon} size={28} color="#FFFFFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Icon name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
      </View>
    </TouchableOpacity>
  );
}

export default function Dashboard({ navigation }: { navigation: any }): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const [profileVisible, setProfileVisible] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalStudents: 0,
    pendingPayments: 0
  });  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Auto-refresh every 60 seconds (adjust as needed)
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh interval
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchDashboardData(false); // Silent refresh (no loading indicator)
    }, 60000); // 60 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Refresh data when the dashboard tab becomes focused
  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard focused, refreshing data...');
      fetchDashboardData(false);
      return () => {};
    }, [])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false).finally(() => setRefreshing(false));
  };
  
  const fetchDashboardData = async (showLoading: boolean = true): Promise<void> => {
    if (showLoading) setLoading(true);
    setError(undefined);
    try {
      // Fetch rooms, students, and payments in parallel from backend only
      const [rooms, students, payments] = await Promise.all([
        apiService.getRooms(),
        apiService.getStudents(),
        apiService.getPayments()
      ]);
      
      // Calculate dashboard statistics
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      
      setStats({
        totalRooms: rooms.length,
        totalStudents: students.length,
        pendingPayments
      });
      
      // Update last refreshed timestamp
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Échec du chargement des données du tableau de bord');
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  const dashboardItems = [
    {
      title: 'Gestion des Chambres',
      icon: 'room' as keyof typeof Icon.glyphMap,
      color: theme.colors.primary,
      description: 'Gérer les chambres, la disponibilité et les affectations',
      onPress: () => navigation.navigate('Rooms'),
    },
    {
      title: 'Gestion des Étudiants',
      icon: 'people' as keyof typeof Icon.glyphMap,
      color: theme.colors.secondary,
      description: 'Gérer les comptes et informations des étudiants',
      onPress: () => navigation.navigate('Students'),
    },
    {
      title: 'Gestion des Paiements',
      icon: 'payment' as keyof typeof Icon.glyphMap,
      color: '#FF5722',
      description: 'Gérer les paiements, factures et la facturation',
      onPress: () => navigation.navigate('Payments'),
    },
  ];
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    ><View style={styles.header}>        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Bienvenue</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Tableau de Bord Admin</Text>
        </View>
        <View style={styles.headerActions}>
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
      </View>

      <View style={styles.cardsContainer}>
        {dashboardItems.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            icon={item.icon}
            color={item.color}
            description={item.description}
            onPress={item.onPress}
          />
        ))}
      </View>      <View style={styles.quickStats}>        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aperçu Rapide</Text>
          <TouchableOpacity onPress={() => fetchDashboardData(true)} disabled={loading}>
            <Icon name="refresh" size={20} color={loading ? theme.colors.border : theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement des données...</Text>
          </View>
        ) : error ? (          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.notification }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchDashboardData(true)}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsRow}>            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Icon name="room" size={24} color={theme.colors.primary} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{stats.totalRooms}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text }]}>Chambres</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Icon name="people" size={24} color={theme.colors.secondary} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{stats.totalStudents}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text }]}>Étudiants</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <Icon name="payment" size={24} color="#FF5722" />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{stats.pendingPayments}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text }]}>En attente</Text>
            </View>
          </View>        )}
      </View>

      {/* Last updated timestamp */}
      <View style={styles.lastUpdatedContainer}>
        <Text style={[styles.lastUpdatedText, { color: theme.colors.border }]}>
          Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
        </Text>
      </View>

      <UserProfile 
        visible={profileVisible} 
        onClose={() => setProfileVisible(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  modernCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  quickStats: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },  
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  lastUpdatedContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
