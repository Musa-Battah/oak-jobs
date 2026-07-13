'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login?redirect=/admin');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#000',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>⚡ Oak Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">
            📊 Dashboard
          </Link>
          <Link href="/admin/jobs" className="admin-nav-link">
            💼 Jobs
          </Link>
          <Link href="/admin/jobs/add" className="admin-nav-link">
            ➕ Add Job
          </Link>
          <Link href="/admin/categories" className="admin-nav-link">
            📂 Categories
          </Link>
          <Link href="/admin/users" className="admin-nav-link">
            👥 Users
          </Link>
          <Link href="/admin/import" className="admin-nav-link">
            📥 Import Jobs
          </Link>
          <Link href="/" className="admin-nav-link" style={{ marginTop: 'auto', borderTop: '1px solid #333' }}>
            🔙 Back to Site
          </Link>
        </nav>
      </aside>
      <main className="admin-content">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <div className="admin-user">
            <span>👤 Admin</span>
            <button 
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="admin-body">
          {children}
        </div>
      </main>
    </div>
  );
}