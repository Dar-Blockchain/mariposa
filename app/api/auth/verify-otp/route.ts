import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// In production, use a proper database
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();
const userStore = new Map<string, any>(); // Simulated user database

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { message: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    const emailKey = email.toLowerCase();
    const storedOtp = otpStore.get(emailKey);

    // Development fallback: accept hardcoded OTP when no stored OTP exists
    if (!storedOtp) {
      // In development, accept the hardcoded OTP
      if (process.env.NODE_ENV === 'development' || true) { // Always allow for now
        if (otp === '123456') {
          console.log(`🔓 [DEV MODE] Accepting hardcoded OTP for ${email}`);
          // Continue with user check below
        } else {
          return NextResponse.json(
            { message: 'OTP not found or expired. Use 123456 for development.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { message: 'OTP not found or expired' },
          { status: 400 }
        );
      }
    } else {
      // Check if OTP is expired
      if (Date.now() > storedOtp.expires) {
        otpStore.delete(emailKey);
        return NextResponse.json(
          { message: 'OTP has expired' },
          { status: 400 }
        );
      }

      // Check attempt limit (max 3 attempts)
      if (storedOtp.attempts >= 3) {
        otpStore.delete(emailKey);
        return NextResponse.json(
          { message: 'Too many failed attempts. Please request a new code.' },
          { status: 400 }
        );
      }

      // Verify OTP
      if (storedOtp.code !== otp) {
        storedOtp.attempts++;
        return NextResponse.json(
          { message: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // OTP is valid, remove it from store
      otpStore.delete(emailKey);
    }

    // Check if user exists
    const existingUser = userStore.get(emailKey);

    if (existingUser) {
      // Existing user - generate JWT and return user data
      const token = sign(
        { 
          userId: existingUser.id, 
          email: existingUser.email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Login successful',
        isNewUser: false,
        user: {
          ...existingUser,
          token
        }
      });
    } else {
      // New user - needs onboarding
      return NextResponse.json({
        message: 'Verification successful',
        isNewUser: true,
        email: email
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}

// Helper function to check if user exists in database
async function checkUserExists(email: string) {
  // In production, query your database
  // Example:
  /*
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  return user;
  */
  
  return userStore.get(email.toLowerCase());
} 