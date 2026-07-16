'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        setSuccess('Registration successful! Please check your email to activate your account.');
        
        // Redirect to login page with message after 3 seconds
        setTimeout(() => {
          router.push('/login?message=Registration successful! Please check your email to activate your account.');
        }, 3000);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h1>Register</h1>
      <p className="subtitle">Create your Oak Jobs account</p>

      {success && (
        <div style={{ 
          background: 'rgba(40, 167, 69, 0.2)', 
          color: '#28a745', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          {success}
          <p style={{ fontSize: '0.85rem', marginTop: '5px', color: '#888' }}>
            Redirecting to login...
          </p>
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
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Choose a username"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Create a password (min 6 characters)"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!success}
          className="submit-btn"
          style={{
            opacity: isLoading || !!success ? 0.6 : 1,
            cursor: isLoading || !!success ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="auth-link">
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}