'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  count: number;
}

interface Location {
  id: number;
  name: string;
  count: number;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [showDropdowns, setShowDropdowns] = useState<{
    categories: boolean;
    locations: boolean;
  }>({
    categories: false,
    locations: false,
  });

  // Check login status and fetch user preferences
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        // Fetch categories and locations
        const statsRes = await fetch('/api/jobs/stats');
        const statsData = await statsRes.json();
        setCategories(statsData.industries || []);
        setLocations(statsData.regions || []);

        // Fetch user profile
        const profileRes = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSelectedCategories(profileData.preferred_job_category || []);
          setSelectedLocations(profileData.preferred_location || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preview job count when selections change
  useEffect(() => {
    const fetchPreview = async () => {
      if (selectedCategories.length === 0 && selectedLocations.length === 0) {
        setPreviewCount(null);
        return;
      }

      try {
        const response = await fetch('/api/jobs/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories: selectedCategories,
            locations: selectedLocations,
          }),
        });
        const data = await response.json();
        setPreviewCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching preview:', error);
      }
    };

    const timeoutId = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCategories, selectedLocations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferred_job_category: selectedCategories,
          preferred_location: selectedLocations,
        }),
      });

      if (response.ok) {
        setSuccessMessage('✅ Preferences saved successfully!');
        setTimeout(() => {
          router.push('/jobs-for-you?saved=1');
        }, 1500);
      } else {
        setSuccessMessage('❌ Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSuccessMessage('❌ An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDropdown = (type: 'categories' | 'locations') => {
    setShowDropdowns((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const selectAll = (type: 'categories' | 'locations') => {
    if (type === 'categories') {
      setSelectedCategories(categories.map((c) => c.name));
    } else {
      setSelectedLocations(locations.map((l) => l.name));
    }
  };

  const deselectAll = (type: 'categories' | 'locations') => {
    if (type === 'categories') {
      setSelectedCategories([]);
    } else {
      setSelectedLocations([]);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  if (isLoading) {
    return (
      <div className="complete-profile-wrapper">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="complete-profile-wrapper">
        <h2>🎯 Complete Your Profile</h2>
        <p style={{ textAlign: 'center', color: '#6c757d' }}>
          Please <Link href="/login">login</Link> to complete your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="complete-profile-wrapper">
      <h2>🎯 Complete Your Profile</h2>
      <p className="intro">
        Select your preferences to get personalized job recommendations.
      </p>

      {successMessage && (
        <div className="job-success">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Preferred Job Categories */}
        <div className="form-group">
          <label className="form-label">Preferred Job Categories</label>
          <div className="multi-select-wrapper">
            <div
              className="multi-select-trigger"
              onClick={() => toggleDropdown('categories')}
            >
              <span className="selected-count">
                {selectedCategories.length === 0
                  ? 'Select categories'
                  : selectedCategories.length === categories.length
                  ? `All ${categories.length} categories selected`
                  : `${selectedCategories.length} category${selectedCategories.length !== 1 ? 's' : ''} selected`}
              </span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <div
              className={`multi-select-dropdown ${showDropdowns.categories ? 'active' : ''}`}
            >
              <div className="dropdown-header">
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={() => selectAll('categories')}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="deselect-all-btn"
                  onClick={() => deselectAll('categories')}
                >
                  Deselect All
                </button>
              </div>
              <div className="dropdown-options">
                {categories.map((cat) => (
                  <label key={cat.name} className="option-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => toggleCategory(cat.name)}
                    />
                    <span>
                      {cat.name} <span style={{ color: '#6c757d', fontSize: '12px' }}>({cat.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="form-group">
          <label className="form-label">Preferred Locations</label>
          <div className="multi-select-wrapper">
            <div
              className="multi-select-trigger"
              onClick={() => toggleDropdown('locations')}
            >
              <span className="selected-count">
                {selectedLocations.length === 0
                  ? 'Select locations'
                  : selectedLocations.length === locations.length
                  ? `All ${locations.length} locations selected`
                  : `${selectedLocations.length} location${selectedLocations.length !== 1 ? 's' : ''} selected`}
              </span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <div
              className={`multi-select-dropdown ${showDropdowns.locations ? 'active' : ''}`}
            >
              <div className="dropdown-header">
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={() => selectAll('locations')}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="deselect-all-btn"
                  onClick={() => deselectAll('locations')}
                >
                  Deselect All
                </button>
              </div>
              <div className="dropdown-options">
                {locations.map((loc) => (
                  <label key={loc.name} className="option-item">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc.name)}
                      onChange={() => toggleLocation(loc.name)}
                    />
                    <span>
                      {loc.name} <span style={{ color: '#6c757d', fontSize: '12px' }}>({loc.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Preview */}
        {previewCount !== null && (
          <div className={`job-preview-box ${previewCount > 0 ? 'success' : 'warning'}`}>
            {previewCount > 0 ? (
              `🎯 ${previewCount} job${previewCount !== 1 ? 's' : ''} match your preferences!`
            ) : (
              '😔 No jobs match your current selections. Try selecting more options.'
            )}
          </div>
        )}

        <div className="form-submit">
          <input
            type="submit"
            value={isSaving ? 'Saving...' : 'Save Preferences'}
            disabled={isSaving}
          />
        </div>
      </form>

      {/* Telegram Notice */}
      <div className="telegram-notice">
        <p>📢 Join Our Telegram for Instant Alerts</p>
        <a
          href="https://t.me/oakjobs"
          className="telegram-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          📱 Join Telegram Channel
        </a>
      </div>
    </div>
  );
}