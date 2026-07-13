import { Suspense } from 'react';
import JobsList from '@/components/JobsList';

export default function JobsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ffffff' }}>All Jobs</h1>
      <Suspense fallback={
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px',
          color: '#cccccc',
          fontSize: '1.1rem'
        }}>
          Loading jobs...
        </div>
      }>
        <JobsList />
      </Suspense>
    </div>
  );
}