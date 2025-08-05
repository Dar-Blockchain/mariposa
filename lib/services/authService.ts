import { API_ENDPOINTS, DEFAULT_FETCH_OPTIONS, createAuthenticatedRequest } from '@/lib/config/api';
import type { User, Wallet } from '@/lib/slices/authSlice';

export interface RegisterWithWalletRequest {
  name: string;
  email: string;
  walletAddress: string;
  privateKey: string;
  userType?: 'human' | 'agent';
}

export interface RegisterWithWalletResponse {
  success: boolean;
  data: {
    user: User;
    wallet: Wallet;
    token: string;
  };
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface VerifyTokenResponse {
  user: User;
  wallet?: Wallet;
}

export interface CreateUserWithAgentRequest {
  email: string;
  name: string;
  agentName: string;
  userId?: string; // Add userId parameter for existing users
}

export interface CreateUserWithAgentResponse {
  success: boolean;
  user: User;
  agent: any;
  wallet?: Wallet;
  token: string;
  message: string;
}

export class AuthService {
  static async registerWithWallet(data: RegisterWithWalletRequest): Promise<RegisterWithWalletResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER_WITH_WALLET, {
        method: 'POST',
        ...DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        ...DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_TOKEN, createAuthenticatedRequest(token));

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Token verification failed');
      }

      return result;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  static async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        ...DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }

      return result;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<{ success: boolean; needsOnboarding?: boolean }> {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        ...DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      return result;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  static async createUserWithAgent(data: CreateUserWithAgentRequest): Promise<CreateUserWithAgentResponse> {
    try {
      // Create agent directly with the input format you provided
      const agentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/hedera`, {
        method: 'POST',
        ...DEFAULT_FETCH_OPTIONS,
        body: JSON.stringify({
          name: data.agentName || `${data.name} Agent`,
          userId: data.userId || data.email, // Use real userId if provided, fallback to email
          agentType: "actions",
          configuration: {
            supportedActions: [
              "transfer",
              "swap", 
              "stake"
            ],
            executionMode: "guided",
            maxTransactionValue: 500,
            confirmationRequired: true
          },
          hederaOptions: {
            initialBalance: 30
          }
        }),
      });

      const agentResult = await agentResponse.json();

      if (!agentResponse.ok) {
        throw new Error(agentResult.message || 'Failed to create agent');
      }

      // Extract user info from agent response or create basic user object
      let user;
      let token;
      
      if (agentResult.data.user) {
        // If backend created/returned user info
        user = agentResult.data.user;
        token = agentResult.data.token || btoa(`${data.email}:${Date.now()}`);
      } else {
        // Fallback: create basic user object
        user = {
          id: data.email,
          name: data.name,
          email: data.email,
          userType: 'human',
          createdAt: new Date().toISOString()
        };
        token = btoa(`${data.email}:${Date.now()}`);
      }

      // Return result matching the expected format
      return {
        success: true,
        user: user,
        agent: agentResult.data.agent,
        wallet: {
          accountId: agentResult.data.hedera.accountId,
          address: agentResult.data.hedera.accountId,
          network: agentResult.data.hedera.network,
          balance: { native: agentResult.data.hedera.initialBalance },
          isActive: true
        },
        token: token,
        message: 'Agent created successfully with Hedera wallet'
      };
    } catch (error) {
      console.error('Create agent error:', error);
      throw error;
    }
  }
}

export default AuthService; 