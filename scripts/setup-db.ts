import { query } from '../lib/db';

async function setupDatabase() {
  console.log('🔄 Setting up database schema...');

  try {
    // Create users table
    console.log('Creating users table...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_profiles table
    console.log('Creating user_profiles table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        preferred_job_category TEXT[] DEFAULT '{}',
        preferred_location TEXT[] DEFAULT '{}',
        bio TEXT,
        profile_picture VARCHAR(500),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    console.log('Creating jobs table...');
    await query(`
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
      )
    `);

    // Create saved_jobs table
    console.log('Creating saved_jobs table...');
    await query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_id)
      )
    `);

    // Create indexes
    console.log('Creating indexes...');
    await query(`CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs USING GIN (job_category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (job_location)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs (job_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs (created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs (user_id)`);

    console.log('✅ Database schema setup complete!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });