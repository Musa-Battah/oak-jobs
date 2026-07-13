'use client';

import { useState } from 'react';

export default function AdminImportPage() {
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/csv/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
          Authorization: `Bearer ${token}`,
        },
        body: csvData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to import CSV' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>📥 Import Jobs from CSV</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>
        Paste your CSV data below. The first row should be headers.
      </p>

      <form onSubmit={handleImport}>
        <div className="admin-import-area">
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder={`title,company_name,job_location,job_type,job_category\nSenior Developer,TechStars,Lagos,Full-time,Technology\nMarketing Manager,Growth Inc,Abuja,Full-time,Marketing`}
            style={{ marginBottom: '15px' }}
          />
          <button type="submit" className="admin-btn admin-btn-primary" disabled={isLoading}>
            {isLoading ? 'Importing...' : '📤 Import CSV'}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
          <h3>Import Results</h3>
          {result.error ? (
            <p style={{ color: '#dc3545' }}>❌ {result.error}</p>
          ) : (
            <div>
              <p>✅ {result.message}</p>
              <ul style={{ color: '#ccc', marginTop: '10px' }}>
                <li>Imported: {result.imported || 0}</li>
                <li>Updated: {result.updated || 0}</li>
                <li>Skipped: {result.skipped || 0}</li>
                <li>Errors: {result.errors || 0}</li>
                <li>Total jobs in CSV: {result.total_jobs || 0}</li>
                <li>Duration: {result.duration_ms || 0}ms</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}