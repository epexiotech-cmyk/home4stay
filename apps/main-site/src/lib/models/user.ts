/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '../database/prisma';
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
  
  return await (prisma.user as any).create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone
    }
  }) as User;
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  }) as User | null;
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  }) as User | null;
}

export async function updateUser(id: string, data: Partial<User>) {
  return await (prisma.user as any).update({
    where: { id },
    data
  }) as User;
}

export async function setResetToken(email: string, token: string, expires: Date) {
  return await (prisma.user as any).update({
    where: { email },
    data: {
      reset_password_token: token,
      reset_password_expires: expires,
      // Note: If schema doesn't have IP/UA, these might need to be added or handled in metadata
    }
  });
}

export async function findUserByResetToken(token: string) {
  return await (prisma.user as any).findFirst({
    where: { 
      reset_password_token: token,
      reset_password_expires: { gt: new Date() }
    }
  }) as User | null;
}

export async function updateUserPassword(userId: string, newPasswordHash: string) {
  return await (prisma.user as any).update({
    where: { id: userId },
    data: {
      password: newPasswordHash,
      reset_password_token: null,
      reset_password_expires: null
    }
  });
}
