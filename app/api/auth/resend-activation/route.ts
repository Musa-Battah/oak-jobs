import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, generateActivationToken } from '@/lib/auth';
import { sendEmail, getActivationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.is_active) {
      return NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      );
    }

    // Generate new activation token
    const activationToken = generateActivationToken(user.id, user.email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oakjobs.online';
    const activationLink = `${baseUrl}/activate?token=${activationToken}`;
    const pdfLink = `${baseUrl}/downloads/NGO_Insider_Report_2026.pdf`;
    const telegramLink = 'https://t.me/oakjobs';

    const activationEmail = getActivationEmail(user.username, activationLink, pdfLink, telegramLink);
    
    console.log('📧 Resending activation email to:', email);
    console.log('   Activation link:', activationLink);
    
    await sendEmail({
      to: email,
      subject: activationEmail.subject,
      html: activationEmail.html,
    });

    return NextResponse.json({
      success: true,
      message: 'Activation email resent successfully! Please check your inbox (and spam folder).',
    });
  } catch (error) {
    console.error('❌ Resend activation error:', error);
    return NextResponse.json(
      { error: 'Failed to resend activation email' },
      { status: 500 }
    );
  }
}