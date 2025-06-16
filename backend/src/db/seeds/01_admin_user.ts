import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

export async function seed(knex: Knex): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(adminPassword, 10);

  await knex('users').insert({
    name: 'Admin',
    email: adminEmail,
    password: hash,
    role: 'admin',
  }).onConflict('email').ignore();
}
