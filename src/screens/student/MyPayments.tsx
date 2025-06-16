import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Payment, PaymentStatus, Student, Room } from '../../types';
import Icon from '@expo/vector-icons/MaterialIcons';
import UserProfile from '../../components/UserProfile';
import apiService, { IApiService } from '../../services/apiService';

export default function MyPayments(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileVisible, setProfileVisible] = useState<boolean>(false);
  const [payments, setPayments] = useState<Array<Payment>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [student, setStudent] = useState<Student | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState<boolean>(true);
  const [remainingRent, setRemainingRent] = useState<{
    totalRentDue: number;
    totalPaid: number;
    remainingRent: number;
    monthsStayed: number;
    roomRent: number;
  } | null>(null);
  const [rentLoading, setRentLoading] = useState<boolean>(false);    useEffect(() => {
    fetchStudentData();
    fetchPayments();
    fetchRemainingRent();
  }, []);
  
  const fetchStudentData = async (): Promise<void> => {
    if (!user?.id) return;
    
    setRoomLoading(true);
    try {
      console.log('Fetching student data for user ID:', user.id);
      // Get student information
      const studentData = await apiService.getStudentById(user.id);
      console.log('Student data received:', studentData);
      setStudent(studentData);
      
      // If student has a room, fetch room details
      if (studentData.roomId) {
        console.log('Student has roomId:', studentData.roomId);
        const roomData = await apiService.getRoomById(studentData.roomId);
        console.log('Room data received:', roomData);
        setRoom(roomData);
      } else {
        console.log('Student has no room assignment');
        setRoom(null);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch student data:', err);
      setError('Échec du chargement des informations de l\'étudiant.');
    } finally {
      setRoomLoading(false);
    }
  };
  
  const fetchPayments = async (): Promise<void> => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(undefined);
    try {      // Get payments for the current student
      const data = await apiService.getStudentPayments(user.id);
      setPayments(data);
    } catch (err: unknown) {
      console.error('Failed to fetch payments:', err);
      setError('Échec du chargement des informations de paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }};
  
  const fetchRemainingRent = async (): Promise<void> => {
    if (!user?.id) return;
    
    setRentLoading(true);
    try {
      const data = await apiService.getStudentRemainingRent(user.id);
      setRemainingRent(data);
    } catch (err: unknown) {
      console.error('Failed to fetch remaining rent:', err);
    } finally {
      setRentLoading(false);
    }
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'paid':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.secondary;
      case 'overdue':
        return '#F44336';
      case 'cancelled':
        return '#9E9E9E';
      default:
        return theme.colors.text;
    }
  };  const getStatusIcon = (status: PaymentStatus): keyof typeof Icon.glyphMap => {
    switch (status) {
      case 'paid':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  };  const getTotalAmount = (): number => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };
  const getPaidAmount = (): number => {
    return payments
      .filter(payment => payment.status === 'paid')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getPendingAmount = (): number => {
    return payments
      .filter(payment => payment.status === 'pending')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getOverdueAmount = (): number => {
    return payments
      .filter(payment => payment.status === 'overdue')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };  const renderPaymentItem = ({ item }: { item: Payment }): React.ReactElement => (
    <View style={[styles.paymentCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.paymentHeader}>
        <Text style={[styles.amount, { color: theme.colors.text }]}>{item.amount} FCFA</Text>
        <View style={styles.statusContainer}>
          <Icon name={getStatusIcon(item.status)} size={20} color={getStatusColor(item.status)} />
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status === 'paid' ? 'Payé' : 
             item.status === 'pending' ? 'En attente' : 
             item.status === 'overdue' ? 'En retard' : 
             item.status === 'cancelled' ? 'Annulé' : item.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.description, { color: theme.colors.text }]}>
        {item.description}
      </Text>
      <View style={styles.paymentDates}>
        <Text style={[styles.detail, { color: theme.colors.text }]}>
          Échéance: {formatDate(item.dueDate)}
        </Text>
        {item.paidDate && (
          <Text style={[styles.detail, { color: theme.colors.text }]}>
            Payé le: {formatDate(item.paidDate)}
          </Text>
        )}
      </View>
    </View>
  );
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
      </View>      <Text style={[styles.title, { color: theme.colors.text }]}>Mes Paiements</Text>
      
      {/* Room Rent Information */}
      {roomLoading ? (
        <View style={[styles.roomRentCard, { backgroundColor: theme.colors.card }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.roomRentLoading, { color: theme.colors.text }]}>
            Chargement des informations de chambre...
          </Text>
        </View>
      ) : room ? (
        <View style={[styles.roomRentCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.roomRentHeader}>
            <Icon name="home" size={32} color="#FFFFFF" />
            <View style={styles.roomRentInfo}>
              <Text style={styles.roomRentTitle}>Loyer Mensuel - Chambre {room.number}</Text>
              <Text style={styles.roomRentSubtitle}>
                {room.type} • Étage {room.floor || 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.roomRentAmountContainer}>
            <Text style={styles.roomRentAmount}>
              {room.rent ? `${room.rent} FCFA` : 'Montant non défini'}
            </Text>
            <Text style={styles.roomRentPeriod}>par mois</Text>
          </View>
          {room.rent && (
            <View style={styles.roomRentDetails}>
              <Text style={styles.roomRentDetailText}>
                💡 Ce montant doit être payé chaque mois pour votre chambre
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.roomRentCard, { backgroundColor: '#FF9800' }]}>
          <View style={styles.roomRentHeader}>
            <Icon name="warning" size={32} color="#FFFFFF" />
            <View style={styles.roomRentInfo}>
              <Text style={styles.roomRentTitle}>Aucune chambre assignée</Text>
              <Text style={styles.roomRentSubtitle}>
                Veuillez contacter l'administration
              </Text>
            </View>
          </View>
        </View>
      )}        {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.summaryLabel}>Total Payé</Text>
          <Text style={styles.summaryAmount}>{getPaidAmount()} FCFA</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.secondary }]}>
          <Text style={styles.summaryLabel}>En Attente</Text>
          <Text style={styles.summaryAmount}>{getPendingAmount()} FCFA</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#F44336' }]}>
          <Text style={styles.summaryLabel}>En Retard</Text>
          <Text style={styles.summaryAmount}>{getOverdueAmount()} FCFA</Text>
        </View>
        {remainingRent && (
          <View style={[styles.summaryCard, { backgroundColor: '#FF9800' }]}>
            <Text style={styles.summaryLabel}>Reste à Payer</Text>
            <Text style={styles.summaryAmount}>{remainingRent.remainingRent} FCFA</Text>
          </View>        )}
      </View>

      {/* Rent Breakdown */}
      {remainingRent && (
        <View style={[styles.rentBreakdownCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.rentBreakdownHeader}>
            <Icon name="analytics" size={24} color={theme.colors.primary} />
            <Text style={[styles.rentBreakdownTitle, { color: theme.colors.text }]}>
              Détail de votre Loyer
            </Text>
          </View>
          <View style={styles.rentBreakdownContent}>
            <View style={styles.rentBreakdownRow}>
              <Text style={[styles.rentBreakdownLabel, { color: theme.colors.text }]}>
                Loyer mensuel:
              </Text>
              <Text style={[styles.rentBreakdownValue, { color: theme.colors.text }]}>
                {remainingRent.roomRent} FCFA
              </Text>
            </View>
            <View style={styles.rentBreakdownRow}>
              <Text style={[styles.rentBreakdownLabel, { color: theme.colors.text }]}>
                Mois occupés:
              </Text>
              <Text style={[styles.rentBreakdownValue, { color: theme.colors.text }]}>
                {remainingRent.monthsStayed} mois
              </Text>
            </View>
            <View style={styles.rentBreakdownRow}>
              <Text style={[styles.rentBreakdownLabel, { color: theme.colors.text }]}>
                Total dû:
              </Text>
              <Text style={[styles.rentBreakdownValue, { color: theme.colors.text }]}>
                {remainingRent.totalRentDue} FCFA
              </Text>
            </View>
            <View style={styles.rentBreakdownRow}>
              <Text style={[styles.rentBreakdownLabel, { color: theme.colors.text }]}>
                Total payé:
              </Text>
              <Text style={[styles.rentBreakdownValue, { color: theme.colors.primary }]}>
                {remainingRent.totalPaid} FCFA
              </Text>
            </View>
            <View style={[styles.rentBreakdownRow, styles.rentBreakdownTotal]}>
              <Text style={[styles.rentBreakdownLabel, styles.rentBreakdownTotalLabel]}>
                Reste à payer:
              </Text>
              <Text style={[styles.rentBreakdownValue, styles.rentBreakdownTotalValue]}>
                {remainingRent.remainingRent} FCFA
              </Text>
            </View>
          </View>
        </View>
      )}

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: '#FFEBEE' }]}>
          <Icon name="error" size={24} color="#F44336" />
          <Text style={[styles.errorText, { color: '#F44336' }]}>{error}</Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Historique des Paiements</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des paiements...
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderPaymentItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="receipt" size={48} color={theme.colors.text} style={{ opacity: 0.3 }} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Aucun paiement trouvé.
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
                Vos paiements apparaîtront ici une fois effectués.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },  headerButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  paymentDates: {
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  // Room rent styles
  roomRentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  roomRentLoading: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  roomRentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomRentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomRentTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roomRentSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  roomRentAmountContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  roomRentAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roomRentPeriod: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 4,
  },
  roomRentDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  roomRentDetailText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Additional styles for enhanced UI
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  // Rent Breakdown Styles
  rentBreakdownCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rentBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rentBreakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  rentBreakdownContent: {
    gap: 12,
  },
  rentBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rentBreakdownLabel: {
    fontSize: 16,
    flex: 1,
  },
  rentBreakdownValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  rentBreakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    marginTop: 8,
  },
  rentBreakdownTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  rentBreakdownTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
  },
});
