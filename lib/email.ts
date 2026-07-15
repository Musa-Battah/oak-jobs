import nodemailer from 'nodemailer';

// Configure Zoho SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.zoho.com',
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

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const from = options.from || process.env.EMAIL_FROM || 'admin@oakjobs.online';
    
    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email failed:', error);
    throw error;
  }
}

// Test email function
export async function testEmail() {
  try {
    const result = await sendEmail({
      to: process.env.EMAIL_TO || 'admin@oakjobs.online',
      subject: '✅ Zoho Mail Test - Oak Jobs',
      html: `
        <h1>Zoho Mail Test</h1>
        <p>This is a test email from Oak Jobs to confirm Zoho Mail integration is working.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <hr>
        <p><strong>Site:</strong> <a href="https://oakjobs.online">oakjobs.online</a></p>
      `,
    });
    return result;
  } catch (error) {
    console.error('Test email failed:', error);
    throw error;
  }
}

// Email Templates
export function getWelcomeEmail(name: string, username: string) {
  return {
    subject: '🎉 Welcome to Oak Jobs!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4169E1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4169E1; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; color: #888; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Oak Jobs!</h1>
          </div>
          <div class="content">
            <p>Hi ${name || username},</p>
            <p>Thank you for joining Oak Jobs! We're excited to help you find your dream job.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li><strong>Complete your profile</strong> - Tell us about your preferences</li>
              <li><strong>Browse jobs</strong> - Explore opportunities in your field</li>
              <li><strong>Save jobs</strong> - Keep track of positions you're interested in</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://oakjobs.online/complete-profile" class="button">Complete Your Profile</a>
            </p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br><strong>The Oak Jobs Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Oak Jobs. All rights reserved.</p>
            <p><a href="https://oakjobs.online">oakjobs.online</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getJobAlertEmail(jobs: any[]) {
  const jobListHtml = jobs.map(job => `
    <li style="margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 5px; border-left: 4px solid #4169E1;">
      <h3 style="margin: 0 0 5px 0;"><a href="https://oakjobs.online/jobs/${job.id}" style="color: #4169E1; text-decoration: none;">${job.title}</a></h3>
      <p style="margin: 0; color: #666;">🏢 ${job.company_name} • 📍 ${job.job_location} • 💼 ${job.job_type}</p>
    </li>
  `).join('');

  return {
    subject: `📢 ${jobs.length} New Jobs Available on Oak Jobs!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4169E1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .job-list { list-style: none; padding: 0; }
          .button { display: inline-block; padding: 12px 24px; background: #4169E1; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; color: #888; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 New Jobs Available!</h1>
          </div>
          <div class="content">
            <p>Hello Oak Jobs User,</p>
            <p><strong>${jobs.length}</strong> new job${jobs.length > 1 ? 's' : ''} have been posted that might interest you:</p>
            <ul class="job-list">
              ${jobListHtml}
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://oakjobs.online/jobs" class="button">View All Jobs</a>
            </p>
            <p>Stay tuned for more opportunities!</p>
            <p>Best regards,<br><strong>The Oak Jobs Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Oak Jobs. All rights reserved.</p>
            <p><a href="https://oakjobs.online">oakjobs.online</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getPasswordResetEmail(name: string, resetLink: string) {
  return {
    subject: '🔐 Reset Your Password - Oak Jobs',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4169E1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4169E1; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; color: #888; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'User'},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
            <p>Best regards,<br><strong>The Oak Jobs Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Oak Jobs. All rights reserved.</p>
            <p><a href="https://oakjobs.online">oakjobs.online</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}