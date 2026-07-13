'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  company_name: string;
  company_logo?: string;
  created_at: string;
}

export default function RecentJobsBox() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [personalizedJobs, setPersonalizedJobs] = useState<Job[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check login status
        const token = localStorage.getItem('auth_token');
        setIsLoggedIn(!!token);

        // Fetch recent jobs
        const recentRes = await fetch('/api/jobs/recent');
        const recentData = await recentRes.json();
        setRecentJobs(recentData.jobs || []);

        // Fetch personalized jobs if logged in
        if (token) {
          const personalRes = await fetch('/api/jobs/personalized', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const personalData = await personalRes.json();
          setPersonalizedJobs(personalData.jobs || []);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="recent-jobs-wrapper">
        <div>Loading jobs...</div>
      </div>
    );
  }

  return (
    <>
      <div className="recent-jobs-wrapper">
        <div className="recent-jobs-column">
          <h2 className="recent-jobs-heading">Latest Jobs</h2>
          <div className="recent-jobs-list">
            {recentJobs.map((job) => (
              <div key={job.id} className="recent-job-item">
                <div className="recent-job-logo-wrapper">
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt={`${job.company_name} logo`}
                      className="recent-job-logo"
                    />
                  ) : (
                    <span className="recent-job-logo-placeholder">🏢</span>
                  )}
                </div>
                <Link href={`/jobs/${job.id}`} className="recent-job-title">
                  {job.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-jobs-column">
          <h2 className="recent-jobs-heading">Jobs For You</h2>
          <div className="recent-jobs-list">
            {!isLoggedIn ? (
              <div className="recent-login-box">
                <h3>Personalized Jobs Await</h3>
                <p>Login to unlock job recommendations crafted just for you.</p>
                <Link href="/login" className="recent-login-btn">
                  Login Now
                </Link>
              </div>
            ) : personalizedJobs.length > 0 ? (
              personalizedJobs.map((job) => (
                <div key={job.id} className="recent-job-item">
                  <div className="recent-job-logo-wrapper">
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={`${job.company_name} logo`}
                        className="recent-job-logo"
                      />
                    ) : (
                      <span className="recent-job-logo-placeholder">🏢</span>
                    )}
                  </div>
                  <Link href={`/jobs/${job.id}`} className="recent-job-title">
                    {job.title}
                  </Link>
                </div>
              ))
            ) : (
              <p className="recent-no-jobs">No personalized jobs available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="recent-jobs-buttons">
        <Link href="/jobs-for-you" className="recent-btn-blue">
          Jobs For You
        </Link>
        <Link href="/jobs" className="recent-btn-dark">
          Browse All Jobs
        </Link>
      </div>
    </>
  );
}