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
  jobs: (JobData & { id: number })[];
}

// Parse CSV line with quoted values - handles quotes properly
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

// Parse CSV content into job objects - handles multi-line quoted fields properly
export function parseCSV(csvContent: string): JobData[] {
  const jobs: JobData[] = [];
  
  const lines = csvContent.split('\n');
  
  if (lines.length < 2) {
    console.log('CSV has less than 2 lines, skipping');
    return jobs;
  }

  let headerIndex = 0;
  let headers: string[] = [];
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = parseCSVLine(line);
    const headerStr = cols.join(',').toLowerCase();
    
    if (headerStr.includes('post_title') || 
        headerStr.includes('company') || 
        headerStr.includes('job_location') ||
        headerStr.includes('title')) {
      headers = cols.map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
      headerIndex = i;
      console.log(`✅ Found header row at line ${i + 1}`);
      break;
    }
  }
  
  if (headers.length === 0) {
    headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    headerIndex = 0;
    console.log('⚠️ Using first line as header');
  }
  
  const columnMap: Record<string, string> = {
    'post_title': 'title',
    'title': 'title',
    'job_title': 'title',
    'position': 'title',
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
    'post_tag': 'job_category',
    'post_category': 'job_category',
    'required_qualifications': 'required_qualifications',
    'qualifications': 'required_qualifications',
    'experience_level': 'job_experience',
    'job_experience': 'job_experience',
    'skills_required': 'skills_required',
    'skills': 'skills_required',
    'application_url': 'application_url',
    'apply_url': 'application_url',
    'url': 'application_url',
    'application_email': 'application_email',
    'email': 'application_email',
    'post_content': 'content',
    'description': 'content',
    'job_description': 'content',
  };

  let currentRow = '';
  let inQuotedField = false;
  const dataRows: string[] = [];
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (!currentRow) {
      currentRow = line;
    } else {
      currentRow += '\n' + line;
    }
    
    const quoteCount = (line.match(/"/g) || []).length;
    if (quoteCount % 2 === 1) {
      inQuotedField = !inQuotedField;
    }
    
    if (!inQuotedField && currentRow.trim()) {
      const cols = parseCSVLine(currentRow);
      if (cols.length >= 2) {
        dataRows.push(currentRow);
      }
      currentRow = '';
    }
  }
  
  if (currentRow.trim()) {
    const cols = parseCSVLine(currentRow);
    if (cols.length >= 2) {
      dataRows.push(currentRow);
    }
  }
  
  console.log(`📊 Found ${dataRows.length} data rows in CSV`);

  // Valid job categories (excluding generic/meaningless ones)
  const validCategories = [
    'Healthcare', 'Technology', 'Management', 'Administration', 'Finance', 
    'Consultancy', 'Research', 'Environment', 'Development', 'Education',
    'Human Resources', 'Marketing', 'Sales', 'Engineering', 'Legal',
    'Monitoring and Evaluation', 'Program/Project Management', 'Humanitarian',
    'WASH', 'Nutrition', 'Health', 'Protection', 'Logistics', 'Operations',
    'Communications', 'Media', 'IT', 'Data', 'Analytics', 'Policy',
    'Agriculture', 'Food Security', 'Shelter', 'Construction'
  ];

  // Invalid categories to skip/filter out
  const invalidCategories = ['job', 'jobs', 'general', 'other', 'uncategorized', ''];

  for (const row of dataRows) {
    try {
      const values = parseCSVLine(row);
      
      if (values.length < Math.min(2, headers.length)) {
        continue;
      }
      
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

      const title = job.title || job.post_title || '';
      if (!title || title.length < 3) {
        continue;
      }

      const wordCount = title.split(' ').length;
      if (wordCount > 30 && !title.includes(' at ') && !title.includes(' - ')) {
        console.log(`Skipping row: Title looks like paragraph (${wordCount} words)`);
        continue;
      }

      if (!job.company_name) {
        if (job.company) job.company_name = job.company;
        else job.company_name = 'Unknown Organization';
      }

      // Process job_category - clean and filter invalid categories
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
      
      // If no categories, try post_tag (Impactpool) or post_category (ReliefWeb)
      if (categories.length === 0 && job.post_tag) {
        if (typeof job.post_tag === 'string') {
          categories = job.post_tag.split(',').map((c: string) => c.trim());
        }
      }
      
      if (categories.length === 0 && job.post_category) {
        if (typeof job.post_category === 'string' && job.post_category !== 'job') {
          categories = [job.post_category.trim()];
        }
      }
      
      // Filter out invalid categories
      categories = categories
        .map(c => {
          // Capitalize first letter
          return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
        })
        .filter(c => {
          // Remove invalid/generic categories
          const lower = c.toLowerCase();
          if (invalidCategories.includes(lower)) {
            console.log(`📝 Filtered out invalid category: "${c}"`);
            return false;
          }
          return true;
        })
        // Try to map to known valid categories
        .map(c => {
          const lower = c.toLowerCase();
          // Check if this category matches any valid category (case-insensitive)
          for (const valid of validCategories) {
            if (valid.toLowerCase() === lower) {
              return valid;
            }
          }
          // If it's a close match, use it
          for (const valid of validCategories) {
            if (valid.toLowerCase().includes(lower) || lower.includes(valid.toLowerCase())) {
              return valid;
            }
          }
          return c;
        });
      
      // If no valid categories, try to determine from title
      if (categories.length === 0) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('health') || titleLower.includes('nutrition') || titleLower.includes('medical')) {
          categories = ['Healthcare'];
        } else if (titleLower.includes('tech') || titleLower.includes('software') || titleLower.includes('it')) {
          categories = ['Technology'];
        } else if (titleLower.includes('manage') || titleLower.includes('director') || titleLower.includes('coordinator')) {
          categories = ['Management'];
        } else if (titleLower.includes('consult') || titleLower.includes('advisor')) {
          categories = ['Consultancy'];
        } else if (titleLower.includes('admin') || titleLower.includes('hr') || titleLower.includes('human resources')) {
          categories = ['Administration'];
        } else if (titleLower.includes('finance') || titleLower.includes('account')) {
          categories = ['Finance'];
        } else if (titleLower.includes('educate') || titleLower.includes('teach') || titleLower.includes('training')) {
          categories = ['Education'];
        } else if (titleLower.includes('research') || titleLower.includes('analyst')) {
          categories = ['Research'];
        } else if (titleLower.includes('environment') || titleLower.includes('climate')) {
          categories = ['Environment'];
        } else if (titleLower.includes('develop') || titleLower.includes('humanitarian') || titleLower.includes('relief')) {
          categories = ['Development'];
        } else {
          categories = ['General'];
        }
      }
      
      job.job_category = categories;

      // Process job_location
      let location = job.job_location || '';
      if (location) {
        location = location.replace(/^Remote\s*[|/]\s*/i, '');
        location = location.replace(/^Virtual\s*[|/]\s*/i, '');
        location = location.replace(/^Hybrid\s*[|/]\s*/i, '');
        
        if (location.includes('|') || location.includes('/')) {
          const parts = location.split(/[|/]/);
          location = parts[0].trim();
        }
        
        if (location.includes(',')) {
          const parts = location.split(',');
          location = parts[0].trim();
        }
      }
      job.job_location = location || 'Nigeria';

      // Process job_type
      if (!job.job_type) {
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
        job.application_url = job.application_url
          .replace(/\]\(.*?\)/, '')
          .replace(/\[.*?\]/, '')
          .replace(/[\)\]\*]+$/, '')
          .trim();
        
        const urlMatch = job.application_url.match(/https?:\/\/[^\s<>"\'\)\]]+/);
        if (urlMatch) {
          job.application_url = urlMatch[0];
        }
      }

      // Clean content
      if (job.content) {
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
          } else {
            job.job_expires = null;
          }
        } catch {
          job.job_expires = null;
        }
      }

      jobs.push(job);
    } catch (error) {
      console.error('Error parsing row:', error);
    }
  }

  console.log(`✅ Parsed ${jobs.length} valid jobs from CSV`);
  return jobs;
}

