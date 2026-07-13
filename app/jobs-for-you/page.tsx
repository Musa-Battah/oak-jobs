'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

// Component that uses useSearchParams - must be wrapped in Suspense
function JobsForYouContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const saved = searchParams.get('saved');

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const response = await fetch(`/api/jobs/personalized?page=${currentPage}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          setIsLoggedIn(false);
          setError('Session expired. Please login again.');
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch personalized jobs');
        }

        const data = await response.json();
        const jobsWithSafeCategories = (data.jobs || []).map((job: any) => ({
          ...job,
          job_category: job.job_category || [],
        }));
        setJobs(jobsWithSafeCategories);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '40px 20px', textAlign: 'center', color: '#cccccc' }}>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid #333333',
          borderTop: '3px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: '15px' }}>Loading your personalized jobs...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#ffffff' }}>🎯 Jobs For You</h1>
        <p style={{ color: '#cccccc', marginBottom: '20px' }}>
          Please <Link href="/login" style={{ color: '#ffffff', textDecoration: 'underline' }}>login</Link> to see personalized job recommendations.
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '12px 30px',
            background: '#ffffff',
            color: '#000000',
            fontWeight: '700',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#dc3545' }}>{error}</p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '12px 30px',
            background: '#ffffff',
            color: '#000000',
            fontWeight: '700',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Login Again
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#ffffff' }}>🎯 Jobs For You</h1>
      <p style={{ color: '#cccccc', marginBottom: '30px' }}>
        Based on your selected categories and locations.
      </p>

      {saved === '1' && (
        <div className="job-success">✅ Your preferences have been saved successfully!</div>
      )}

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>😔 No jobs found matching your preferences right now.</p>
          <Link
            href="/complete-profile"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              padding: '10px 20px',
              background: '#ffffff',
              color: '#000000',
              fontWeight: '700',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Update Your Preferences
          </Link>
        </div>
      ) : (
        <>
          <div className="jobs-count">
            <strong>{total}</strong> <span>personalized jobs found</span>
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
      )}
    </div>
  );
}

// Main page component with Suspense
export default function JobsForYouPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '40px 20px', textAlign: 'center', color: '#cccccc' }}>
        Loading...
      </div>
    }>
      <JobsForYouContent />
    </Suspense>
  );
}