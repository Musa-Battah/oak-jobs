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
    console.log(`📊 Parsing CSV content (${csvContent.length} bytes)...`);
    const jobs = parseCSV(csvContent);
    
    console.log(`📊 Parsed ${jobs.length} jobs from CSV`);
    
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

    // 6. Send Telegram notification - INDIVIDUAL messages for each new job
    if (result.inserted > 0) {
      console.log(`📱 Sending ${result.inserted} individual Telegram notifications...`);
      
      let successCount = 0;
      
      for (const job of result.jobs) {
        try {
          const title = job.title || 'Untitled Position';
          const company = job.company_name || 'Unknown Organization';
          const location = job.job_location || 'N/A';
          const category = job.job_category && job.job_category.length > 0 
            ? job.job_category[0] 
            : 'General';
          
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oakjobs.online';
          
          const message = `
🏢 <b>Company:</b> ${company}
📍 <b>Location:</b> ${location}
📂 <b>Category:</b> ${category}

🔗 <b>Apply:</b> <a href="${baseUrl}/jobs/${job.id}">View & Apply</a>
          `;
          
          await sendTelegramNotification({
            title: title,
            message: message,
            url: `${baseUrl}/jobs/${job.id}`,
            category: category,
          });
          
          successCount++;
          
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Failed to send Telegram notification for job:', job.title, error);
        }
      }
      
      console.log(`✅ Sent ${successCount}/${result.inserted} individual Telegram notifications`);
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