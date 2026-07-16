'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../globals.css';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token) {
      router.push('/login?redirect=/admin');
      return;
    }

    // Check if user is admin
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (!user.is_admin) {
          router.push('/');
          return;
        }
      } catch {
        router.push('/login?redirect=/admin');
        return;
      }
    } else {
      // If no user data, fetch it
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        if (!data.is_admin) {
          router.push('/');
        }
      })
      .catch(() => {
        router.push('/login?redirect=/admin');
      });
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image
              src="/logo.png"
              alt="Oak Jobs"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
            <h2>⚡ Oak Admin</h2>
          </div>
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