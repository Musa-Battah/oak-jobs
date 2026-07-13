// Simple in-memory cache with TTL
interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Delete all keys that start with a prefix
  clearPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.store.delete(key);
    }
  }

  // Get cache stats
  stats(): { total: number; keys: string[] } {
    return {
      total: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance
export const cache = new Cache();

// Cache keys
export const CACHE_KEYS = {
  HOME: 'home_data',
  JOBS: (page: number, limit: number, filters: string) => 
    `jobs:${page}:${limit}:${filters}`,
  STATS: 'jobs_stats',
  RECENT: 'recent_jobs',
  JOB: (id: number) => `job:${id}`,
  CATEGORIES: 'job_categories',
  LOCATIONS: 'job_locations',
};

// TTL constants (in seconds)
export const CACHE_TTL = {
  HOME: parseInt(process.env.CACHE_TTL_HOME || '600'),
  JOBS: parseInt(process.env.CACHE_TTL_JOBS || '300'),
  STATS: parseInt(process.env.CACHE_TTL_CATEGORIES || '3600'),
  RECENT: parseInt(process.env.CACHE_TTL_JOBS || '300'),
  JOB: parseInt(process.env.CACHE_TTL_CATEGORIES || '3600'),
  CATEGORIES: parseInt(process.env.CACHE_TTL_CATEGORIES || '3600'),
};