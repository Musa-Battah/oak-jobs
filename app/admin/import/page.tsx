'use client';

import { useState, useRef } from 'react';

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('csv')) {
        alert('Please upload a CSV file');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv') && !droppedFile.type.includes('csv')) {
        alert('Please upload a CSV file');
        return;
      }
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/csv/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      
      // Clear file after successful import
      if (data.success) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setResult({ error: 'Failed to import CSV' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <h2>📥 Import Jobs from CSV</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>
        Upload a CSV file containing job listings. The first row should be headers.
      </p>

      <form onSubmit={handleImport}>
        {/* Drag and Drop Area */}
        <div 
          className={`admin-import-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#ffffff' : '#333333'}`,
            backgroundColor: dragActive ? '#1a1a1a' : 'transparent',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          {file ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
              <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                {file.name}
              </p>
              <p style={{ color: '#888', fontSize: '14px' }}>
                {formatFileSize(file.size)}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="admin-btn admin-btn-secondary"
                style={{ marginTop: '10px' }}
              >
                Remove File
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📂</div>
              <p style={{ color: '#ffffff', fontSize: '18px' }}>
                Drag & drop your CSV file here
              </p>
              <p style={{ color: '#888', fontSize: '14px' }}>
                or click to browse
              </p>
              <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
                Supported format: .csv
              </p>
            </div>
          )}
        </div>

        {/* Import Button */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            type="submit" 
            className="admin-btn admin-btn-primary" 
            disabled={isLoading || !file}
            style={{
              opacity: isLoading || !file ? 0.5 : 1,
              cursor: isLoading || !file ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Importing...' : '📤 Import CSV'}
          </button>
          {file && (
            <button
              type="button"
              onClick={handleReset}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: '#111', 
          borderRadius: '8px', 
          border: '1px solid #333' 
        }}>
          <h3>Import Results</h3>
          {result.error ? (
            <p style={{ color: '#dc3545' }}>❌ {result.error}</p>
          ) : result.success === false ? (
            <p style={{ color: '#dc3545' }}>❌ {result.message || 'Import failed'}</p>
          ) : (
            <div>
              <p style={{ color: '#28a745' }}>✅ {result.message || 'Import completed'}</p>
              <ul style={{ color: '#ccc', marginTop: '10px' }}>
                <li>📝 Jobs inserted: <strong>{result.inserted || 0}</strong></li>
                <li>🔄 Jobs updated: <strong>{result.updated || 0}</strong></li>
                <li>⏭️ Jobs skipped: <strong>{result.skipped || 0}</strong></li>
                <li>❌ Errors: <strong>{result.errors || 0}</strong></li>
                <li>📊 Total jobs in CSV: <strong>{result.total_jobs || 0}</strong></li>
                {result.duration_ms && (
                  <li>⏱️ Duration: <strong>{result.duration_ms}ms</strong></li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#0a0a0a', 
        borderRadius: '8px', 
        border: '1px solid #222' 
      }}>
        <h4 style={{ color: '#888', marginBottom: '10px' }}>📋 CSV Format Requirements</h4>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Your CSV should include these columns (at minimum):
        </p>
        <div style={{ 
          background: '#000', 
          padding: '10px', 
          borderRadius: '4px', 
          fontFamily: 'monospace', 
          fontSize: '12px',
          color: '#888',
          marginTop: '10px',
          overflowX: 'auto'
        }}>
          <code>
            post_title, company, job_location, job_type, job_category, application_url, post_content
          </code>
        </div>
        <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
          <strong>Note:</strong> <code>post_title</code>, <code>company</code>, <code>job_location</code>, and <code>job_type</code> are required.
          Other columns are optional.
        </p>
      </div>

      <style>{`
        .admin-import-area.drag-active {
          border-color: #ffffff !important;
          background-color: #1a1a1a !important;
        }
      `}</style>
    </div>
  );
}