-- Users table (replacing Ultimate Member)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles (replacing ACF user fields)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    preferred_job_category TEXT[] DEFAULT '{}',
    preferred_location TEXT[] DEFAULT '{}',
    bio TEXT,
    profile_picture VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table (replacing WordPress posts + ACF)
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(500),
    company_tagline VARCHAR(255),
    job_location VARCHAR(255) NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    job_salary VARCHAR(100),
    job_expires DATE,
    job_category TEXT[] DEFAULT '{}',
    required_qualifications TEXT,
    job_experience VARCHAR(255),
    skills_required TEXT,
    application_url VARCHAR(500),
    application_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved jobs (replacing localStorage)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_category ON jobs USING GIN (job_category);
CREATE INDEX idx_jobs_location ON jobs (job_location);
CREATE INDEX idx_jobs_type ON jobs (job_type);
CREATE INDEX idx_jobs_created ON jobs (created_at DESC);
CREATE INDEX idx_saved_jobs_user ON saved_jobs (user_id);