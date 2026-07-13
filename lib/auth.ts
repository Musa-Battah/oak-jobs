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

export async function createUser(email: string, username: string, password: string): Promise<User | null> {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [email, username, hashedPassword]
  );
  return result.rows[0] || null;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}