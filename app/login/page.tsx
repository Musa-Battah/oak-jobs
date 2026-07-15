'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const message = searchParams.get('message') || '';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        window.dispatchEvent(new CustomEvent('authChange'));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'auth_token',
          newValue: data.token,
        }));
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h1>Login</h1>
      <p className="subtitle">Welcome back to Oak Jobs</p>

      {message && (
        <div style={{ 
          background: 'rgba(40, 167, 69, 0.2)', 
          color: '#28a745', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ 
          background: 'rgba(220, 53, 69, 0.2)', 
          color: '#dc3545', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <Link href="/reset-password" style={{ color: '#888', fontSize: '0.9rem', textDecoration: 'underline' }}>
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="auth-link">
        Don't have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        maxWidth: '400px', 
        margin: '80px auto', 
        padding: '40px', 
        textAlign: 'center',
        color: '#cccccc'
      }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}