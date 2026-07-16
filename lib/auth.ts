import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';
import { User } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createUser(email: string, username: string, password: string): Promise<User | null> {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, username, password_hash, is_active, is_admin) VALUES ($1, $2, $3, false, false) RETURNING *',
    [email, username, hashedPassword]
  );
  return result.rows[0] || null;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function generateActivationToken(userId: number, email: string): string {
  return jwt.sign(
    { id: userId, email: email, purpose: 'activation' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function generateResetToken(userId: number, email: string): string {
  return jwt.sign(
    { id: userId, email: email, purpose: 'reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function activateUser(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid or expired activation token' };
    }

    if (decoded.purpose !== 'activation') {
      return { success: false, error: 'Invalid token type' };
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.is_active) {
      return { success: false, error: 'Account already activated' };
    }

    await query('UPDATE users SET is_active = true, activation_token = NULL WHERE id = $1', [user.id]);
    
    const updatedUser = await findUserById(user.id);
    return { success: true, user: updatedUser || undefined };
  } catch (error) {
    return { success: false, error: 'Invalid or expired activation token' };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    if (decoded.purpose !== 'reset') {
      return { success: false, error: 'Invalid token type' };
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const hashedPassword = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, reset_password_token = NULL WHERE id = $2', [hashedPassword, user.id]);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid or expired reset token' };
  }
}