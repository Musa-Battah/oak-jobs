'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#111111',
      borderTop: '1px solid #333333',
      padding: '40px 20px',
      marginTop: '40px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <h3 style={{ color: '#ffffff', marginBottom: '5px' }}>Oak Jobs</h3>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>NGO Jobsite</p>
        </div>
        <div style={{ color: '#666', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Oak Jobs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}