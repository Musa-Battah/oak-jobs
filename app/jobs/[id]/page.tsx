import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import Link from 'next/link';

interface JobPageProps {
  params: {
    id: string;
  };
}

// Helper function to render markdown-like text
function renderMarkdown(text: string): string {
  if (!text) return '';

  // Bold **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Bullet points starting with • or -
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

  if (inList) {
    result += '</ul>';
  }

  return result;
}

async function getJob(id: number) {
  const cacheKey = CACHE_KEYS.JOB(id);
  
  // Try cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  const job = result.rows[0];

  if (job) {
    // Cache the result
    cache.set(cacheKey, job, CACHE_TTL.JOB);
  }

  return job;
}

export default async function SingleJobPage({ params }: JobPageProps) {
  const jobId = parseInt(params.id);

  if (isNaN(jobId)) {
    notFound();
  }

  const job = await getJob(jobId);

  if (!job) {
    notFound();
  }

  // Parse job_category if it's stored as string or null
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
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Back button */}
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

      {/* Company Name & Location */}
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

      {/* Company Logo */}
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
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Save Job Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          className="save-job-btn"
          data-id={job.id}
          data-title={job.title}
          data-url={`/jobs/${job.id}`}
          style={{
            background: 'transparent',
            border: '2px solid #4169E1',
            color: '#4169E1',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4169E1';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4169E1';
          }}
          onClick={() => {
            const btn = document.querySelector('.save-job-btn') as HTMLButtonElement;
            const id = btn.dataset.id;
            const title = btn.dataset.title;
            const url = btn.dataset.url;

            let saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');

            if (!saved.find((j: any) => j.id === id)) {
              saved.push({ id, title, url });
              localStorage.setItem('saved_jobs', JSON.stringify(saved));
              alert('⭐ Job saved!');
              btn.textContent = '⭐ Saved!';
              btn.style.background = '#4169E1';
              btn.style.color = '#fff';
            } else {
              alert('Already saved.');
            }
          }}
        >
          ⭐ Save Job
        </button>
      </div>

      {/* Job Content */}
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

      {/* ACF Fields */}
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

          // Special handling for application URL - show as button
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#27408B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#4169E1';
                    }}
                  >
                    📤 Apply Now
                  </a>
                </div>
              </div>
            );
          }

          // Special handling for application email
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

          // Default field rendering with markdown support
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

      {/* Footer Actions */}
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
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#444444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#333333';
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
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1e7e34';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#28a745';
            }}
          >
            📤 Apply Now
          </a>
        )}
      </div>

      {/* Add schema markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.content || '',
            "datePosted": job.created_at,
            "validThrough": job.job_expires,
            "employmentType": job.job_type,
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.company_name,
              "logo": job.company_logo || undefined,
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": job.job_location,
                "addressCountry": "Nigeria",
              }
            },
            ...(job.application_url && {
              "applicationUrl": job.application_url,
            }),
          }),
        }}
      />
    </main>
  );
}