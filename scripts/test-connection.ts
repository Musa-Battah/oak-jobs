import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing connection with individual params...');
  
  try {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });

    const result = await pool.query('SELECT NOW() as time');
    console.log('✅ Connected successfully!');
    console.log('📅 Server time:', result.rows[0].time);
    
    // Check existing tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Existing tables:', tables.rows.map(r => r.table_name));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();