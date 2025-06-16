export type Status = 'available' | 'occupied' | 'complet';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Room {
  id: string;
  number: string;
  type: string;
  status: Status;
  occupantId?: string;
  occupantCount?: number;
  maxOccupancy?: number;
  canAddOccupant?: boolean;
  occupants?: Student[];
  floor?: number;
  rent?: number;
  capacity?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string; // Password for student login
  matricule?: string;
  filiere?: string;
  niveau?: number;
  enrollmentDate?: string;
  roomId?: string;
  roomNumber?: string;
  floor?: number;
  phone?: string;
  
  // UI-only fields (not stored in the database)
  role?: 'admin' | 'student'; // Used for UI purposes only, not stored in the students table
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: 'admin' | 'student';
  phone?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  employeeId?: string;
  studentId?: string;
  roomNumber?: string;
  enrollmentDate?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  description: string;
  roomNumber?: string;
}
