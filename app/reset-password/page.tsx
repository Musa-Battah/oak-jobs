'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset link sent to your email. Please check your inbox.');
        setEmail('');
      } else {
        setError(data.error || 'Failed to send reset link');
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
        Reset Password
      </h1>
      <p style={{ textAlign: 'center', color: '#888888', marginBottom: '30px', fontSize: '0.95rem' }}>
        Enter your email and we'll send you a reset link.
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
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
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
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#888888' }}>
        Remember your password? <Link href="/login" style={{ color: '#4169E1', fontWeight: '600' }}>Login</Link>
      </p>
    </div>
  );
}