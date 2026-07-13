'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function JobSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/jobs/stats');
        const data = await response.json();
        setCategories((data.industries || []).map((i: any) => i.name));
        setLocations((data.regions || []).map((r: any) => r.name));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('s', keyword);
    if (category) params.append('job_category', category);
    if (location) params.append('job_location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="job-search-form">
      <input
        type="text"
        name="s"
        placeholder="Job title, company..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="search-input"
      />

      <select
        name="job_category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="search-select"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        name="job_location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="search-select"
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      <button type="submit" className="search-button">
        🔍 Search Jobs
      </button>
    </form>
  );
}