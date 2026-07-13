import { query } from './db';
import { Job } from '@/types/auth';

export async function getAllJobs(): Promise<Job[]> {
  const result = await query('SELECT * FROM jobs ORDER BY created_at DESC');
  return result.rows;
}

export async function getJobById(id: number): Promise<Job | null> {
  const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getRecentJobs(limit: number = 10): Promise<Job[]> {
  const result = await query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1', [limit]);
  return result.rows;
}

export async function getJobsByCategory(category: string): Promise<Job[]> {
  const result = await query('SELECT * FROM jobs WHERE $1 = ANY(job_category) ORDER BY created_at DESC', [category]);
  return result.rows;
}

export async function getJobsByLocation(location: string): Promise<Job[]> {
  const result = await query('SELECT * FROM jobs WHERE job_location ILIKE $1 ORDER BY created_at DESC', [`%${location}%`]);
  return result.rows;
}

export async function getJobsByPreferences(categories: string[], locations: string[]): Promise<Job[]> {
  if (categories.length === 0 && locations.length === 0) {
    return [];
  }

  let conditions: string[] = [];
  let params: any[] = [];
  let paramCount = 1;

  if (categories.length > 0) {
    conditions.push(`(job_category && $${paramCount}::text[])`);
    params.push(categories);
    paramCount++;
  }

  if (locations.length > 0) {
    const locConditions = locations.map((loc, i) => `job_location ILIKE $${paramCount + i}`);
    conditions.push(`(${locConditions.join(' OR ')})`);
    params.push(...locations.map(l => `%${l}%`));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' OR ')}` : '';
  const result = await query(`SELECT * FROM jobs ${whereClause} ORDER BY created_at DESC`, params);
  return result.rows;
}

export async function searchJobs(keyword: string, category?: string, location?: string): Promise<Job[]> {
  let conditions: string[] = [];
  let params: any[] = [];
  let paramCount = 1;

  if (keyword) {
    conditions.push(`(title ILIKE $${paramCount} OR company_name ILIKE $${paramCount} OR content ILIKE $${paramCount})`);
    params.push(`%${keyword}%`);
    paramCount++;
  }

  if (category) {
    conditions.push(`$${paramCount} = ANY(job_category)`);
    params.push(category);
    paramCount++;
  }

  if (location) {
    conditions.push(`job_location ILIKE $${paramCount}`);
    params.push(`%${location}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(`SELECT * FROM jobs ${whereClause} ORDER BY created_at DESC`, params);
  return result.rows;
}

export async function saveJob(userId: number, jobId: number): Promise<boolean> {
  try {
    await query(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT (user_id, job_id) DO NOTHING',
      [userId, jobId]
    );
    return true;
  } catch {
    return false;
  }
}

export async function unsaveJob(userId: number, jobId: number): Promise<boolean> {
  try {
    await query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
    return true;
  } catch {
    return false;
  }
}

export async function getSavedJobs(userId: number): Promise<Job[]> {
  const result = await query(
    `SELECT j.* FROM jobs j 
     JOIN saved_jobs sj ON j.id = sj.job_id 
     WHERE sj.user_id = $1 
     ORDER BY sj.saved_at DESC`,
    [userId]
  );
  return result.rows;
}