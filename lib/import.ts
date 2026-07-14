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

// Parse CSV content into job objects - handles both Impactpool and ReliefWeb formats
export function parseCSV(csvContent: string): JobData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return [];
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  
  // Column mapping - supports both CSV formats
  const columnMap: Record<string, string> = {
    // Impactpool format
    'post_title': 'title',
    'company': 'company_name',
    'company_logo': 'company_logo',
    'company_tagline': 'company_tagline',
    'job_location': 'job_location',
    'job_type': 'job_type',
    'job_expires': 'job_expires',
    'job_category': 'job_category',
    'required_qualifications': 'required_qualifications',
    'application_url': 'application_url',
    'application_email': 'application_email',
    'post_content': 'content',
    'post_tag': 'job_category',
    
    // ReliefWeb format
    'company': 'company_name',
    'experience_level': 'job_experience',
    'post_category': 'job_category',
    'url': 'application_url',
    'post_content': 'content',
    'application_url': 'application_url',
    'date_created': 'created_at',
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

    // Handle title
    if (!job.title) {
      if (job.post_title) job.title = job.post_title;
      else continue; // Skip if no title
    }

    // Handle company name
    if (!job.company_name) {
      if (job.company) job.company_name = job.company;
      else job.company_name = 'Unknown Organization';
    }

    // Process job_category - handle different formats
    let categories: string[] = [];
    if (job.job_category) {
      if (Array.isArray(job.job_category)) {
        categories = job.job_category;
      } else if (typeof job.job_category === 'string') {
        // Try pipe separator first (Impactpool)
        if (job.job_category.includes('|')) {
          categories = job.job_category.split('|').map((c: string) => c.trim());
        } 
        // Try comma separator (ReliefWeb)
        else if (job.job_category.includes(',')) {
          categories = job.job_category.split(',').map((c: string) => c.trim());
        } 
        // Single category
        else {
          categories = [job.job_category.trim()];
        }
      }
    }
    
    // If no categories, try post_tag (Impactpool)
    if (categories.length === 0 && job.post_tag) {
      if (typeof job.post_tag === 'string') {
        categories = job.post_tag.split(',').map((c: string) => c.trim());
      }
    }
    
    job.job_category = categories.length > 0 ? categories : ['General'];

    // Process job_location - extract single location
    let location = job.job_location || '';
    if (location) {
      // Remove "Remote |", "Virtual /", etc.
      location = location.replace(/^Remote\s*[|/]\s*/i, '');
      location = location.replace(/^Virtual\s*[|/]\s*/i, '');
      location = location.replace(/^Hybrid\s*[|/]\s*/i, '');
      
      // Take first location if multiple
      if (location.includes('|') || location.includes('/')) {
        const parts = location.split(/[|/]/);
        location = parts[0].trim();
      }
      
      // Take first city if comma-separated (e.g., "Abuja, Nigeria")
      if (location.includes(',')) {
        const parts = location.split(',');
        // Check if first part looks like a city (not a country)
        const firstPart = parts[0].trim();
        const countries = ['Nigeria', 'Ghana', 'Kenya', 'Senegal', 'Mali', 'Niger', 'Chad', 'Cameroon'];
        const secondPart = parts.length > 1 ? parts[1].trim() : '';
        const isCountry = countries.some(c => secondPart.toLowerCase().includes(c.toLowerCase()));
        if (isCountry && firstPart.length > 2) {
          location = firstPart;
        } else {
          location = firstPart;
        }
      }
    }
    job.job_location = location || 'Nigeria';

    // Process job_type
    if (!job.job_type) {
      // Try to infer from post_category
      if (job.post_category) {
        const typeMap: Record<string, string> = {
          'job': 'Full-time',
          'consultancy': 'Consultancy',
          'internship': 'Internship',
          'volunteer': 'Volunteer',
        };
        job.job_type = typeMap[job.post_category.toLowerCase()] || 'Full-time';
      } else {
        job.job_type = 'Full-time';
      }
    }

    // Clean application_url
    if (job.application_url) {
      // Remove markdown artifacts
      job.application_url = job.application_url
        .replace(/\]\(.*?\)/, '')
        .replace(/\[.*?\]/, '')
        .replace(/[\)\]\*]+$/, '')
        .trim();
      
      // Extract first URL if multiple
      const urlMatch = job.application_url.match(/https?:\/\/[^\s<>"\'\)\]]+/);
      if (urlMatch) {
        job.application_url = urlMatch[0];
      }
    }

    // Clean content
    if (job.content) {
      // Remove common disclaimers
      job.content = job.content
        .replace(/At Impactpool we do our best.*/g, '')
        .replace(/Please check on the recruiting organization.*/g, '')
        .replace(/Candidates are responsible for complying.*/g, '')
        .replace(/Before applying, please make sure.*/g, '')
        .replace(/Applications from non-qualifying applicants.*/g, '')
        .replace(/Only shortlisted candidates.*/g, '')
        .trim();
    }

    // Set defaults
    job.title = job.title || 'Untitled Position';
    job.company_name = job.company_name || 'Unknown Organization';
    job.job_location = job.job_location || 'Nigeria';
    job.job_type = job.job_type || 'Full-time';
    job.content = job.content || '';
    job.job_category = job.job_category || ['General'];

    // Clean job_expires date format
    if (job.job_expires) {
      try {
        const date = new Date(job.job_expires);
        if (!isNaN(date.getTime())) {
          job.job_expires = date.toISOString().split('T')[0];
        }
      } catch {
        // Keep as-is
      }
    }

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
      // Check if job exists (by title, company, location)
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
    cache.clear();
    console.log('🗑️ Cache cleared after import');
  }

  return result;
}