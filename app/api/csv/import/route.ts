import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, importJobs } from '@/lib/import';
import { sendTelegramNotification } from '@/lib/telegram';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Check authentication
    const authHeader = request.headers.get('Authorization');
    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        isAdmin = true;
      }
    }

    // 2. Check API key (for GitHub Actions)
    const apiKey = request.headers.get('X-API-Key');
    const savedKey = process.env.CSV_IMPORT_API_KEY;
    const isApiKeyValid = savedKey && apiKey === savedKey;

    if (!isAdmin && !isApiKeyValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. Get CSV content
    let csvContent = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file uploaded' },
          { status: 400 }
        );
      }

      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !file.type.includes('csv')) {
        return NextResponse.json(
          { error: 'Only CSV files are allowed' },
          { status: 400 }
        );
      }

      csvContent = await file.text();
    } else {
      csvContent = await request.text();
    }

    if (!csvContent) {
      return NextResponse.json(
        { error: 'No CSV content provided' },
        { status: 400 }
      );
    }

    // 4. Parse CSV
    const jobs = parseCSV(csvContent);
    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid jobs found in CSV',
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        total_jobs: 0,
      });
    }

    // 5. Import jobs
    const result = await importJobs(jobs);

    // 6. Send Telegram notification (only if new jobs were inserted)
    if (result.inserted > 0) {
      // Get the first 5 jobs for the message
      const jobList = result.jobs.slice(0, 5).map(j => 
        `• <b>${j.title}</b> at ${j.company_name} (${j.job_location})`
      ).join('\n');
      
      const moreJobs = result.inserted > 5 ? `\n... and ${result.inserted - 5} more` : '';
      
      await sendTelegramNotification({
        title: `📢 ${result.inserted} New Jobs Added!`,
        message: `${jobList}${moreJobs}`,
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://oakjobs.online',
        category: 'CSV Import',
      });
    }

    // 7. Return response
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'CSV imported successfully',
      imported: result.inserted,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors,
      total_jobs: jobs.length,
      duration_ms: duration,
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}