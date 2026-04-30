import { db } from '../db';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'owner' | 'manager' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  created_at: Date;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>) {
  const { name, email, password, role } = userData;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password!, 10);
  
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  
  const values = [name, email, hashedPassword, role];
  const { rows } = await db.query(query, values);
  return rows[0] as User;
}

export async function findUserByEmail(email: string) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return (rows[0] as User) || null;
}

export async function findUserById(id: string) {
  const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return (rows[0] as User) || null;
}
