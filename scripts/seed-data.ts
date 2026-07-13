import { query } from '../lib/db';
import bcrypt from 'bcryptjs';

async function seedData() {
  console.log('🌱 Seeding sample data...');

  try {
    // Create a test user
    console.log('Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await query(
      `INSERT INTO users (email, username, display_name, password_hash) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id`,
      ['test@example.com', 'testuser', 'Test User', hashedPassword]
    );

    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const existingUser = await query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
      userId = existingUser.rows[0]?.id;
    }

    // Create sample jobs
    console.log('Creating sample jobs...');
    const sampleJobs = [
      {
        title: 'Senior Software Engineer',
        content: 'We are looking for a Senior Software Engineer to join our team. **Requirements:** • 5+ years of experience • Strong TypeScript skills • Experience with React and Next.js',
        company_name: 'Tech Corp',
        company_logo: 'https://via.placeholder.com/200',
        company_tagline: 'Building the future',
        job_location: 'Lagos',
        job_type: 'Full-time',
        job_salary: '₦500,000 - ₦800,000',
        job_category: ['Technology', 'Engineering'],
        required_qualifications: 'BSc in Computer Science or related field',
        job_experience: '5+ years',
        skills_required: 'TypeScript, React, Next.js, PostgreSQL',
        application_url: 'https://example.com/apply',
        application_email: 'hr@techcorp.com'
      },
      {
        title: 'Marketing Manager',
        content: 'Join our marketing team to drive growth. **Responsibilities:** • Develop marketing strategies • Manage social media • Analyze campaign performance',
        company_name: 'Growth Marketing Inc',
        company_logo: 'https://via.placeholder.com/200',
        company_tagline: 'Driving growth',
        job_location: 'Abuja',
        job_type: 'Full-time',
        job_salary: '₦400,000 - ₦600,000',
        job_category: ['Marketing', 'Business'],
        required_qualifications: 'BSc in Marketing or related field',
        job_experience: '3+ years',
        skills_required: 'Digital Marketing, Social Media, Analytics',
        application_url: 'https://example.com/apply/marketing',
        application_email: 'hr@growthmarketing.com'
      },
      {
        title: 'Remote Customer Support',
        content: 'Looking for a customer support specialist to help our users. **Benefits:** • Work from home • Flexible hours • Competitive salary',
        company_name: 'SupportHub',
        company_logo: 'https://via.placeholder.com/200',
        company_tagline: 'Supporting your success',
        job_location: 'Remote',
        job_type: 'Remote',
        job_salary: '₦250,000 - ₦350,000',
        job_category: ['Customer Service', 'Support'],
        required_qualifications: 'Excellent communication skills',
        job_experience: '1+ years',
        skills_required: 'Customer Support, Communication, Problem Solving',
        application_url: 'https://example.com/apply/support',
        application_email: 'hr@supporthub.com'
      },
      {
        title: 'Data Analyst',
        content: 'Join our data team to analyze and visualize data. **Skills:** • SQL • Python • Data Visualization • Business Intelligence',
        company_name: 'Data Insights Ltd',
        company_logo: 'https://via.placeholder.com/200',
        company_tagline: 'Turning data into insights',
        job_location: 'Port Harcourt',
        job_type: 'Full-time',
        job_salary: '₦450,000 - ₦650,000',
        job_category: ['Data', 'Analytics'],
        required_qualifications: 'BSc in Statistics or related field',
        job_experience: '3+ years',
        skills_required: 'SQL, Python, Tableau, Power BI',
        application_url: 'https://example.com/apply/data',
        application_email: 'hr@datainsights.com'
      }
    ];

    for (const job of sampleJobs) {
      await query(
        `INSERT INTO jobs (
          title, content, company_name, company_logo, company_tagline,
          job_location, job_type, job_salary, job_category,
          required_qualifications, job_experience, skills_required,
          application_url, application_email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT DO NOTHING`,
        [
          job.title, job.content, job.company_name, job.company_logo, job.company_tagline,
          job.job_location, job.job_type, job.job_salary, job.job_category,
          job.required_qualifications, job.job_experience, job.skills_required,
          job.application_url, job.application_email
        ]
      );
    }

    console.log('✅ Sample data seeded successfully!');
    console.log(`📝 Test user: test@example.com / password123`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });