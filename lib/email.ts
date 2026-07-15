import nodemailer from 'nodemailer';

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
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email failed:', error);
    throw error;
  }
}

export function getActivationEmail(name: string, activationLink: string, pdfLink: string, telegramLink: string) {
  return {
    subject: 'Welcome to Oak Jobs - Activate Your Account',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your Oak Jobs Account</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #4169E1; }
    .header img { max-width: 60px; height: auto; }
    .header h1 { color: #4169E1; font-size: 24px; margin: 10px 0 0 0; }
    .content { padding: 30px 20px; }
    .content h2 { color: #333333; font-size: 20px; margin-top: 0; }
    .content p { color: #555555; font-size: 15px; }
    .bonus-section { background: #f8f9fa; border-left: 4px solid #4169E1; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
    .bonus-section h3 { color: #4169E1; margin: 0 0 10px 0; font-size: 16px; }
    .bonus-section p { margin: 5px 0; color: #555555; }
    .bonus-section a { color: #4169E1; text-decoration: underline; }
    .button { display: inline-block; padding: 12px 30px; background-color: #4169E1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
    .button:hover { background-color: #27408B; }
    .divider { border: none; border-top: 1px solid #e0e0e0; margin: 25px 0; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888888; }
    .footer a { color: #4169E1; text-decoration: none; }
    .highlight { color: #4169E1; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://oakjobs.online/logo.png" alt="Oak Jobs Logo">
      <h1>Oak Jobs - NGO Jobsite</h1>
    </div>
    <div class="content">
      <h2>Welcome to Oak Jobs, ${name}!</h2>
      <p>Thank you for joining Oak Jobs. To get started, please complete the steps below.</p>
      
      <div class="bonus-section">
        <h3>Step 1: Join Our Telegram Channel</h3>
        <p>Get instant job alerts, NGO news, and career tips.</p>
        <p><a href="${telegramLink}" target="_blank">Click here to join the Oak Jobs Telegram channel</a></p>
      </div>
      
      <div class="bonus-section">
        <h3>Step 2: Download Free PDF Report</h3>
        <p>Get your free copy of "THE 2026 NGO INSIDER REPORT" with insights on the NGO sector, top employers, and career trends.</p>
        <p><a href="${pdfLink}" target="_blank">Download THE 2026 NGO INSIDER REPORT (PDF)</a></p>
      </div>
      
      <div class="bonus-section" style="border-left-color: #28a745;">
        <h3>Step 3: Activate Your Account</h3>
        <p>Click the button below to activate your account and start your job search.</p>
        <p style="text-align: center;">
          <a href="${activationLink}" class="button">Activate Your Account</a>
        </p>
        <p style="font-size: 13px; color: #888888;">This link expires in 24 hours.</p>
      </div>
      
      <hr class="divider">
      
      <p style="font-size: 14px; color: #666666;">By activating your account, you agree to receive job alerts and updates from Oak Jobs. You can unsubscribe at any time.</p>
      
      <p style="font-size: 15px; margin-top: 20px;">
        Best regards,<br>
        <strong>The Oak Jobs Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Oak Jobs. All rights reserved.</p>
      <p><a href="https://oakjobs.online">oakjobs.online</a> | <a href="https://t.me/oakjobs">Telegram</a></p>
      <p style="margin-top: 10px; font-size: 11px;">Oak Jobs - NGO Jobsite</p>
    </div>
  </div>
</body>
</html>
    `
  };
}

export function getPasswordResetEmail(name: string, resetLink: string) {
  return {
    subject: 'Reset Your Oak Jobs Password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #4169E1; }
    .header img { max-width: 60px; height: auto; }
    .header h1 { color: #4169E1; font-size: 24px; margin: 10px 0 0 0; }
    .content { padding: 30px 20px; }
    .content h2 { color: #333333; font-size: 20px; margin-top: 0; }
    .content p { color: #555555; font-size: 15px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #4169E1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
    .button:hover { background-color: #27408B; }
    .divider { border: none; border-top: 1px solid #e0e0e0; margin: 25px 0; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888888; }
    .footer a { color: #4169E1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://oakjobs.online/logo.png" alt="Oak Jobs Logo">
      <h1>Oak Jobs - NGO Jobsite</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hi ${name || 'User'},</p>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p style="font-size: 13px; color: #888888;">This link expires in 1 hour.</p>
      <hr class="divider">
      <p style="font-size: 14px; color: #666666;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
      <p style="font-size: 15px; margin-top: 20px;">
        Best regards,<br>
        <strong>The Oak Jobs Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Oak Jobs. All rights reserved.</p>
      <p><a href="https://oakjobs.online">oakjobs.online</a> | <a href="https://t.me/oakjobs">Telegram</a></p>
      <p style="margin-top: 10px; font-size: 11px;">Oak Jobs - NGO Jobsite</p>
    </div>
  </div>
</body>
</html>
    `
  };
}

export function getAdminNotificationEmail(name: string, email: string) {
  return {
    subject: 'New User Registration - Oak Jobs',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New User Registration</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
    .header { background: #4169E1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #ffffff; border-radius: 0 0 8px 8px; }
    .info { background: #f4f4f4; padding: 15px; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New User Registration</h1>
    </div>
    <div class="content">
      <p>A new user has registered on Oak Jobs.</p>
      <div class="info">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Log in to the admin panel to view more details.</p>
      <p><a href="https://oakjobs.online/admin">https://oakjobs.online/admin</a></p>
    </div>
  </div>
</body>
</html>
    `
  };
}