'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import './Header.css';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const newIsLoggedIn = !!token;
    
    if (newIsLoggedIn !== isLoggedIn) {
      setIsLoggedIn(newIsLoggedIn);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <header className="site-header">
        <div className="header-container">
          <nav className="main-nav">
            <span className="nav-link">Loading...</span>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <nav className="main-nav" aria-label="Primary navigation">
          <Logo variant="default" />

          <Link href="/" className="nav-link home-link">
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/jobs-for-you" className="nav-link logged-in-only">
                My Jobs
              </Link>
              <Link href="/saved-jobs" className="nav-link logged-in-only">
                Saved Jobs
              </Link>
              <Link href="/complete-profile" className="nav-link logged-in-only">
                Update Profile
              </Link>
              <Link href="/admin" className="nav-link logged-in-only" style={{ color: '#4169E1' }}>
                ⚡ Admin
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="nav-link register-link">
                Register
              </Link>
              <Link href="/login" className="nav-link login-link">
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}