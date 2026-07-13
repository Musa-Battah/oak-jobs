import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(DISTINCT company_name) as total_companies,
        COUNT(DISTINCT job_location) as total_locations,
        COUNT(DISTINCT unnest(job_category)) as total_categories,
        MAX(created_at) as latest_job
      FROM jobs
    `);

    return NextResponse.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}