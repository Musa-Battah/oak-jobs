'use client';

import type { Metadata } from "next";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import './admin.css';

// Metadata can't be exported from Client Component, so we'll remove it
// export const metadata: Metadata = {
//   title: "Admin Dashboard - Oak Jobs",
//   description: "Manage jobs and site content",
// };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login?redirect=/admin';
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  if (isLoading) {
    return <div>Loading...</div>;
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