import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { Payment, PaymentStatus, Student, Room } from '../../types';
import Icon from '@expo/vector-icons/MaterialIcons';
import UserProfile from '../../components/UserProfile';
import apiService, { IApiService } from '../../services/apiService';

interface PaymentCardProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

function PaymentCard({ payment, onEdit, onDelete }: PaymentCardProps) {
  const { theme } = useTheme();

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'overdue': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return theme.colors.text;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <View style={[styles.paymentCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.studentName, { color: theme.colors.text }]}>
            {payment.studentName || 'Étudiant inconnu'}
          </Text>
          {payment.roomNumber && (
            <Text style={[styles.roomNumber, { color: theme.colors.text }]}>
              Chambre: {payment.roomNumber}
            </Text>
          )}
        </View>
        <View style={styles.paymentAmount}>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            {typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(payment.amount || '0').toFixed(2)} €
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
            <Text style={styles.statusText}>
              {payment.status === 'paid' ? 'PAYÉ' :
               payment.status === 'pending' ? 'EN ATTENTE' :
               payment.status === 'overdue' ? 'EN RETARD' :
               payment.status === 'cancelled' ? 'ANNULÉ' : String(payment.status).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.description, { color: theme.colors.text }]}>
        {payment.description}
      </Text>

      <View style={styles.paymentDates}>
        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          Échéance: {formatDate(payment.dueDate)}
        </Text>
        {payment.paidDate && (
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            Payé le: {formatDate(payment.paidDate)}
          </Text>
        )}
      </View>

      <View style={styles.paymentActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onEdit(payment)}
        >
          <Icon name="edit" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9E9E9E' }]}
          onPress={() => onDelete(payment.id)}
        >
          <Icon name="delete" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Payments() {
  console.log('🔵 Payments component starting to render...');
  
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [profileVisible, setProfileVisible] = useState(false);
  const [payments, setPayments] = useState<Array<Payment>>([]);
  const [students, setStudents] = useState<Array<Student>>([]);
  const [rooms, setRooms] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  
  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  useEffect(() => {
    fetchData();
    // Set default due date to today
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
  }, []);  const fetchData = async () => {
    console.log('💰 Fetching payments data...');
    setLoading(true);
    setError(undefined);
    try {
      const [paymentsData, studentsData, roomsData] = await Promise.all([
        apiService.getPayments(),
        apiService.getStudents(),
        apiService.getRooms()
      ]);
      console.log('✅ Payments data fetched successfully:', {
        payments: paymentsData.length,
        students: studentsData.length,
        rooms: roomsData.length
      });
      
      // Debug payments data to see student names
      paymentsData.forEach((payment, index) => {
        console.log(`💳 Payment ${index + 1}:`, {
          id: payment.id,
          studentId: payment.studentId,
          studentName: payment.studentName,
          amount: payment.amount,
          status: payment.status
        });
      });
      
      setPayments(paymentsData);
      setStudents(studentsData);
      setRooms(roomsData);
    } catch (err: unknown) {
      console.error('❌ Error fetching payments data:', err);
      setError('Échec du chargement des données. Veuillez réessayer.');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec du chargement des données.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      console.log('🏁 Payments data fetch completed');
      setLoading(false);
    }
  };
  
  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter((payment) => payment.status === filter);  const handleAddPayment = async () => {
    // Validation
    if (!selectedStudentId.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez sélectionner un étudiant.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer un montant valide (supérieur à 0).',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    if (!description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer une description.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    if (!dueDate.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer une date d\'échéance.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    // Validate date format (basic validation)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Format de date invalide. Utilisez AAAA-MM-JJ.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Étudiant non trouvé.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }    // Get selected room information
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    const roomNumber = selectedRoom ? selectedRoom.number : student.roomNumber;
    
    // Find the actual room for the student to get rent information
    const studentRoom = selectedRoom || rooms.find(r => r.number === student.roomNumber);
    
    // Calculate automatic payment status based on room rent and amount
    const paymentAmount = parseFloat(amount);
    const automaticStatus = calculatePaymentStatus(paymentAmount, studentRoom, dueDate);

    // Close modal immediately for better UX
    setModalVisible(false);
    resetForm();    try {
      console.log('💰 Creating new payment for student:', student.name);
      console.log('🔍 Student data:', { id: student.id, name: student.name, email: student.email });
      console.log('🏠 Room rent:', studentRoom?.rent, 'Payment amount:', paymentAmount, 'Auto status:', automaticStatus);      const newPayment: Omit<Payment, 'id'> = {
        studentId: selectedStudentId,
        studentName: student.name,
        amount: paymentAmount,
        dueDate,
        status: automaticStatus,
        description,
        roomNumber: roomNumber,
        // Set paid date to today only if payment status is 'paid'
        paidDate: automaticStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined
      };
      
      console.log('📝 New payment object:', newPayment);

      const createdPayment = await apiService.createPayment(newPayment);
      console.log('✅ Payment created successfully:', createdPayment);
      
      // Update payments state immediately
      setPayments(prevPayments => [...prevPayments, createdPayment]);
      
      Toast.show({
        type: 'success',
        text1: 'Paiement Créé',
        text2: `Paiement de ${parseFloat(amount).toFixed(2)} € créé pour ${student.name}.`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (err: unknown) {
      console.error('Error creating payment:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la création du paiement.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  };
  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setSelectedStudentId(payment.studentId);
    setAmount(payment.amount.toString());
    setDescription(payment.description);
    setDueDate(payment.dueDate);
    
    // Set the room ID based on the student's current room or payment's room
    const student = students.find(s => s.id === payment.studentId);
    if (student && student.roomNumber) {
      const room = rooms.find(r => r.number === student.roomNumber);
      if (room) {
        setSelectedRoomId(room.id);
      }
    } else if (payment.roomNumber) {
      const room = rooms.find(r => r.number === payment.roomNumber);
      if (room) {
        setSelectedRoomId(room.id);
      }
    }
    
    setModalVisible(true);
  };const handleUpdatePayment = async () => {
    console.log('🔥 handleUpdatePayment called!');
    console.log('🔄 editingPayment:', editingPayment);
    console.log('📝 Form state values:', { 
      selectedStudentId, 
      amount, 
      description, 
      dueDate,
      selectedRoomId 
    });
    
    if (!editingPayment) {
      console.log('❌ No editingPayment found');
      return;
    }
    
    // Validation with detailed debugging
    console.log('✅ Starting validation...');
    
    if (!selectedStudentId.trim()) {
      console.log('❌ Validation failed: No student selected');
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez sélectionner un étudiant.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    console.log('✅ Student validation passed');

    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.log('❌ Validation failed: Invalid amount:', amount);
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer un montant valide (supérieur à 0).',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    console.log('✅ Amount validation passed');

    if (!description.trim()) {
      console.log('❌ Validation failed: No description:', description);
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer une description.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    console.log('✅ Description validation passed');

    if (!dueDate.trim()) {
      console.log('❌ Validation failed: No due date:', dueDate);
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Veuillez entrer une date d\'échéance.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    console.log('✅ Due date exists, checking format...');

    // Fix date format - handle both YYYY-MM-DD and ISO format
    let formattedDueDate = dueDate;
    if (dueDate.includes('T')) {
      // It's in ISO format, extract just the date part
      formattedDueDate = dueDate.split('T')[0];
    }
    console.log('📅 Date handling - Original:', dueDate, 'Formatted:', formattedDueDate);

    // Validate date format (basic validation)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formattedDueDate)) {
      console.log('❌ Validation failed: Invalid date format:', formattedDueDate);
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: 'Format de date invalide. Utilisez AAAA-MM-JJ.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }
    console.log('✅ Date format validation passed');
    
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Étudiant non trouvé.',
        position: 'bottom',
        visibilityTime: 4000,
      });
      return;
    }

    // Get selected room information
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    const roomNumber = selectedRoom ? selectedRoom.number : student.roomNumber;
    
    // Find the actual room for the student to get rent information
    const studentRoom = selectedRoom || rooms.find(r => r.number === student.roomNumber);
      // Calculate automatic payment status based on room rent and amount
    const paymentAmount = parseFloat(amount);
    const automaticStatus = calculatePaymentStatus(paymentAmount, studentRoom, dueDate);    try {
      console.log('🔄 Updating payment:', editingPayment.id);
      console.log('📝 Form values:', { selectedStudentId, amount, description, dueDate });
      console.log('🏠 Room rent:', studentRoom?.rent, 'Payment amount:', paymentAmount, 'Auto status:', automaticStatus);

      // Always set paid date to current date when updating payment (as requested)
      const currentDate = new Date().toISOString().split('T')[0];
      
      const updatedPayment: Partial<Payment> = {
        studentId: selectedStudentId,
        studentName: student.name,
        amount: paymentAmount,
        description,
        dueDate: formattedDueDate, // Use formatted date
        roomNumber: roomNumber,
        status: automaticStatus,
        paidDate: currentDate // Always set to current date when updating
      };

      console.log('📤 Sending payment update data:', updatedPayment);
      const updated = await apiService.updatePayment(editingPayment.id, updatedPayment);
      console.log('✅ Payment updated successfully:', updated);
        // Update payments state immediately
      setPayments(prevPayments => 
        prevPayments.map(p => p.id === editingPayment.id ? { ...p, ...updatedPayment } : p)
      );

      // Close modal after successful update
      setModalVisible(false);
      setEditingPayment(null);
      resetForm();

      Toast.show({
        type: 'success',
        text1: 'Paiement Mis à Jour',
        text2: 'Paiement mis à jour avec succès.',
        position: 'bottom',
        visibilityTime: 4000,
      });    } catch (err: unknown) {
      console.error('❌ Error updating payment:', err);
      
      // Show more detailed error information
      let errorMessage = 'Échec de la mise à jour du paiement.';
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        errorMessage = `Erreur: ${err.message}`;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 4000,
      });
    }
  };  const handleDeletePayment = async (id: string) => {
    // Set the payment to delete and show custom modal
    setPaymentToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      console.log('🗑️ Deleting payment:', paymentToDelete);
      await apiService.deletePayment(paymentToDelete);
      
      // Update payments state immediately
      setPayments(prevPayments => prevPayments.filter(p => p.id !== paymentToDelete));
      
      Toast.show({
        type: 'success',
        text1: 'Paiement Supprimé',
        text2: 'Paiement supprimé avec succès.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (err: unknown) {
      console.error('Error deleting payment:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la suppression du paiement.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setDeleteModalVisible(false);
      setPaymentToDelete(null);
    }
  };// Function to calculate automatic payment status based on room rent
  const calculatePaymentStatus = (paymentAmount: number, room: Room | undefined, dueDate: string): PaymentStatus => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    
    // If payment is overdue (past due date), mark as overdue
    if (dueDateObj < today) {
      return 'overdue';
    }
    
    // If room has rent defined and payment amount covers it fully, mark as paid
    if (room?.rent && paymentAmount >= room.rent) {
      return 'paid';
    }
    
    // Otherwise, mark as pending
    return 'pending';
  };

  const resetForm = () => {
    setSelectedStudentId('');
    setSelectedRoomId('');
    setAmount('');
    setDescription('');
    setDueDate('');  };
  console.log('🔵 Payments component about to return JSX...');
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setProfileVisible(true)} style={[styles.headerButton, { backgroundColor: theme.colors.card }]}>
          <Icon name="person" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={[styles.headerButton, { backgroundColor: theme.colors.card }]}>
          <Icon
            name={theme.dark ? 'light-mode' : 'dark-mode'}            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={[styles.headerButton, { backgroundColor: theme.colors.card }]}>
          <Icon name="logout" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Gestion des Paiements</Text>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={theme.colors.notification} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.filterContainer}>
            {(['all', 'pending', 'paid', 'overdue', 'cancelled'] as (PaymentStatus | 'all')[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filter === status ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setFilter(status)}
              >
                <Text style={[
                  styles.filterText, 
                  filter === status ? { color: '#FFFFFF' } : { color: theme.colors.text }
                ]}>
                  {status === 'all' ? 'Tous' :
                   status === 'pending' ? 'En attente' :
                   status === 'paid' ? 'Payés' :
                   status === 'overdue' ? 'En retard' :
                   status === 'cancelled' ? 'Annulés' : status}
                </Text>
              </TouchableOpacity>
            ))}          </View>
          <FlatList
            data={filteredPayments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PaymentCard
                payment={item}
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
              />
            )}
            refreshing={loading}
            onRefresh={fetchData}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Aucun paiement trouvé.
              </Text>
            }
            contentContainerStyle={styles.listContainer}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Modal visible={modalVisible} animationType="fade" transparent>
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    {editingPayment ? 'Modifier le Paiement' : 'Ajouter un Nouveau Paiement'}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setModalVisible(false);
                      setEditingPayment(null);
                      resetForm();
                    }}
                  >
                    <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.modalScrollView}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.formSection}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Étudiant *</Text>                    <View style={[styles.pickerContainer, {                      borderColor: theme.colors.primary,
                      backgroundColor: '#FFFFFF'
                    }]}>
                      <Picker
                        selectedValue={selectedStudentId}
                        onValueChange={setSelectedStudentId}
                        style={[styles.picker, { color: '#000000' }]}
                        dropdownIconColor="#000000"
                        mode="dropdown"
                      >
                        <Picker.Item label="Sélectionner un étudiant" value="" color="#000000" />
                        {students.map((student) => (
                          <Picker.Item 
                            key={student.id} 
                            label={`${student.name} (${student.matricule})`} 
                            value={student.id}
                            color="#000000"
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Chambre</Text>                    <View style={[styles.pickerContainer, { 
                      borderColor: theme.colors.primary,
                      backgroundColor: '#FFFFFF'
                    }]}>
                      <Picker
                        selectedValue={selectedRoomId}
                        onValueChange={setSelectedRoomId}
                        style={[styles.picker, { color: '#000000' }]}
                        dropdownIconColor="#000000"
                        mode="dropdown"
                      >
                        <Picker.Item label="Utiliser la chambre de l'étudiant" value="" color="#000000" />
                        {rooms.map((room) => (
                          <Picker.Item 
                            key={room.id} 
                            label={`Chambre ${room.number} - ${room.type} (${room.capacity} places)`} 
                            value={room.id}
                            color="#000000"
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>                  <View style={styles.formSection}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Montant (€) *</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.border}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                    />
                    <Text style={[styles.helpText, { color: theme.colors.border }]}>
                      💡 Le statut sera calculé automatiquement : si le montant couvre le loyer de la chambre, le paiement sera marqué comme "PAYÉ", sinon "EN ATTENTE".
                    </Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Description *</Text>
                    <TextInput
                      style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
                      placeholder="Ex: Frais de logement, électricité, etc."
                      placeholderTextColor={theme.colors.border}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formSection}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Date d'échéance *</Text>
                    <TextInput
                      style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
                      placeholder="AAAA-MM-JJ (ex: 2025-12-31)"
                      placeholderTextColor={theme.colors.border}
                      value={dueDate}
                      onChangeText={setDueDate}
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                      onPress={editingPayment ? handleUpdatePayment : handleAddPayment}
                    >
                      <Text style={styles.modalButtonText}>
                        {editingPayment ? 'Mettre à jour' : 'Ajouter'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.secondaryButton, { backgroundColor: theme.colors.border }]}
                      onPress={() => {
                        setModalVisible(false);
                        setEditingPayment(null);
                        resetForm();
                      }}
                    >
                      <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal visible={deleteModalVisible} animationType="fade" transparent>
            <View style={styles.modalContainer}>
              <View style={[styles.deleteModalContent, { backgroundColor: theme.colors.card }]}>
                <View style={styles.deleteModalHeader}>
                  <Icon name="warning" size={48} color="#F44336" />
                  <Text style={[styles.deleteModalTitle, { color: theme.colors.text }]}>
                    Supprimer le Paiement
                  </Text>
                  <Text style={[styles.deleteModalText, { color: theme.colors.text }]}>
                    Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.
                  </Text>
                </View>
                
                <View style={styles.deleteModalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.secondaryButton, { backgroundColor: theme.colors.border }]}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setPaymentToDelete(null);
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Annuler</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                    onPress={confirmDeletePayment}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <UserProfile
            visible={profileVisible} 
            onClose={() => setProfileVisible(false)} 
          />        </>
      )}    </View>
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
  },  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 100,
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
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 14,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  paymentDates: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    marginBottom: 2,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    opacity: 0.7,
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
  },  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '90%',
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 500,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },  pickerContainer: {
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  studentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  studentOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  studentOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  primaryButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
  },  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Delete Modal Styles
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalHeader: {
    alignItems: 'center',
    padding: 24,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  deleteModalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
