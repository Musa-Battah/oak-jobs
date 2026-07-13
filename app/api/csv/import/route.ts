import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, importJobs } from '@/lib/import';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Check API key
    const apiKey = request.headers.get('X-API-Key');
    const savedKey = process.env.CSV_IMPORT_API_KEY;
    
    if (!savedKey || apiKey !== savedKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Get CSV content
    const csvContent = await request.text();
    if (!csvContent) {
      return NextResponse.json(
        { error: 'No CSV content provided' },
        { status: 400 }
      );
    }

    // 3. Parse CSV
    const jobs = parseCSV(csvContent);
    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid jobs found in CSV',
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // 4. Import jobs
    const result = await importJobs(jobs);

    // 5. Send Telegram notification (only if new jobs were inserted)
    if (result.inserted > 0) {
      const jobsList = result.jobs.slice(0, 5).map(j => 
        `• ${j.title} at ${j.company_name} (${j.job_location})`
      ).join('\n');
      
      const moreJobs = result.inserted > 5 ? `\n... and ${result.inserted - 5} more` : '';
      
      await sendTelegramNotification({
        title: `📢 ${result.inserted} New Jobs Added!`,
        message: `${jobsList}${moreJobs}`,
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://oakjobs.online',
        category: 'CSV Import',
      });
    }

    // 6. Return response
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