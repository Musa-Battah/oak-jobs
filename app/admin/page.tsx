'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  total_jobs: number;
  total_companies: number;
  total_locations: number;
  total_categories: number;
  latest_job: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState<string>('');
  const [telegramLoading, setTelegramLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          window.location.href = '/login?redirect=/admin';
          return;
        }

        const statsRes = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (statsRes.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login?redirect=/admin';
          return;
        }
        
        const statsData = await statsRes.json();
        setStats(statsData);

        const jobsRes = await fetch('/api/jobs/recent');
        const jobsData = await jobsRes.json();
        setRecentJobs(jobsData.jobs || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const testTelegram = async () => {
    setTelegramLoading(true);
    setTelegramStatus('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/telegram/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTelegramStatus('✅ ' + data.message);
      } else {
        setTelegramStatus('❌ ' + data.message);
      }
    } catch (error) {
      setTelegramStatus('❌ Failed to test Telegram bot');
    } finally {
      setTelegramLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <p className="stat-number">{stats?.total_jobs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Companies</h3>
          <p className="stat-number">{stats?.total_companies || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Locations</h3>
          <p className="stat-number">{stats?.total_locations || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p className="stat-number">{stats?.total_categories || 0}</p>
        </div>
      </div>

      {/* Telegram Test Section */}
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        background: '#111', 
        borderRadius: '12px', 
        border: '1px solid #333' 
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>📱 Telegram Bot</h3>
        <p style={{ color: '#888', marginBottom: '15px' }}>Test your Telegram bot connection and send a test message.</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={testTelegram}
            disabled={telegramLoading}
            className="admin-btn admin-btn-primary"
          >
            {telegramLoading ? 'Testing...' : '📤 Send Test Message'}
          </button>
          {telegramStatus && (
            <span style={{ 
              color: telegramStatus.includes('✅') ? '#28a745' : '#dc3545',
              fontSize: '0.95rem',
            }}>
              {telegramStatus}
            </span>
          )}
        </div>
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#0a0a0a', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          fontFamily: 'monospace'
        }}>
          <p>Bot Token: {process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Not configured'}</p>
          <p>Chat ID: {process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ? '✅ Configured' : '❌ Not configured'}</p>
        </div>
      </div>

      {/* Email Test Section */}
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        background: '#111', 
        borderRadius: '12px', 
        border: '1px solid #333' 
      }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>📧 Email Test</h3>
        <p style={{ color: '#888', marginBottom: '15px' }}>Send a test email to verify Zoho Mail is working.</p>
        <button 
          onClick={async () => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/email/test', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ email: 'admin@oakjobs.online' }),
            });
            const data = await response.json();
            if (response.ok) {
              alert('✅ Test email sent! Check your inbox.');
            } else {
              alert('❌ Failed to send: ' + data.error);
            }
          }}
          className="admin-btn admin-btn-primary"
        >
          📤 Send Test Email
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Recent Jobs</h2>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No jobs found. <Link href="/admin/jobs/add">Add your first job</Link>
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td>#{job.id}</td>
                    <td>{job.title}</td>
                    <td>{job.company_name}</td>
                    <td>{job.job_location}</td>
                    <td>{job.job_type}</td>
                    <td>
                      <Link href={`/admin/jobs/${job.id}/edit`} className="admin-btn admin-btn-secondary" style={{ marginRight: '5px' }}>
                        Edit
                      </Link>
                      <button 
                        className="admin-btn admin-btn-danger"
                        onClick={async () => {
                          if (confirm('Delete this job?')) {
                            const token = localStorage.getItem('auth_token');
                            await fetch(`/api/admin/jobs/${job.id}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });
                            window.location.reload();
                          }
                        }}
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
    </div>
  );
}