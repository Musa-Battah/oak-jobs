'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  content: string;
  company_name: string;
  company_logo?: string;
  job_location: string;
  job_type: string;
  job_salary?: string;
  job_category: string[];
  application_url?: string;
  created_at: string;
}

export default function JobsList() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const keyword = searchParams.get('s') || '';
  const category = searchParams.get('job_category') || '';
  const location = searchParams.get('job_location') || '';

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
        });
        if (keyword) params.append('s', keyword);
        if (category) params.append('job_category', category);
        if (location) params.append('job_location', location);

        const response = await fetch(`/api/jobs?${params.toString()}`);
        const data = await response.json();
        // Ensure job_category is always an array
        const jobsWithSafeCategories = (data.jobs || []).map((job: any) => ({
          ...job,
          job_category: job.job_category || [],
        }));
        setJobs(jobsWithSafeCategories);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [keyword, category, location, currentPage]);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="no-jobs">
        <p>😔 No jobs found matching your criteria.</p>
        <Link href="/jobs" style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', background: '#4169E1', color: '#fff', fontWeight: '700', textDecoration: 'none', borderRadius: '5px' }}>
          View All Jobs
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="jobs-count">
        <strong>{total}</strong> <span>jobs found</span>
        {keyword && ` for "${keyword}"`}
        {category && ` in category "${category}"`}
        {location && ` in location "${location}"`}
      </div>

      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h3>
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            <p>
              <strong>🏢 Company:</strong> {job.company_name}
            </p>
            <p>
              <strong>📍 Location:</strong> {job.job_location}
            </p>
            {job.job_category && job.job_category.length > 0 && (
              <p>
                <strong>📂 Category:</strong> {job.job_category.join(', ')}
              </p>
            )}
            <p>
              <strong>💼 Type:</strong> {job.job_type}
            </p>
            {job.job_salary && (
              <p>
                <strong>💰 Salary:</strong> {job.job_salary}
              </p>
            )}
            <div style={{ marginTop: '15px' }}>
              {job.application_url && (
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apply-btn"
                >
                  Apply Now
                </a>
              )}
              <Link href={`/jobs/${job.id}`} className="view-btn">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="jobs-pagination">
          <ul>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page}>
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`page-numbers ${page === currentPage ? 'current' : ''}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                  }}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}