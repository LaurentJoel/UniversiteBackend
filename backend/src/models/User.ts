import db = require('../db/knex');
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return db<User>('users').where({ email }).first();
}

export async function findUserByEmailFromBothTables(email: string): Promise<User | undefined> {
  // First check in users table (for admins)
  const adminUser = await db<User>('users').where({ email }).first();
  if (adminUser) {
    return adminUser;
  }
  
  // Then check in students table (for students)
  const student = await db('students').where({ email }).first();
  if (student) {
    // Transform student to match User interface
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      password: student.password,
      role: 'student' as const
    };
  }
  
  return undefined;
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const [created] = await db<User>('users').insert(user).returning('*');
  return created;
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
