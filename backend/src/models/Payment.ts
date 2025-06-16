import db from '../db/knex';

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  description: string;
  roomNumber?: string;
}

export async function getAllPayments(): Promise<Payment[]> {
  return db<Payment>('payments').select('*');
}

export async function getPaymentsByStudentId(studentId: number): Promise<Payment[]> {
  return db<Payment>('payments').where({ studentId }).select('*');
}

export async function getPaymentById(id: number): Promise<Payment | undefined> {
  return db<Payment>('payments').where({ id }).first();
}

export async function createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  const [created] = await db<Payment>('payments').insert(payment).returning('*');
  return created;
}

export async function updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined> {
  const [updated] = await db<Payment>('payments').where({ id }).update(payment).returning('*');
  return updated;
}

export async function deletePayment(id: number): Promise<void> {
  await db<Payment>('payments').where({ id }).del();
}
