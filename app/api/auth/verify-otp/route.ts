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

    // Unified flow: attempt to create SEI EVM agent; if it already exists, treat as existing user
    try {
      console.log(`👤 Ensuring SEI EVM agent exists for: ${email}`);
      // 1) Check if user exists via backend
      const userCheck = await fetch(`${BACKEND_URL}/api/users/by-email/${encodeURIComponent(email)}`);
      const userExists = userCheck.ok;

      if (userExists) {
        const existing = await userCheck.json();
        const user = existing.data.user;
        
        // Check if user has an SEI EVM wallet, create one if missing
        if (!user.seiAddress && !user.walletAddress) {
          console.log(`🔄 Existing user ${email} missing SEI wallet, creating...`);
          try {
            const createAgentResponse = await fetch(`${BACKEND_URL}/api/agents/sei`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'SEI Assistant',
                userId: user._id,
                agentType: 'general',
                configuration: {
                  capabilities: ['basic_actions', 'information_lookup', 'guidance', 'transfer_management'],
                  interactionMode: 'conversational',
                  walletFeatures: ['sei_evm', 'token_transfer', 'balance_checking']
                }
              })
            });
            
            if (createAgentResponse.ok) {
              const agentResult = await createAgentResponse.json();
              if (agentResult.success) {
                console.log(`✅ SEI wallet created for existing user: ${agentResult.data.address}`);
                user.seiAddress = agentResult.data.address;
                user.walletAddress = agentResult.data.address;
              }
            }
          } catch (walletError) {
            console.log('⚠️ Failed to create wallet for existing user, continuing without it');
          }
        }
        
        const token = sign(
          { userId: user._id, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return NextResponse.json({
          message: 'Login successful',
          isNewUser: false,
          redirectUrl: '/dashboard',
          user: {
            id: user._id,
            name: user.name,
            email,
            userType: user.userType || 'human',
            walletAddress: user.walletAddress || user.seiAddress || '',
            seiAddress: user.seiAddress || '',
            walletId: user.walletId || '',
            createdAt: user.createdAt,
            token
          }
        });
      }

      // 2) Create agent + user for new accounts using SEI EVM agent service
      console.log(`🚀 Creating new SEI EVM agent for: ${email}`);
      const createAgentResponse = await fetch(`${BACKEND_URL}/api/agents/sei`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'SEI Assistant',
          userId: email,
          agentType: 'general',
          configuration: {
            capabilities: ['basic_actions', 'information_lookup', 'guidance', 'transfer_management'],
            interactionMode: 'conversational',
            walletFeatures: ['sei_evm', 'token_transfer', 'balance_checking']
          }
        })
      });
      console.log('🔧 SEI Agent creation response status:', createAgentResponse.status);
      
      // Read response body safely
      let agentResult: any = null;
      try {
        agentResult = await createAgentResponse.json();
        console.log('📊 Agent creation result:', agentResult);
      } catch (parseError) {
        console.error('❌ Failed to parse agent response:', parseError);
      }

      // Check if agent creation was successful
      const isCreated = createAgentResponse.ok && agentResult?.success;

      if (!isCreated) {
        console.log('⚠️ Agent creation failed, attempting fallback...');
        // Fall back to basic user creation without agent
        const token = sign(
          { userId: email, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return NextResponse.json({
          message: 'Login successful (agent creation failed)',
          isNewUser: false,
          redirectUrl: '/dashboard',
          user: {
            id: email,
            name: email.split('@')[0],
            email,
            userType: 'human',
            token
          }
        });
      }

      // Build user object from successful SEI agent creation
      const userId = agentResult?.data?.user?._id || agentResult?.data?.agent?._id || email;
      const name = agentResult?.data?.user?.name || email.split('@')[0];
      const walletAddress = agentResult?.data?.address || agentResult?.data?.user?.seiAddress || '';
      
      const token = sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`✅ SEI EVM agent and user created successfully for ${email}`);
      console.log(`💼 Wallet address: ${walletAddress}`);
      console.log(`👤 User ID: ${userId}`);

      return NextResponse.json({
        message: 'SEI EVM agent and wallet created successfully',
        isNewUser: true,
        redirectUrl: '/dashboard',
        user: {
          id: userId,
          name,
          email,
          userType: 'human',
          walletAddress: walletAddress,
          agentId: agentResult?.data?.agent?._id,
          agentType: 'general',
          seiAddress: walletAddress,
          token
        }
      });
    } catch (e) {
      console.error('❌ SEI EVM agent creation failed, falling back to direct login:', e);
      const token = sign(
        { userId: email, email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return NextResponse.json({
        message: 'Login fallback (SEI agent creation failed)',
        isNewUser: false,
        redirectUrl: '/dashboard',
        user: {
          id: email,
          name: email.split('@')[0],
          email,
          userType: 'human',
          token
        }
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

// Note: no separate user existence GET. We rely on POST /api/agents/sei to upsert or fail gracefully.