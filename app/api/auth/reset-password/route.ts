import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, generateResetToken } from '@/lib/auth';
import { sendEmail, getPasswordResetEmail } from '@/lib/email';

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
        { error: 'If an account exists with this email, a reset link has been sent.' },
        { status: 200 }
      );
    }

    const resetToken = generateResetToken(user.id, user.email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oakjobs.online';
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    const resetEmail = getPasswordResetEmail(user.username || 'User', resetLink);
    
    await sendEmail({
      to: email,
      subject: resetEmail.subject,
      html: resetEmail.html,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}