import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// In production, use a proper database
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

    // Check if user exists in backend database
    const existingUser = await checkUserExists(email);

    if (existingUser) {
      // Existing user - generate JWT and return user data
      const token = sign(
        { 
          userId: existingUser._id, 
          email: existingUser.email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Login successful',
        isNewUser: false,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          userType: existingUser.userType,
          token
        }
      });
    } else {
      // New user - create user in backend database
      try {
        console.log(`📧 Creating new user for email: ${email}`);
        
        const createUserResponse = await fetch(`${BACKEND_URL}/api/users/register-with-wallet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: email.split('@')[0], // Use email prefix as name
            email: email,
            walletAddress: '0x0000000000000000000000000000000000000000', // Placeholder
            privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000', // Placeholder
            userType: 'human'
          }),
        });

        if (!createUserResponse.ok) {
          throw new Error('Failed to create user in backend');
        }

        const userResult = await createUserResponse.json();
        
        if (userResult.success && userResult.data?.user) {
          return NextResponse.json({
            message: 'User created successfully',
            isNewUser: true,
            user: {
              id: userResult.data.user._id,
              name: userResult.data.user.name,
              email: userResult.data.user.email,
              userType: userResult.data.user.userType,
              token: userResult.data.token
            }
          });
        } else {
          throw new Error(userResult.message || 'Failed to create user');
        }
      } catch (createError) {
        console.error('❌ Failed to create user:', createError);
        return NextResponse.json(
          { message: 'Failed to create user account' },
          { status: 500 }
        );
      }
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
  try {
    // Query backend database for existing user
    const response = await fetch(`${BACKEND_URL}/api/users/by-email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data.user : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return null;
  }
} 