'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Industry {
  name: string;
  count: number;
}

interface Region {
  name: string;
  count: number;
}

export default function JobsByIndustryRegion() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/jobs/stats');
        const data = await response.json();
        setIndustries(data.industries || []);
        setRegions(data.regions || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="employment-wrapper">
        <div className="employment-item">
          <h2>Loading industries...</h2>
        </div>
        <div className="employment-item">
          <h2>Loading regions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="employment-wrapper">
      <div className="employment-item">
        <h2>
          Jobs by Industry
          <span className="job-count-badge">{industries.length} Categories</span>
        </h2>
        <div className="scroll-box">
          {industries.length === 0 ? (
            <p className="no-items">No industries found.</p>
          ) : (
            <ul>
              {industries.map((industry) => (
                <li key={industry.name}>
                  <Link
                    href={`/jobs?job_category=${encodeURIComponent(industry.name)}`}
                  >
                    {industry.name}
                    <span className="item-count">({industry.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="employment-item">
        <h2>
          Jobs by Region
          <span className="job-count-badge">{regions.length} Locations</span>
        </h2>
        <div className="scroll-box">
          {regions.length === 0 ? (
            <p className="no-items">No regions found.</p>
          ) : (
            <ul>
              {regions.map((region) => (
                <li key={region.name}>
                  <Link
                    href={`/jobs?job_location=${encodeURIComponent(region.name)}`}
                  >
                    {region.name}
                    <span className="item-count">({region.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}