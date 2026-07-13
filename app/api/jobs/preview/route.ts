import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categories = body.categories || [];
    const locations = body.locations || [];

    if (categories.length === 0 && locations.length === 0) {
      return NextResponse.json({ count: 0 });
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
    const result = await query(`SELECT COUNT(*) as count FROM jobs ${whereClause}`, params);

    return NextResponse.json({ count: parseInt(result.rows[0]?.count || '0') });
  } catch (error) {
    console.error('Error counting jobs:', error);
    return NextResponse.json({ error: 'Failed to count jobs' }, { status: 500 });
  }
}