'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '@/lib/slices/authSlice';
import type { User as ReduxUser, Wallet as ReduxWallet } from '@/lib/slices/authSlice';
import { AuthService } from '@/lib/services/authService';
import AuthPage from './AuthPage';
// Removed WalletOnboarding import - using simplified flow

type AuthPageState = 'loading' | 'login' | 'authenticated';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [authPageState, setAuthPageState] = useState<AuthPageState>('loading');
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user && token) {
      setAuthPageState('authenticated');
    } else if (token) {
      // Try to verify existing token
      checkAuthStatus();
    } else {
      setAuthPageState('login');
    }
  }, [isAuthenticated, user, token]);

  // Default redirect to dashboard after authentication is complete
  // This will only trigger if no specific redirectUrl was provided in the callbacks
  useEffect(() => {
    if (authPageState === 'authenticated' && !isLoading) {
      // We'll let the specific handlers handle redirects with their redirectUrl parameter
      // This is a fallback for when no redirectUrl is provided
      router.push('/dashboard');
    }
  }, [authPageState, isLoading, router]);

  const checkAuthStatus = async () => {
    try {
      dispatch(loginStart());
      
      const storedToken = localStorage.getItem('mariposa_token') || token;
      if (!storedToken) {
        setAuthPageState('login');
        return;
      }

      const userData = await AuthService.verifyToken(storedToken);
      
      dispatch(loginSuccess({
        user: userData.user,
        wallet: userData.wallet || {
          id: '',
          address: '',
          accountId: '',
          network: '',
          walletClass: 'trading',
          balance: {},
          isActive: true
        },
        token: storedToken
      }));
      setAuthPageState('authenticated');
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('mariposa_token');
      dispatch(loginFailure(error instanceof Error ? error.message : 'Auth check failed'));
      setAuthPageState('login');
    }
  };

  const handleAuthSuccess = (userData: any, redirectUrl?: string) => {
    if (userData.isNewUser) {
      // New user - create agent with the userId
      handleCreateAgent(userData.user, redirectUrl);
    } else {
      // Existing user - just login
      dispatch(loginSuccess({
        user: userData.user || userData,
        wallet: userData.wallet || {
          id: '',
          address: '',
          accountId: '',
          network: '',
          walletClass: 'trading',
          balance: {},
          isActive: true
        },
        token: userData.token
      }));
      setAuthPageState('authenticated');
      
      // If redirectUrl is provided, use it instead of the default dashboard redirect
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    }
  };

  const handleCreateAgent = async (user: any, redirectUrl?: string) => {
    try {
      console.log('🚀 Creating Hedera agent for user:', user.id);
      
      // Create agent using the real userId
      const agentData = await AuthService.createUserWithAgent({
        email: user.email,
        name: user.name,
        agentName: `${user.name} Agent`,
        userId: user.id // Pass the real userId
      });
      
      dispatch(loginSuccess({
        user: user,
        wallet: agentData.wallet || {
          id: '',
          address: '',
          accountId: '',
          network: '',
          walletClass: 'trading',
          balance: {},
          isActive: true
        },
        token: user.token
      }));
      setAuthPageState('authenticated');
      
      // If redirectUrl is provided, use it instead of the default dashboard redirect
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      setAuthPageState('login'); // Fall back to login page with error
    }
  };

  const handleNeedsOnboarding = async (email: string, redirectUrl?: string) => {
    // Simplified flow: create user and agent directly
    try {
      console.log('🚀 Creating new user and agent for:', email);
      
      // Call the simplified onboarding API
      const userData = await AuthService.createUserWithAgent({
        email,
        name: email.split('@')[0], // Use email prefix as default name
        agentName: `${email.split('@')[0]} Agent`
      });
      
      dispatch(loginSuccess({
        user: userData.user,
        wallet: userData.wallet || {
          id: '',
          address: '',
          accountId: '',
          network: '',
          walletClass: 'trading',
          balance: {},
          isActive: true
        },
        token: userData.token
      }));
      setAuthPageState('authenticated');
      
      // If redirectUrl is provided, use it instead of the default dashboard redirect
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('Failed to create user and agent:', error);
      // Fall back to login page with error
      setAuthPageState('login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mariposa_token');
    dispatch(logoutAction());
    setAuthPageState('login');
    // Redirect to home if on protected route
    if (pathname.startsWith('/(authenticated)')) {
      router.push('/');
    }
  };

  const handleBackToLogin = () => {
    setAuthPageState('login');
    setOnboardingEmail('');
  };

  // Show loading spinner while checking auth
  if (authPageState === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mariposa...</p>
        </div>
      </div>
    );
  }

  // Show login page
  if (authPageState === 'login') {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        onNeedsOnboarding={handleNeedsOnboarding}
      />
    );
  }

  // Simplified flow: no separate onboarding component needed

  // User is authenticated - show the main app
  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create auth context for use throughout the app
export const AuthContext = React.createContext<{
  user: ReduxUser | null;
  logout: () => void;
}>({
  user: null,
  logout: () => {}
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthWrapper');
  }
  return context;
};