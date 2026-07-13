import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.headers.get('X-API-Key');
    const savedKey = process.env.CSV_IMPORT_API_KEY;
    
    if (!savedKey || apiKey !== savedKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(DISTINCT company_name) as total_companies,
        COUNT(DISTINCT job_location) as total_locations,
        COUNT(DISTINCT unnest(job_category)) as total_categories,
        MAX(created_at) as latest_job,
        MIN(created_at) as earliest_job
      FROM jobs
    `);

    const recentImports = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM jobs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return NextResponse.json({
      success: true,
      stats: result.rows[0],
      recent_daily: recentImports.rows,
      cache_stats: cache.stats(),
    });
  } catch (error) {
    console.error('Error getting import stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}