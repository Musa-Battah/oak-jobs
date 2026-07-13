import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// POST - Clear all cache
export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.headers.get('X-API-Key');
    const savedKey = process.env.CSV_IMPORT_API_KEY;
    
    if (!savedKey || apiKey !== savedKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Clear all cache
    cache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

// GET - Get cache stats
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const savedKey = process.env.CSV_IMPORT_API_KEY;
    
    if (!savedKey || apiKey !== savedKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const stats = cache.stats();
    
    return NextResponse.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}