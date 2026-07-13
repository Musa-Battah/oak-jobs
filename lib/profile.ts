import { query } from './db';
import { UserProfile } from '@/types/auth';

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const result = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
}

export async function createOrUpdateProfile(
  userId: number, 
  preferences: { categories?: string[], locations?: string[] }
): Promise<UserProfile | null> {
  const existing = await getUserProfile(userId);
  
  if (existing) {
    const result = await query(
      'UPDATE user_profiles SET preferred_job_category = $1, preferred_location = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *',
      [preferences.categories || [], preferences.locations || [], userId]
    );
    return result.rows[0] || null;
  } else {
    const result = await query(
      'INSERT INTO user_profiles (user_id, preferred_job_category, preferred_location) VALUES ($1, $2, $3) RETURNING *',
      [userId, preferences.categories || [], preferences.locations || []]
    );
    return result.rows[0] || null;
  }
}

export async function getJobCategories(): Promise<string[]> {
  const result = await query('SELECT DISTINCT unnest(job_category) as category FROM jobs ORDER BY category');
  return result.rows.map(row => row.category).filter(Boolean);
}

export async function getJobLocations(): Promise<string[]> {
  const result = await query('SELECT DISTINCT job_location FROM jobs ORDER BY job_location');
  return result.rows.map(row => row.job_location).filter(Boolean);
}

export async function getCategoryJobCounts(): Promise<Record<string, number>> {
  const result = await query('SELECT unnest(job_category) as category, COUNT(*) as count FROM jobs GROUP BY category ORDER BY category');
  return result.rows.reduce((acc, row) => {
    acc[row.category] = parseInt(row.count);
    return acc;
  }, {} as Record<string, number>);
}