// Import jobs into database - returns jobs with IDs
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
      const existing = await query(
        `SELECT id FROM jobs WHERE title = $1 AND company_name = $2 AND job_location = $3`,
        [job.title, job.company_name, job.job_location]
      );

      if (existing.rows.length > 0) {
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
        result.jobs.push({
          ...job,
          id: existing.rows[0].id,
        });
      } else {
        const insertResult = await query(
          `INSERT INTO jobs (
            title, content, company_name, company_logo, company_tagline,
            job_location, job_type, job_salary, job_expires, job_category,
            required_qualifications, job_experience, skills_required,
            application_url, application_email
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id`,
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
        result.jobs.push({
          ...job,
          id: insertResult.rows[0].id,
        });
      }
    } catch (error) {
      console.error('Error importing job:', job.title, error);
      result.errors++;
    }
  }

  if (result.inserted > 0 || result.updated > 0) {
    cache.clear();
    console.log('🗑️ Cache cleared after import');
  }

  return result;
}

// Export single job (for admin manual add)
export async function createJob(jobData: any): Promise<{ id: number }> {
  const result = await query(
    `INSERT INTO jobs (
      title, content, company_name, company_logo, company_tagline,
      job_location, job_type, job_salary, job_expires, job_category,
      required_qualifications, job_experience, skills_required,
      application_url, application_email
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id`,
    [
      jobData.title,
      jobData.content || '',
      jobData.company_name,
      jobData.company_logo || null,
      jobData.company_tagline || null,
      jobData.job_location,
      jobData.job_type,
      jobData.job_salary || null,
      jobData.job_expires || null,
      jobData.job_category || [],
      jobData.required_qualifications || null,
      jobData.job_experience || null,
      jobData.skills_required || null,
      jobData.application_url || null,
      jobData.application_email || null,
    ]
  );

  cache.clear();
  return { id: result.rows[0].id };
}

