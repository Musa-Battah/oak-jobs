import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const emailTo = body?.email || process.env.EMAIL_TO || 'admin@oakjobs.online';

    // Send test email
    const result = await sendEmail({
      to: emailTo,
      subject: '✅ Zoho Mail Test - Oak Jobs',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4169E1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; color: #888; font-size: 12px; padding: 20px; }
            .success { color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Zoho Mail Test</h1>
            </div>
            <div class="content">
              <p><span class="success">✅ Email test successful!</span></p>
              <p>This is a test email from Oak Jobs to confirm that Zoho Mail integration is working correctly.</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>From:</strong> ${process.env.EMAIL_FROM || 'admin@oakjobs.online'}</p>
              <p><strong>To:</strong> ${emailTo}</p>
              <hr>
              <p><strong>Site:</strong> <a href="https://oakjobs.online">oakjobs.online</a></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Oak Jobs. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      to: emailTo,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}