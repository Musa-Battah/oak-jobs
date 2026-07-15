'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    company_name: '',
    company_logo: '',
    company_tagline: '',
    job_location: '',
    job_type: 'Full-time',
    job_salary: '',
    job_expires: '',
    job_category: '',
    required_qualifications: '',
    job_experience: '',
    skills_required: '',
    application_url: '',
    application_email: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        const data = await response.json();
        setJob(data);
        setFormData({
          title: data.title || '',
          content: data.content || '',
          company_name: data.company_name || '',
          company_logo: data.company_logo || '',
          company_tagline: data.company_tagline || '',
          job_location: data.job_location || '',
          job_type: data.job_type || 'Full-time',
          job_salary: data.job_salary || '',
          job_expires: data.job_expires || '',
          job_category: Array.isArray(data.job_category) ? data.job_category.join(', ') : '',
          required_qualifications: data.required_qualifications || '',
          job_experience: data.job_experience || '',
          skills_required: data.skills_required || '',
          application_url: data.application_url || '',
          application_email: data.application_email || '',
        });
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const categories = formData.job_category.split(',').map(c => c.trim()).filter(Boolean);
      
      const response = await fetch(`/api/admin/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          job_category: categories,
        }),
      });

      if (response.ok) {
        router.push('/admin/jobs');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update job');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return <div>Loading job...</div>;
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div>
      <h2>Edit Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Description</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
          />
        </div>

        <div className="admin-form-group">
          <label>Company Name *</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Company Logo URL</label>
          <input
            type="url"
            name="company_logo"
            value={formData.company_logo}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Company Tagline</label>
          <input
            type="text"
            name="company_tagline"
            value={formData.company_tagline}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Location *</label>
          <input
            type="text"
            name="job_location"
            value={formData.job_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <label>Job Type *</label>
          <select name="job_type" value={formData.job_type} onChange={handleChange} required>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Internship">Internship</option>
            <option value="Consultancy">Consultancy</option>
          </select>
        </div>

        <div className="admin-form-group">
          <label>Salary</label>
          <input
            type="text"
            name="job_salary"
            value={formData.job_salary}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Expiration Date</label>
          <input
            type="date"
            name="job_expires"
            value={formData.job_expires}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Categories (comma separated)</label>
          <input
            type="text"
            name="job_category"
            value={formData.job_category}
            onChange={handleChange}
            placeholder="e.g., Technology, Engineering, Marketing"
          />
        </div>

        <div className="admin-form-group">
          <label>Required Qualifications</label>
          <textarea
            name="required_qualifications"
            value={formData.required_qualifications}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="admin-form-group">
          <label>Experience Required</label>
          <input
            type="text"
            name="job_experience"
            value={formData.job_experience}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Skills Required</label>
          <textarea
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="admin-form-group">
          <label>Application URL</label>
          <input
            type="url"
            name="application_url"
            value={formData.application_url}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Application Email</label>
          <input
            type="email"
            name="application_email"
            value={formData.application_email}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/jobs" className="admin-btn admin-btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}