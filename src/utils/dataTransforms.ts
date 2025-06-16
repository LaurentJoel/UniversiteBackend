// Data transformation utilities for backend/frontend integration
import { Room, Student, Payment } from '../types';

// Transform backend room data to frontend format
export function transformBackendRoom(backendRoom: any): Room {
  // Handle null or undefined input
  if (!backendRoom) {
    console.warn('Received null or undefined backendRoom in transformBackendRoom');
    return {
      id: '0',
      number: 'Unknown',
      type: 'Unknown',
      status: 'available',
      floor: 0,
      rent: 0,
    };
  }
  
  return {
    id: backendRoom.id?.toString() || backendRoom.idChambre?.toString() || '0',
    number: backendRoom.number || backendRoom.Code || 'Unknown',
    type: backendRoom.type || `Floor ${backendRoom.floor || backendRoom.Etage || 0}`,
    status: mapBackendStatusToFrontend(backendRoom.status || backendRoom.Statut),
    occupantCount: backendRoom.occupantCount || 0,
    maxOccupancy: backendRoom.maxOccupancy || 2,
    canAddOccupant: backendRoom.canAddOccupant ?? true,
    occupants: Array.isArray(backendRoom.occupants) ? backendRoom.occupants.map(transformBackendStudent) : [],
    floor: backendRoom.floor || backendRoom.Etage || 0,
    rent: backendRoom.rent || 30000,
  };
}

// Transform backend student data to frontend format
export function transformBackendStudent(backendStudent: any): Student {
  console.log('Raw backend student:', backendStudent);
  console.log('backendStudent.id:', backendStudent.id);
  console.log('backendStudent.name:', backendStudent.name);
  console.log('backendStudent.roomId:', backendStudent.roomId);
  
  const transformed = {
    id: backendStudent.id?.toString() || backendStudent.idEtudiant?.toString(),
    name: backendStudent.name || backendStudent.Nom,
    email: backendStudent.email || `${backendStudent.Matricule?.toLowerCase() || 'student'}@university.edu`,
    matricule: backendStudent.matricule || backendStudent.Matricule,
    filiere: backendStudent.filiere || backendStudent.Filiere,
    niveau: backendStudent.niveau || backendStudent.Niveau,
    enrollmentDate: backendStudent.enrollmentDate || backendStudent.DateEntree,
    roomId: backendStudent.roomId?.toString() || backendStudent.idChambre?.toString(),
    roomNumber: backendStudent.roomNumber || backendStudent.chambre?.Code,
    floor: backendStudent.floor || backendStudent.chambre?.Etage,
    phone: backendStudent.phone,
    role: backendStudent.role || 'student',
  };
  
  console.log('Transformed student:', transformed);
  return transformed;
}

// Transform backend payment data to frontend format
export function transformBackendPayment(backendPayment: any): Payment {
  console.log('🔄 Transforming backend payment:', backendPayment);
  
  const transformed = {
    id: backendPayment.id?.toString(),
    studentId: backendPayment.studentId?.toString(),
    studentName: backendPayment.studentName || backendPayment.student_name || backendPayment.name || 'Étudiant inconnu',
    amount: backendPayment.amount,
    dueDate: backendPayment.dueDate || backendPayment.due_date,
    paidDate: backendPayment.paidDate || backendPayment.paid_date,
    status: backendPayment.status || 'pending',
    description: backendPayment.description || 'Paiement',
    roomNumber: backendPayment.roomNumber || backendPayment.room_number,
  };
  
  console.log('✅ Transformed payment result:', transformed);
  return transformed;
}

// Transform frontend room data to backend format
export function transformFrontendRoom(frontendRoom: Partial<Room>): any {
  return {
    number: frontendRoom.number,
    type: frontendRoom.type,
    status: frontendRoom.status, // should be 'available', 'occupied', or 'complet'
    floor: frontendRoom.floor ?? 0,
    maxOccupancy: frontendRoom.maxOccupancy ?? 1,
    rent: frontendRoom.rent ?? 0,
    // occupantCount is calculated automatically by the backend based on assigned students
  };
}

// Transform frontend student data to backend format
export function transformFrontendStudent(frontendStudent: Partial<Student>): any {
  // Create a student object that matches the database schema exactly
  const backendStudent: any = {
    name: frontendStudent.name,
    email: frontendStudent.email,
    password: frontendStudent.password, // Include password for backend
    matricule: frontendStudent.matricule || frontendStudent.email?.split('@')[0]?.toUpperCase(),
    filiere: frontendStudent.filiere || 'INFO',
    niveau: frontendStudent.niveau || 1,
    enrollmentDate: frontendStudent.enrollmentDate || new Date().toISOString().split('T')[0],
    role: frontendStudent.role || 'student',
  };

  // Add optional fields only if they exist
  if (frontendStudent.roomId) {
    backendStudent.roomId = frontendStudent.roomId;
  }
  
  if (frontendStudent.phone) {
    backendStudent.phone = frontendStudent.phone;
  }

  return backendStudent;
}

// Map backend status to frontend status
function mapBackendStatusToFrontend(backendStatus: string): 'available' | 'occupied' | 'complet' {
  const statusMap: Record<string, 'available' | 'occupied' | 'complet'> = {
    'libre': 'available',
    'occupée': 'occupied',
    'bloquée': 'complet',
  };
  return statusMap[backendStatus] || 'available';
}

// Map frontend status to backend status
function mapFrontendStatusToBackend(frontendStatus?: string): string {
  const statusMap: Record<string, string> = {
    'available': 'libre',
    'occupied': 'occupée',
    'complet': 'bloquée',
  };
  return statusMap[frontendStatus || 'available'] || 'libre';
}

// Generate demo data if backend is not available
export function generateDemoRooms(): Room[] {  const rooms: Room[] = [];
  for (let floor = 0; floor <= 4; floor++) {
    for (let i = 1; i <= 13; i++) {
      const roomNumber = `${floor}A${i.toString().padStart(2, '0')}`;
      rooms.push({
        id: `${floor * 100 + i}`,
        number: roomNumber,
        type: `Floor ${floor}`,
        status: Math.random() > 0.7 ? 'occupied' : Math.random() > 0.9 ? 'complet' : 'available',
        occupantCount: Math.floor(Math.random() * 3),
        maxOccupancy: 2,
        canAddOccupant: true,
        floor,
        rent: 30000,
      });
    }
  }
  return rooms;
}

export function generateDemoStudents(): Student[] {
  const students: Student[] = [];
  const names = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Bernard', 'Luc Moreau'];
  
  for (let i = 0; i < names.length; i++) {
    students.push({
      id: (i + 1).toString(),
      name: names[i],
      email: `student${i + 1}@university.edu`,
      matricule: `ST${(i + 1).toString().padStart(3, '0')}`,
      filiere: ['INFO', 'GESTION', 'COMPTA'][i % 3],
      niveau: Math.floor(Math.random() * 4) + 1,
      enrollmentDate: '2024-09-15',
      roomId: i < 3 ? (i + 1).toString() : undefined,
      roomNumber: i < 3 ? `0A${(i + 1).toString().padStart(2, '0')}` : undefined,
      floor: i < 3 ? 0 : undefined,
      role: i === 0 ? 'admin' : 'student', // First student is admin, others are students
    });
  }
  
  return students;
}
