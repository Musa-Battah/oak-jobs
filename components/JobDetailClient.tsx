'use client';

import { useState } from 'react';
import Link from 'next/link';

interface JobDetailClientProps {
  job: any;
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveJob = () => {
    const id = job.id;
    const title = job.title;
    const url = `/jobs/${job.id}`;

    let saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');

    if (!saved.find((j: any) => j.id === String(id))) {
      saved.push({ id: String(id), title, url });
      localStorage.setItem('saved_jobs', JSON.stringify(saved));
      setIsSaved(true);
      alert('⭐ Job saved!');
    } else {
      alert('Already saved.');
    }
  };

  // Helper to render markdown
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle bullet points
    const lines = html.split('\n');
    let inList = false;
    let result = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        const content = trimmed.replace(/^[•-]\s*/, '');
        result += `<li>${content}</li>`;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        if (trimmed) {
          result += `<p>${trimmed}</p>`;
        }
      }
    }
    if (inList) result += '</ul>';
    return result;
  };

  let categories: string[] = [];
  if (job.job_category) {
    if (Array.isArray(job.job_category)) {
      categories = job.job_category;
    } else if (typeof job.job_category === 'string') {
      try {
        categories = JSON.parse(job.job_category);
      } catch {
        categories = job.job_category.split(',').map((c: string) => c.trim());
      }
    }
  }

  const fields = [
    { key: 'company_name', label: 'Company', value: job.company_name },
    { key: 'company_tagline', label: 'Tagline', value: job.company_tagline },
    { key: 'job_location', label: 'Location', value: job.job_location },
    { key: 'job_type', label: 'Job Type', value: job.job_type },
    { key: 'job_salary', label: 'Salary', value: job.job_salary },
    { key: 'job_expires', label: 'Expires On', value: job.job_expires },
    { key: 'job_category', label: 'Category', value: categories.join(', ') },
    { key: 'required_qualifications', label: 'Qualifications', value: job.required_qualifications },
    { key: 'job_experience', label: 'Experience', value: job.job_experience },
    { key: 'skills_required', label: 'Skills', value: job.skills_required },
  ];

  return (
    <>
      <Link 
        href="/jobs" 
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          color: '#888',
          textDecoration: 'none',
          fontSize: '0.95rem',
        }}
      >
        ← Back to Jobs
      </Link>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#ffffff' }}>
        {job.title}
      </h1>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px', 
        marginBottom: '20px',
        color: '#cccccc',
        fontSize: '1.1rem',
      }}>
        {job.company_name && (
          <span>🏢 {job.company_name}</span>
        )}
        {job.job_location && (
          <span>📍 {job.job_location}</span>
        )}
        {job.job_type && (
          <span>💼 {job.job_type}</span>
        )}
      </div>

      {job.company_logo && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={job.company_logo}
            alt={`${job.company_name} logo`}
            style={{ 
              maxWidth: '200px', 
              maxHeight: '100px',
              objectFit: 'contain',
              borderRadius: '8px',
              background: '#ffffff',
              padding: '10px',
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button
          className="save-job-btn"
          onClick={handleSaveJob}
          style={{
            background: isSaved ? '#4169E1' : 'transparent',
            border: '2px solid #4169E1',
            color: isSaved ? '#ffffff' : '#4169E1',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        >
          {isSaved ? '⭐ Saved!' : '⭐ Save Job'}
        </button>
      </div>

      {job.content && (
        <div
          style={{
            padding: '20px',
            border: '1px solid #333333',
            borderRadius: '8px',
            marginBottom: '25px',
            background: '#111111',
            color: '#cccccc',
            lineHeight: '1.8',
          }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(job.content),
          }}
        />
      )}

      <div
        style={{
          background: '#111111',
          border: '1px solid #333333',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px',
        }}
      >
        <h3 style={{ color: '#ffffff', marginBottom: '15px', fontSize: '1.2rem' }}>
          📋 Job Details
        </h3>

        {fields.map((field) => {
          if (!field.value) return null;

          if (field.key === 'application_url' && job.application_url) {
            return (
              <div key={field.key} style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    padding: '5px 10px',
                    border: '2px solid #4169E1',
                    borderRadius: '5px',
                    display: 'inline-block',
                    color: '#4169E1',
                    marginBottom: '8px',
                  }}
                >
                  Apply Link:
                </div>
                <div style={{ marginTop: '6px' }}>
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: '#4169E1',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: '700',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    📤 Apply Now
                  </a>
                </div>
              </div>
            );
          }

          if (field.key === 'application_email' && job.application_email) {
            return (
              <div key={field.key} style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    padding: '5px 10px',
                    border: '2px solid #4169E1',
                    borderRadius: '5px',
                    display: 'inline-block',
                    color: '#4169E1',
                    marginBottom: '8px',
                  }}
                >
                  Application Email:
                </div>
                <div style={{ marginTop: '6px' }}>
                  <a
                    href={`mailto:${job.application_email}`}
                    style={{ 
                      color: '#4169E1', 
                      textDecoration: 'underline', 
                      fontWeight: '600' 
                    }}
                  >
                    {job.application_email}
                  </a>
                </div>
              </div>
            );
          }

          return (
            <div key={field.key} style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontWeight: 'bold',
                  padding: '5px 10px',
                  border: '2px solid #4169E1',
                  borderRadius: '5px',
                  display: 'inline-block',
                  color: '#4169E1',
                  marginBottom: '8px',
                }}
              >
                {field.label}:
              </div>
              <div
                style={{ 
                  marginTop: '6px',
                  color: '#cccccc',
                  lineHeight: '1.6',
                }}
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(String(field.value)),
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: '30px', 
        display: 'flex', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <Link
          href="/jobs"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#333333',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
          }}
        >
          ← Back to All Jobs
        </Link>

        {job.application_url && (
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: '#28a745',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '700',
            }}
          >
            📤 Apply Now
          </a>
        )}
      </div>
    </>
  );
}