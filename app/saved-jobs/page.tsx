'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SavedJob {
  id: string;
  title: string;
  url: string;
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
    setSavedJobs(saved);
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>⭐ Your Saved Jobs</h1>
      
      {savedJobs.length === 0 ? (
        <div className="no-jobs">
          <p>No saved jobs yet. Start saving jobs you're interested in!</p>
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '10px 20px',
              background: '#4169E1',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              borderRadius: '5px',
            }}
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="job-list">
          {savedJobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>
                <Link href={job.url}>{job.title}</Link>
              </h3>
              <button
                onClick={() => {
                  const updated = savedJobs.filter((j) => j.id !== job.id);
                  localStorage.setItem('saved_jobs', JSON.stringify(updated));
                  setSavedJobs(updated);
                }}
                style={{
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}