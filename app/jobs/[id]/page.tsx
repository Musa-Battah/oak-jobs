import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import JobDetailClient from '@/components/JobDetailClient';

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getJob(id: number) {
  const cacheKey = CACHE_KEYS.JOB(id);
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  const job = result.rows[0];

  if (job) {
    cache.set(cacheKey, job, CACHE_TTL.JOB);
  }

  return job;
}

export default async function SingleJobPage({ params }: JobPageProps) {
  const { id } = await params;
  
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    notFound();
  }

  const job = await getJob(jobId);

  if (!job) {
    notFound();
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <JobDetailClient job={job} />
    </main>
  );
}

export async function generateStaticParams() {
  try {
    const result = await query('SELECT id FROM jobs');
    return result.rows.map((job: any) => ({
      id: String(job.id),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}