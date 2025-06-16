// Mocks for testing when backend is unavailable or slow
import { Room, Student, Payment } from '../types';

export const generateMockRooms = (): Room[] => {
  const rooms: Room[] = [];
  for (let floor = 0; floor <= 4; floor++) {
    for (let i = 1; i <= 8; i++) {
      const roomNumber = `${floor}${String.fromCharCode(65 + Math.floor(i / 4))}${i % 4 + 1}`;
      const occupantCount = Math.floor(Math.random() * 3);      rooms.push({
        id: `${floor * 100 + i}`,
        number: roomNumber,
        type: `Floor ${floor}`,
        status: occupantCount === 0 ? 'available' : occupantCount === 1 ? 'occupied' : 'complet',
        occupantCount,
        maxOccupancy: 2,
        canAddOccupant: occupantCount < 2,
        floor,
        rent: 30000,
      });
    }
  }
  return rooms;
};

export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  const names = [
    'Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Bernard', 
    'Luc Moreau', 'Émilie Richard', 'Thomas Petit', 'Julie Robert', 
    'Nicolas Michel', 'Laura Simon'
  ];
  
  for (let i = 0; i < names.length; i++) {
    const firstName = names[i].split(' ')[0];
    const lastName = names[i].split(' ')[1];
    students.push({
      id: (i + 1).toString(),
      name: names[i],
      email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@university.edu`,
      matricule: `ST${(i + 1).toString().padStart(3, '0')}`,
      filiere: ['INFO', 'GESTION', 'COMPTA', 'DROIT', 'MED'][i % 5],
      niveau: (i % 4) + 1,
      enrollmentDate: '2024-09-15',
      roomId: i < 6 ? (i + 1).toString() : undefined,
      roomNumber: i < 6 ? `0A${(i + 1).toString().padStart(2, '0')}` : undefined,
      floor: i < 6 ? 0 : undefined,
      phone: `+237 ${Math.floor(100000000 + Math.random() * 900000000)}`,
    });
  }
  
  return students;
};

export const generateMockPayments = (): Payment[] => {
  const payments: Payment[] = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  
  for (let studentId = 1; studentId <= 5; studentId++) {
    for (let i = 0; i < months.length; i++) {
      const isPaid = i < 3; // First 3 months are paid
      const isOverdue = i === 3; // 4th month is overdue
      const year = 2025;
      
      payments.push({
        id: `${studentId}-${i}`,
        studentId: studentId.toString(),
        studentName: generateMockStudents()[studentId - 1].name,
        amount: 30000,
        dueDate: `${year}-${(i + 1).toString().padStart(2, '0')}-15`,
        paidDate: isPaid ? `${year}-${(i + 1).toString().padStart(2, '0')}-10` : undefined,
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
        description: `Monthly Rent - ${months[i]} ${year}`,
        roomNumber: generateMockStudents()[studentId - 1].roomNumber,
      });
    }
  }
  
  return payments;
};
