import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
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
    const {
      title,
      content,
      company_name,
      company_logo,
      company_tagline,
      job_location,
      job_type,
      job_salary,
      job_expires,
      job_category,
      required_qualifications,
      job_experience,
      skills_required,
      application_url,
      application_email,
    } = body;

    // Validate required fields
    if (!title || !company_name || !job_location || !job_type) {
      return NextResponse.json(
        { error: 'Title, company, location, and type are required' },
        { status: 400 }
      );
    }

    // Insert job
    const result = await query(
      `INSERT INTO jobs (
        title, content, company_name, company_logo, company_tagline,
        job_location, job_type, job_salary, job_expires, job_category,
        required_qualifications, job_experience, skills_required,
        application_url, application_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        title,
        content || '',
        company_name,
        company_logo || null,
        company_tagline || null,
        job_location,
        job_type,
        job_salary || null,
        job_expires || null,
        job_category || [],
        required_qualifications || null,
        job_experience || null,
        skills_required || null,
        application_url || null,
        application_email || null,
      ]
    );

    // Clear cache
    cache.clear();

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Job created successfully',
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}