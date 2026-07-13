import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function GET() {
  const cacheKey = CACHE_KEYS.STATS;
  
  // Try cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Get industries with counts
    const industriesResult = await query(
      `SELECT unnest(job_category) as name, COUNT(*) as count 
       FROM jobs 
       GROUP BY name 
       ORDER BY name`
    );

    // Get regions with counts
    const regionsResult = await query(
      `SELECT job_location as name, COUNT(*) as count 
       FROM jobs 
       GROUP BY job_location 
       ORDER BY name`
    );

    const data = {
      industries: industriesResult.rows,
      regions: regionsResult.rows,
    };

    // Cache the result
    cache.set(cacheKey, data, CACHE_TTL.STATS);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}