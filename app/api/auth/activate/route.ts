import { NextRequest, NextResponse } from 'next/server';
import { activateUser, generateToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Activation token is required' },
        { status: 400 }
      );
    }

    const result = await activateUser(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Activation failed' },
        { status: 400 }
      );
    }

    // Generate JWT token for auto-login
    const jwtToken = generateToken(result.user!);

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully!',
      token: jwtToken,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        username: result.user?.username,
        is_active: result.user?.is_active,
        is_admin: result.user?.is_admin,
      },
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during activation' },
      { status: 500 }
    );
  }
}