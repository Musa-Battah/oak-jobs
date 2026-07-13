import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
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

  // Bullet points
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

export default async function SingleJobPage({ params }: JobPageProps) {
  const jobId = parseInt(params.id);

  if (isNaN(jobId)) {
    notFound();
  }

  try {
    const result = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    const job = result.rows[0];

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
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          {job.title}
        </h1>

        {/* Company Logo */}
        {job.company_logo && (
          <div style={{ marginBottom: '20px' }}>
            <img
              src={job.company_logo}
              alt={`${job.company_name} logo`}
              style={{ maxWidth: '200px', borderRadius: '8px' }}
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
                alert('Job saved!');
              } else {
                alert('Already saved.');
              }
            }}
          >
            ⭐ Save Job
          </button>
        </div>

        {/* Job Content */}
        <div
          style={{
            padding: '15px',
            border: '2px solid #4169E1',
            borderRadius: '5px',
            marginBottom: '25px',
          }}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(job.content || ''),
          }}
        />

        {/* ACF Fields */}
        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '10px',
            padding: '20px',
            marginTop: '20px',
          }}
        >
          {fields.map((field) => {
            if (!field.value) return null;

            // Special handling for application URL
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
                        padding: '10px 16px',
                        borderRadius: '6px',
                        background: '#4169E1',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: '700',
                      }}
                    >
                      Apply Now
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
                    }}
                  >
                    Application Email:
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <a
                      href={`mailto:${job.application_email}`}
                      style={{ color: '#4169E1', textDecoration: 'underline', fontWeight: '600' }}
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
                  }}
                >
                  {field.label}:
                </div>
                <div
                  style={{ marginTop: '6px' }}
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(String(field.value)),
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#6c757d',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            ← Back to All Jobs
          </Link>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching job:', error);
    notFound();
  }
}