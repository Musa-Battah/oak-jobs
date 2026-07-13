'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import './Header.css';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

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
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/';
                }}
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