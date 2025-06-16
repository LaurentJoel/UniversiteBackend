import db from '../db/knex';

export interface Student {
  id: number;
  name: string;
  email: string;
  password: string; // Password for student login
  matricule?: string;
  filiere?: string;
  niveau?: number;
  enrollmentDate?: string;
  roomId?: number;
  phone?: string;
  role?: 'admin' | 'student';
}

export async function getAllStudents(): Promise<Student[]> {
  return db<Student>('students').select('*');
}

export async function getStudentById(id: number): Promise<Student | undefined> {
  return db<Student>('students').where({ id }).first();
}

export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const [created] = await db<Student>('students').insert(student).returning('*');
  return created;
}

export async function updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined> {
  const [updated] = await db<Student>('students').where({ id }).update(student).returning('*');
  return updated;
}

export async function deleteStudent(id: number): Promise<void> {
  await db<Student>('students').where({ id }).del();
}

export async function getStudentsByRoomId(roomId: number): Promise<Student[]> {
  return db<Student>('students').where({ roomId }).select('*');
}
