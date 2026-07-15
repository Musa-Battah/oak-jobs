import { query } from '@/lib/db';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const jobId = parseInt(params.id);
  if (isNaN(jobId)) return {};

  const result = await query('SELECT title, company_name, job_location FROM jobs WHERE id = $1', [jobId]);
  const job = result.rows[0];

  if (!job) {
    return {
      title: 'Job Not Found',
    };
  }

  return {
    title: `${job.title} at ${job.company_name} | Oak Jobs`,
    description: `Apply for ${job.title} at ${job.company_name} in ${job.job_location}. Find your dream job on Oak Jobs.`,
    openGraph: {
      title: `${job.title} at ${job.company_name}`,
      description: `Apply for ${job.title} at ${job.company_name} in ${job.job_location}.`,
      type: 'website',
      url: `https://oakjobs.online/jobs/${jobId}`,
    },
  };
}