import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const keyword = searchParams.get('s') || '';
  const category = searchParams.get('job_category') || '';
  const location = searchParams.get('job_location') || '';
  const offset = (page - 1) * limit;

  // Build cache key based on filters
  const filterString = `p${page}-l${limit}-k${keyword}-c${category}-loc${location}`;
  const cacheKey = CACHE_KEYS.JOBS(page, limit, filterString);
  
  // Try cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramCount = 1;

    if (keyword) {
      whereConditions.push(`(title ILIKE $${paramCount} OR company_name ILIKE $${paramCount} OR content ILIKE $${paramCount})`);
      params.push(`%${keyword}%`);
      paramCount++;
    }

    if (category) {
      whereConditions.push(`$${paramCount} = ANY(job_category)`);
      params.push(category);
      paramCount++;
    }

    if (location) {
      whereConditions.push(`job_location ILIKE $${paramCount}`);
      params.push(`%${location}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM jobs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get jobs with pagination
    const jobsResult = await query(
      `SELECT * FROM jobs ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    const data = {
      jobs: jobsResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result (only if not searching with keyword)
    // Searching is more dynamic, cache for shorter time
    const ttl = keyword || category || location ? 60 : CACHE_TTL.JOBS;
    cache.set(cacheKey, data, ttl);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}