// Update existing job (for admin edit)
export async function updateJob(id: number, jobData: any): Promise<void> {
  await query(
    `UPDATE jobs SET
      title = $1,
      content = $2,
      company_name = $3,
      company_logo = $4,
      company_tagline = $5,
      job_location = $6,
      job_type = $7,
      job_salary = $8,
      job_expires = $9,
      job_category = $10,
      required_qualifications = $11,
      job_experience = $12,
      skills_required = $13,
      application_url = $14,
      application_email = $15,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $16`,
    [
      jobData.title,
      jobData.content || '',
      jobData.company_name,
      jobData.company_logo || null,
      jobData.company_tagline || null,
      jobData.job_location,
      jobData.job_type,
      jobData.job_salary || null,
      jobData.job_expires || null,
      jobData.job_category || [],
      jobData.required_qualifications || null,
      jobData.job_experience || null,
      jobData.skills_required || null,
      jobData.application_url || null,
      jobData.application_email || null,
      id,
    ]
  );

  cache.clear();
}

// Delete job (for admin delete)
export async function deleteJob(id: number): Promise<void> {
  await query('DELETE FROM jobs WHERE id = $1', [id]);
  cache.clear();
}

// Get job by ID
export async function getJobById(id: number): Promise<any> {
  const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Get all jobs with pagination
export async function getJobs(page: number = 1, limit: number = 10, filters: any = {}): Promise<{ jobs: any[], total: number, totalPages: number }> {
  const offset = (page - 1) * limit;
  let whereConditions: string[] = [];
  let params: any[] = [];
  let paramCount = 1;

  if (filters.keyword) {
    whereConditions.push(`(title ILIKE $${paramCount} OR company_name ILIKE $${paramCount} OR content ILIKE $${paramCount})`);
    params.push(`%${filters.keyword}%`);
    paramCount++;
  }

  if (filters.category) {
    whereConditions.push(`$${paramCount} = ANY(job_category)`);
    params.push(filters.category);
    paramCount++;
  }

  if (filters.location) {
    whereConditions.push(`job_location ILIKE $${paramCount}`);
    params.push(`%${filters.location}%`);
    paramCount++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) as total FROM jobs ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.total || '0');

  const jobsResult = await query(
    `SELECT * FROM jobs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    [...params, limit, offset]
  );

  return {
    jobs: jobsResult.rows,
    total,
    totalPages: Math.ceil(total / limit),
  };
}