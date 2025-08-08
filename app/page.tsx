"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { loginSuccess } from '@/lib/slices/authSlice';
import AuthPage from '@/components/auth/AuthPage';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleAuth = (userData: any, redirectUrl?: string) => {
    try {
      const token = userData?.token || '';
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('mariposa_token', token);
      }

      // Build minimal wallet shape expected by auth slice if not provided
      const wallet = userData?.wallet || {
        id: '',
        address: userData?.walletAddress || '',
        accountId: userData?.walletAddress || '',
        network: 'hedera-testnet',
        walletClass: 'hedera',
        balance: {},
        isActive: true
      };

      // Normalize user shape for the store
      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        userType: userData.userType || 'human',
        walletAddress: userData.walletAddress || wallet.address,
        walletId: userData.walletId || wallet.id,
        createdAt: userData.createdAt || new Date().toISOString()
      };

      dispatch(
        loginSuccess({
          user,
          wallet,
          token
        })
      );

      router.replace(redirectUrl || '/dashboard');
    } catch (e) {
      // As a fallback, just go to dashboard; AuthWrapper on protected routes will verify
      router.replace('/dashboard');
    }
  };

  return (
    <AuthPage 
      onAuthSuccess={(user, redirectUrl) => handleAuth(user, redirectUrl)} 
      onNeedsOnboarding={(email, redirectUrl) => {
        // Our verify-otp already ensures agent creation; treat as success path
        handleAuth({ id: email, name: email.split('@')[0], email, userType: 'human', token: localStorage.getItem('mariposa_token') || '' }, redirectUrl);
      }} 
    />
  );
}