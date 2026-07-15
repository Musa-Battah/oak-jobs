import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, findUserByUsername, createUser, generateActivationToken } from '@/lib/auth';
import { sendEmail, getActivationEmail, getAdminNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    const user = await createUser(email, username, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Generate activation token
    const activationToken = generateActivationToken(user.id, user.email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oakjobs.online';
    
    const activationLink = `${baseUrl}/activate?token=${activationToken}`;
    const pdfLink = `${baseUrl}/downloads/NGO_Insider_Report_2026.pdf`;
    const telegramLink = 'https://t.me/oakjobs';

    // Send activation email
    try {
      const activationEmail = getActivationEmail(username, activationLink, pdfLink, telegramLink);
      await sendEmail({
        to: email,
        subject: activationEmail.subject,
        html: activationEmail.html,
      });
      console.log('Activation email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
    }

    // Send admin notification
    try {
      const adminEmail = getAdminNotificationEmail(username, email);
      await sendEmail({
        to: process.env.EMAIL_TO || 'admin@oakjobs.online',
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
      console.log('Admin notification sent for:', email);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to activate your account.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}