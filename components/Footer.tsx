'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e0e0e0',
      padding: '30px 20px',
      marginTop: '40px',
      width: '100%',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '10px' }}>
          <Link href="/" style={{ 
            fontWeight: 'bold', 
            fontSize: '1.1rem', 
            color: '#333333', 
            textDecoration: 'none' 
          }}>
            Oak Jobs
          </Link>
          <span style={{ color: '#888', margin: '0 8px' }}>-</span>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>NGO Jobsite</span>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <a 
            href="https://t.me/oakjobs" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#4169E1',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
            }}
          >
            Join our Telegram for job alerts
          </a>
        </div>
        
        <div style={{ 
          color: '#999', 
          fontSize: '0.85rem',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '15px',
        }}>
          &copy; {new Date().getFullYear()} Oak Jobs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}