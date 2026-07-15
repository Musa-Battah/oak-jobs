'use client';

import { useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordConfirmContent() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = params.token as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '80px auto', 
      padding: '40px', 
      background: '#111111', 
      borderRadius: '12px', 
      border: '1px solid #333333' 
    }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center', color: '#ffffff' }}>
        Set New Password
      </h1>
      <p style={{ textAlign: 'center', color: '#888888', marginBottom: '30px', fontSize: '0.95rem' }}>
        Enter your new password below.
      </p>

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
          <label style={{ display: 'block', fontWeight: '600', color: '#cccccc', marginBottom: '6px' }}>
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Enter new password"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #333333',
              borderRadius: '8px',
              fontSize: '16px',
              background: '#0a0a0a',
              color: '#ffffff',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#cccccc', marginBottom: '6px' }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Confirm new password"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #333333',
              borderRadius: '8px',
              fontSize: '16px',
              background: '#0a0a0a',
              color: '#ffffff',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#4169E1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#888888' }}>
        <Link href="/login" style={{ color: '#4169E1', fontWeight: '600' }}>Back to Login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
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
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}