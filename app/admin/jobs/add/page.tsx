'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push('/login?redirect=/admin/jobs/add');
        return;
      }

      const categories = formData.job_category.split(',').map(c => c.trim()).filter(Boolean);
      
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          job_category: categories,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        router.push('/login?redirect=/admin/jobs/add');
        return;
      }

      if (response.ok) {
        router.push('/admin/jobs');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create job');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h2>Add New Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div className="admin-form-group">
          <label>Description</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Job description (supports **bold** and bullet points)"
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
            placeholder="https://example.com/logo.png"
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
          </select>
        </div>

        <div className="admin-form-group">
          <label>Salary</label>
          <input
            type="text"
            name="job_salary"
            value={formData.job_salary}
            onChange={handleChange}
            placeholder="e.g., ₦500,000 - ₦800,000"
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
          />
        </div>

        <div className="admin-form-group">
          <label>Experience Required</label>
          <input
            type="text"
            name="job_experience"
            value={formData.job_experience}
            onChange={handleChange}
            placeholder="e.g., 3+ years"
          />
        </div>

        <div className="admin-form-group">
          <label>Skills Required</label>
          <textarea
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
          />
        </div>

        <div className="admin-form-group">
          <label>Application URL</label>
          <input
            type="url"
            name="application_url"
            value={formData.application_url}
            onChange={handleChange}
            placeholder="https://example.com/apply"
          />
        </div>

        <div className="admin-form-group">
          <label>Application Email</label>
          <input
            type="email"
            name="application_email"
            value={formData.application_email}
            onChange={handleChange}
            placeholder="hr@company.com"
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Job'}
          </button>
          <Link href="/admin/jobs" className="admin-btn admin-btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}