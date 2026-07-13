import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's preferences
    const profileResult = await query(
      'SELECT preferred_job_category, preferred_location FROM user_profiles WHERE user_id = $1',
      [decoded.id]
    );

    const profile = profileResult.rows[0];
    if (!profile) {
      return NextResponse.json({ jobs: [] });
    }

    const categories = profile.preferred_job_category || [];
    const locations = profile.preferred_location || [];

    if (categories.length === 0 && locations.length === 0) {
      return NextResponse.json({ jobs: [] });
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
      const locConditions = locations.map((loc: string, i: number) => `job_location ILIKE $${paramCount + i}`);
      conditions.push(`(${locConditions.join(' OR ')})`);
      params.push(...locations.map((loc: string) => `%${loc}%`));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' OR ')}` : '';
    const result = await query(
      `SELECT id, title, company_name, company_logo FROM jobs ${whereClause} ORDER BY created_at DESC LIMIT 10`,
      params
    );

    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    console.error('Error fetching personalized jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch personalized jobs' }, { status: 500 });
  }
}