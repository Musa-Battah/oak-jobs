import { query } from './db';
import { cache, CACHE_KEYS } from './cache';

interface JobData {
  title: string;
  content: string;
  company_name: string;
  company_logo?: string;
  company_tagline?: string;
  job_location: string;
  job_type: string;
  job_salary?: string;
  job_expires?: string;
  job_category: string[];
  required_qualifications?: string;
  job_experience?: string;
  skills_required?: string;
  application_url?: string;
  application_email?: string;
}

interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  jobs: JobData[];
}

// Parse CSV line with quoted values
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Parse CSV content into job objects
export function parseCSV(csvContent: string): JobData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return [];
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Column mapping
  const columnMap: Record<string, string> = {
    'post_title': 'title',
    'title': 'title',
    'job_title': 'title',
    'position': 'title',
    'post_content': 'content',
    'content': 'content',
    'description': 'content',
    'job_description': 'content',
    'company': 'company_name',
    'organization': 'company_name',
    'company_name': 'company_name',
    'company_logo': 'company_logo',
    'company_tagline': 'company_tagline',
    'job_location': 'job_location',
    'location': 'job_location',
    'country': 'job_location',
    'job_type': 'job_type',
    'type': 'job_type',
    'employment_type': 'job_type',
    'job_salary': 'job_salary',
    'salary': 'job_salary',
    'job_expires': 'job_expires',
    'expires': 'job_expires',
    'deadline': 'job_expires',
    'job_category': 'job_category',
    'category': 'job_category',
    'sector': 'job_category',
    'required_qualifications': 'required_qualifications',
    'qualifications': 'required_qualifications',
    'job_experience': 'job_experience',
    'experience': 'job_experience',
    'skills_required': 'skills_required',
    'skills': 'skills_required',
    'application_url': 'application_url',
    'apply_url': 'application_url',
    'url': 'application_url',
    'application_email': 'application_email',
    'email': 'application_email',
  };

  const jobs: JobData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const job: any = {};
    let hasValidData = false;
    
    headers.forEach((header, index) => {
      const dbColumn = columnMap[header] || header;
      const value = values[index] || '';
      if (value.trim()) {
        hasValidData = true;
      }
      job[dbColumn] = value.trim();
    });

    if (!hasValidData) continue;

    // Process job_category
    if (job.job_category) {
      if (typeof job.job_category === 'string') {
        if (job.job_category.includes('|')) {
          job.job_category = job.job_category.split('|').map((c: string) => c.trim());
        } else if (job.job_category.includes(',')) {
          job.job_category = job.job_category.split(',').map((c: string) => c.trim());
        } else {
          job.job_category = [job.job_category.trim()];
        }
      }
    } else {
      job.job_category = ['General'];
    }

    // Set defaults
    job.title = job.title || 'Untitled Position';
    job.company_name = job.company_name || 'Unknown Organization';
    job.job_location = job.job_location || 'Nigeria';
    job.job_type = job.job_type || 'Full-time';
    job.content = job.content || '';

    jobs.push(job);
  }

  return jobs;
}

// Import jobs into database
export async function importJobs(jobs: JobData[]): Promise<ImportResult> {
  const result: ImportResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    jobs: [],
  };

  for (const job of jobs) {
    try {
      // Check if job exists
      const existing = await query(
        `SELECT id FROM jobs WHERE title = $1 AND company_name = $2 AND job_location = $3`,
        [job.title, job.company_name, job.job_location]
      );

      if (existing.rows.length > 0) {
        // Update existing job
        await query(
          `UPDATE jobs SET 
            content = $1,
            company_logo = $2,
            company_tagline = $3,
            job_type = $4,
            job_salary = $5,
            job_expires = $6,
            job_category = $7,
            required_qualifications = $8,
            job_experience = $9,
            skills_required = $10,
            application_url = $11,
            application_email = $12,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $13`,
          [
            job.content,
            job.company_logo || null,
            job.company_tagline || null,
            job.job_type,
            job.job_salary || null,
            job.job_expires || null,
            job.job_category,
            job.required_qualifications || null,
            job.job_experience || null,
            job.skills_required || null,
            job.application_url || null,
            job.application_email || null,
            existing.rows[0].id
          ]
        );
        result.updated++;
        result.jobs.push(job);
      } else {
        // Insert new job
        await query(
          `INSERT INTO jobs (
            title, content, company_name, company_logo, company_tagline,
            job_location, job_type, job_salary, job_expires, job_category,
            required_qualifications, job_experience, skills_required,
            application_url, application_email
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            job.title,
            job.content,
            job.company_name,
            job.company_logo || null,
            job.company_tagline || null,
            job.job_location,
            job.job_type,
            job.job_salary || null,
            job.job_expires || null,
            job.job_category,
            job.required_qualifications || null,
            job.job_experience || null,
            job.skills_required || null,
            job.application_url || null,
            job.application_email || null,
          ]
        );
        result.inserted++;
        result.jobs.push(job);
      }
    } catch (error) {
      console.error('Error importing job:', job.title, error);
      result.errors++;
    }
  }

  // Invalidate caches after import
  if (result.inserted > 0 || result.updated > 0) {
    invalidateCaches();
  }

  return result;
}

// Invalidate all caches
export function invalidateCaches(): void {
  cache.clear();
  console.log('🗑️ All caches invalidated');
}

// Invalidate specific cache keys
export function invalidateCacheKeys(keys: string[]): void {
  for (const key of keys) {
    cache.delete(key);
  }
  console.log('🗑️ Cache keys invalidated:', keys);
}