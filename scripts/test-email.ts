import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testEmail() {
  console.log('📧 Testing Zoho Mail SMTP...\n');

  // Check environment variables
  const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = requiredEnv.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    console.log('\nPlease add these to your .env.local file:');
    console.log('EMAIL_HOST=smtp.zoho.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_SECURE=false');
    console.log('EMAIL_USER=admin@oakjobs.online');
    console.log('EMAIL_PASS=your-app-password');
    console.log('EMAIL_FROM=admin@oakjobs.online');
    console.log('EMAIL_TO=admin@oakjobs.online');
    return;
  }

  console.log('✅ Environment variables loaded:');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Password: ${'*'.repeat(process.env.EMAIL_PASS?.length || 0)}`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log('\n📤 Sending test email...');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'admin@oakjobs.online',
      to: process.env.EMAIL_TO || 'admin@oakjobs.online',
      subject: '✅ Test Email - Oak Jobs',
      html: `
        <h1>✅ Zoho Mail Test</h1>
        <p>This is a test email from Oak Jobs!</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><strong>MX Records:</strong> Verified ✅</p>
        <p><strong>DNS:</strong> Configured ✅</p>
        <p><strong>SMTP:</strong> Working ✅</p>
        <hr>
        <p><a href="https://oakjobs.online">oakjobs.online</a></p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${info.envelope?.to?.join(', ')}`);
    console.log('\n📬 Check your inbox at: https://mail.zoho.com');
    
  } catch (error: any) {
    console.error('❌ Email failed:', error.message);
    console.error('   Details:', error);
  }
}

testEmail();