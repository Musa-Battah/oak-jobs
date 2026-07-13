import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch user profile
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

    const result = await query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [decoded.id]
    );

    return NextResponse.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { preferred_job_category, preferred_location } = body;

    // Check if profile exists
    const existing = await query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [decoded.id]
    );

    if (existing.rows.length > 0) {
      // Update existing profile
      await query(
        `UPDATE user_profiles 
         SET preferred_job_category = $1, 
             preferred_location = $2, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $3`,
        [preferred_job_category || [], preferred_location || [], decoded.id]
      );
    } else {
      // Create new profile
      await query(
        `INSERT INTO user_profiles (user_id, preferred_job_category, preferred_location) 
         VALUES ($1, $2, $3)`,
        [decoded.id, preferred_job_category || [], preferred_location || []]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}