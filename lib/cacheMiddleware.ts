import { NextRequest, NextResponse } from 'next/server';
import { cache, CACHE_TTL } from './cache';

export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  cacheKey: string,
  ttl: number = CACHE_TTL.JOBS
) {
  return async function(request: NextRequest) {
    // Try cache
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Execute handler
    const response = await handler(request);
    
    // Cache the result (only if successful)
    if (response.status === 200) {
      const data = await response.clone().json();
      cache.set(cacheKey, data, ttl);
    }

    return response;
  };
}