import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function GET() {
  const cacheKey = CACHE_KEYS.RECENT;
  
  // Try cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ jobs: cached });
  }

  try {
    const result = await query(
      'SELECT id, title, company_name, company_logo, created_at FROM jobs ORDER BY created_at DESC LIMIT 10'
    );
    
    // Cache the result
    cache.set(cacheKey, result.rows, CACHE_TTL.RECENT);

    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch recent jobs' }, { status: 500 });
  }
}