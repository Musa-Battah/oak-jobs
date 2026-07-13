import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cache } from '@/lib/cache';

// DELETE - Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    // Delete job
    await query('DELETE FROM jobs WHERE id = $1', [jobId]);

    // Clear cache
    cache.clear();

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}

// PUT - Update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
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

    // Update job
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
        jobId,
      ]
    );

    // Clear cache
    cache.clear();

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}