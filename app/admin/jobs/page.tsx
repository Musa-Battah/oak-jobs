'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  company_name: string;
  job_location: string;
  job_type: string;
  created_at: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          window.location.href = '/login?redirect=/admin/jobs';
          return;
        }

        const response = await fetch('/api/jobs?limit=100');
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setJobs(jobs.filter(j => j.id !== id));
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Jobs</h2>
        <Link href="/admin/jobs/add" className="admin-btn admin-btn-primary">
          ➕ Add New Job
        </Link>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Type</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  No jobs found. <Link href="/admin/jobs/add">Add your first job</Link>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
                  <td>#{job.id}</td>
                  <td>{job.title}</td>
                  <td>{job.company_name}</td>
                  <td>{job.job_location}</td>
                  <td>{job.job_type}</td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/jobs/${job.id}/edit`} className="admin-btn admin-btn-secondary" style={{ marginRight: '5px' }}>
                      Edit
                    </Link>
                    <button 
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(job.id, job.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}