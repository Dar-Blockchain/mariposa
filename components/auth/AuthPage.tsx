'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (userData: any) => void;
  onNeedsOnboarding: (email: string) => void;
}

export default function AuthPage({ onAuthSuccess, onNeedsOnboarding }: AuthPageProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGetCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call your backend API to send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Verification code sent to your email!');
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isNewUser) {
          // First time user - needs wallet onboarding
          onNeedsOnboarding(email);
        } else {
          // Existing user - proceed to app
          onAuthSuccess(data.user);
        }
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {step === 'email' ? (
              <Mail className="w-6 h-6 text-blue-600" />
            ) : (
              <Shield className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'email' ? 'Welcome to Mariposa' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your email to get started with secure crypto trading'
              : `We sent a 6-digit code to ${email}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGetCode()}
                  disabled={loading}
                />
              </div>

              <Button 
                onClick={handleGetCode} 
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Get Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  disabled={loading}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={handleVerifyOtp} 
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleBackToEmail}
                  disabled={loading}
                  className="text-sm"
                >
                  ← Back to email
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleGetCode}
                  disabled={loading}
                  className="text-sm text-blue-600"
                >
                  Resend code
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Secure authentication powered by email verification</p>
            <p className="mt-1">Your data is encrypted and protected</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 