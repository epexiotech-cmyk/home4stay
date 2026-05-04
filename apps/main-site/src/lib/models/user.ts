import { db } from '../server/db';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'owner' | 'manager' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  city?: string;
  image_url?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  created_at: Date;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>) {
  const { name, email, password, role, phone } = userData;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password!, 10);
  
  const query = `
    INSERT INTO users (name, email, password, role, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, role, phone, created_at
  `;
  
  const values = [name, email, hashedPassword, role, phone];
  const { rows } = await db.query(query, values);
  return rows[0] as User;
}

export async function findUserByEmail(email: string) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return (rows[0] as User) || null;
}

export async function findUserById(id: string) {
  const query = 'SELECT id, name, email, role, phone, city, image_url, created_at, password FROM users WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return (rows[0] as User) || null;
}

export async function updateUser(id: string, data: Partial<User>) {
  const fields = Object.keys(data).filter(key => ['name', 'phone', 'city', 'image_url'].includes(key));
  if (fields.length === 0) return null;

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = fields.map(field => data[field as keyof User]);

  const query = `
    UPDATE users 
    SET ${setClause} 
    WHERE id = $1 
    RETURNING id, name, email, role, phone, city, image_url, created_at
  `;

  const { rows } = await db.query(query, [id, ...values]);
  return rows[0] as User;
}

export async function setResetToken(email: string, token: string, expires: Date, ip?: string, userAgent?: string) {
  const query = `
    UPDATE users 
    SET reset_password_token = $2, reset_password_expires = $3, reset_password_ip = $4, reset_password_user_agent = $5
    WHERE email = $1
    RETURNING id
  `;
  const { rows } = await db.query(query, [email, token, expires, ip, userAgent]);
  return rows[0] || null;
}

export async function findUserByResetToken(token: string) {
  const query = `
    SELECT id, name, email, password, reset_password_expires, reset_password_ip, reset_password_user_agent
    FROM users 
    WHERE reset_password_token = $1 AND reset_password_expires > NOW()
  `;
  const { rows } = await db.query(query, [token]);
  return (rows[0] as User & { reset_password_ip?: string; reset_password_user_agent?: string }) || null;
}

export async function updateUserPassword(userId: string, newPasswordHash: string) {
  const query = `
    UPDATE users 
    SET password = $2, reset_password_token = NULL, reset_password_expires = NULL, 
        reset_password_ip = NULL, reset_password_user_agent = NULL
    WHERE id = $1
    RETURNING id
  `;
  const { rows } = await db.query(query, [userId, newPasswordHash]);
  return rows[0] || null;
}
