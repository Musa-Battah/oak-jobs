import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

async function checkData() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Check users
    const users = await pool.query('SELECT id, email, username, display_name FROM users');
    console.log('👤 Users:', users.rows);

    // Check jobs
    const jobs = await pool.query('SELECT id, title, company_name, job_location FROM jobs');
    console.log('💼 Jobs:', jobs.rows);
    console.log('   Total jobs:', jobs.rows.length);

    // Check user_profiles
    const profiles = await pool.query('SELECT * FROM user_profiles');
    console.log('📋 Profiles:', profiles.rows);

    await pool.end();
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkData();