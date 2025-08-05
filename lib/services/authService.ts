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
}

export default AuthService; 