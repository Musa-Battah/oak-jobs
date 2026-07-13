import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Get job details
    const result = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    const job = result.rows[0];

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Send to Telegram via Make.com webhook
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Telegram webhook not configured' }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: job.title,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${job.id}`,
        location: job.job_location || 'N/A',
        category: job.job_category?.[0] || 'General',
        company: job.company_name,
      }),
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to send to Telegram' },
      { status: 500 }
    );
  }
}