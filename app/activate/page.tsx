'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ActivationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Activation token is missing. Please check your email for the activation link.');
      return;
    }

    const activate = async () => {
      try {
        const response = await fetch(`/api/auth/activate?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your account has been activated successfully!');
          
          // Redirect to complete profile after 3 seconds
          setTimeout(() => {
            router.push('/complete-profile');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Activation failed. The link may be expired or invalid.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during activation. Please try again.');
      }
    };

    activate();
  }, [searchParams, router]);

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '80px auto', 
      padding: '40px', 
      background: '#111111', 
      borderRadius: '12px', 
      border: '1px solid #333333',
      textAlign: 'center',
    }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#ffffff', marginBottom: '10px' }}>Activating Your Account</h2>
          <p style={{ color: '#888888' }}>Please wait...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Account Activated!</h2>
          <p style={{ color: '#cccccc' }}>{message}</p>
          <p style={{ color: '#888888', marginTop: '15px', fontSize: '14px' }}>
            Redirecting you to complete your profile...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Activation Failed</h2>
          <p style={{ color: '#cccccc' }}>{message}</p>
          <div style={{ marginTop: '20px' }}>
            <Link 
              href="/login"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#4169E1',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Go to Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        maxWidth: '500px', 
        margin: '80px auto', 
        padding: '40px', 
        textAlign: 'center',
        color: '#cccccc'
      }}>
        Loading...
      </div>
    }>
      <ActivationContent />
    </Suspense>
  );
}