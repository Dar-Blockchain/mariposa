'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Wallet, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  Copy, 
  Download,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { AuthService } from '@/lib/services/authService';

interface WalletOnboardingProps {
  email: string;
  onComplete: (userData: any) => void;
  onBack: () => void;
}

type OnboardingStep = 'profile' | 'wallet-intro' | 'generate-wallet' | 'backup-warning' | 'show-mnemonic' | 'verify-mnemonic' | 'complete';

export default function WalletOnboarding({ email, onComplete, onBack }: WalletOnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile data
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  // Wallet data
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [verificationWords, setVerificationWords] = useState<number[]>([]);
  const [userVerificationInputs, setUserVerificationInputs] = useState<string[]>(['', '', '']);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const steps: { [key in OnboardingStep]: { title: string; description: string; progress: number } } = {
    'profile': { title: 'Tell us about yourself', description: 'We need some basic information to set up your account', progress: 16 },
    'wallet-intro': { title: 'Your Crypto Wallet', description: 'Learn about your new secure wallet', progress: 33 },
    'generate-wallet': { title: 'Generate Wallet', description: 'Creating your unique wallet', progress: 50 },
    'backup-warning': { title: 'Important Security Notice', description: 'Understanding wallet security', progress: 66 },
    'show-mnemonic': { title: 'Your Recovery Phrase', description: 'Save these words securely', progress: 83 },
    'verify-mnemonic': { title: 'Verify Recovery Phrase', description: 'Confirm you saved your words correctly', progress: 91 },
    'complete': { title: 'Welcome to Mariposa!', description: 'Your account is ready', progress: 100 }
  };

  useEffect(() => {
    if (step === 'generate-wallet') {
      generateWallet();
    }
  }, [step]);

  const generateWallet = () => {
    try {
      const newMnemonic = generateMnemonic();
      setMnemonic(newMnemonic);
      
      // Generate random positions for verification (3 words out of 12)
      const positions: number[] = [];
      while (positions.length < 3) {
        const pos = Math.floor(Math.random() * 12);
        if (!positions.includes(pos)) {
          positions.push(pos);
        }
      }
      setVerificationWords(positions.sort((a, b) => a - b));
      
      setTimeout(() => setStep('backup-warning'), 1000);
    } catch (err) {
      setError('Failed to generate wallet. Please try again.');
    }
  };

  const handleProfileNext = () => {
    if (!fullName.trim() || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setError('');
    setStep('wallet-intro');
  };

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      // You could add a toast notification here
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDownloadMnemonic = () => {
    const blob = new Blob([`MARIPOSA WALLET RECOVERY PHRASE\n\nEmail: ${email}\nDate: ${new Date().toISOString()}\n\nRecovery Phrase:\n${mnemonic}\n\nIMPORTANT: Keep this phrase safe and private. Anyone with this phrase can access your wallet.`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mariposa-wallet-recovery.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerifyMnemonic = () => {
    const mnemonicWords = mnemonic.split(' ');
    const isValid = verificationWords.every((pos, index) => 
      userVerificationInputs[index].toLowerCase().trim() === mnemonicWords[pos].toLowerCase()
    );

    if (!isValid) {
      setError('Verification failed. Please check the words and try again.');
      return;
    }

    setError('');
    setStep('complete');
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Generate wallet from mnemonic to get private key and address
      const { Wallet } = await import('ethers');
      const wallet = Wallet.fromPhrase(mnemonic);
      const walletAddress = wallet.address;
      const privateKey = wallet.privateKey;

      console.log('Generated wallet data:', { address: walletAddress, mnemonic: mnemonic });

      // Register user with wallet using the AuthService
      const data = await AuthService.registerWithWallet({
        name: fullName,
        email: email,
        walletAddress: walletAddress,
        privateKey: privateKey,
        userType: 'human'
      });

      if (data.success) {
        // Store token and complete onboarding
        localStorage.setItem('mariposa_token', data.data.token);
        onComplete({
          user: data.data.user,
          wallet: data.data.wallet,
          token: data.data.token
        });
      } else {
        setError(data.message || 'Failed to complete setup');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Progress value={currentStep.progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Step {Object.keys(steps).indexOf(step) + 1} of {Object.keys(steps).length}</p>
          </div>
          
          <CardTitle className="text-2xl font-bold">{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                />
                <p className="text-sm text-gray-500">This will be your unique identifier on Mariposa</p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleProfileNext} className="flex-1">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'wallet-intro' && (
            <div className="space-y-4">
              <div className="text-center">
                <Wallet className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔐 Your Personal Crypto Wallet</h3>
                  <p>We're creating a secure wallet just for you. This wallet will:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                    <li>Store your cryptocurrencies safely</li>
                    <li>Enable trading on Mariposa</li>
                    <li>Give you full control of your assets</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔑 Recovery Phrase</h3>
                  <p>You'll receive a 12-word recovery phrase. This is the master key to your wallet - keep it safe!</p>
                </div>
              </div>

              <Button onClick={() => setStep('generate-wallet')} className="w-full">
                Generate My Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'generate-wallet' && (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <p>Generating your secure wallet...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          )}

          {step === 'backup-warning' && (
            <div className="space-y-4">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-2">⚠️ CRITICAL: Save Your Recovery Phrase</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your recovery phrase is the ONLY way to restore your wallet</li>
                  <li>• If you lose it, you lose access to your funds FOREVER</li>
                  <li>• Mariposa cannot recover your wallet if you lose this phrase</li>
                  <li>• Never share it with anyone - not even Mariposa support</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-2">✅ Best Practices:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Write it down on paper and store safely</li>
                  <li>• Consider using a secure password manager</li>
                  <li>• Make multiple copies in different locations</li>
                  <li>• Never store it digitally unencrypted</li>
                </ul>
              </div>

              <Button onClick={() => setStep('show-mnemonic')} className="w-full">
                I Understand - Show My Recovery Phrase
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'show-mnemonic' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Your 12-Word Recovery Phrase</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {showMnemonic ? (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {mnemonic.split(' ').map((word, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-center">
                        <span className="text-xs text-gray-500">{index + 1}.</span>
                        <div className="font-mono">{word}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded border text-center">
                    <Eye className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">Click the eye icon to reveal your recovery phrase</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMnemonic}
                    disabled={!showMnemonic}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadMnemonic}
                    disabled={!showMnemonic}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="backup-confirmed"
                    checked={backupConfirmed}
                    onCheckedChange={(checked) => setBackupConfirmed(checked as boolean)}
                  />
                  <Label htmlFor="backup-confirmed" className="text-sm">
                    I have safely backed up my recovery phrase
                  </Label>
                </div>
              </div>

              <Button 
                onClick={() => setStep('verify-mnemonic')} 
                disabled={!backupConfirmed}
                className="w-full"
              >
                Continue to Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'verify-mnemonic' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                To confirm you've saved your recovery phrase, please enter the following words:
              </p>

              <div className="space-y-3">
                {verificationWords.map((wordIndex, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`word-${index}`}>
                      Word #{wordIndex + 1}
                    </Label>
                    <Input
                      id={`word-${index}`}
                      placeholder={`Enter word #${wordIndex + 1}`}
                      value={userVerificationInputs[index]}
                      onChange={(e) => {
                        const newInputs = [...userVerificationInputs];
                        newInputs[index] = e.target.value;
                        setUserVerificationInputs(newInputs);
                      }}
                    />
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleVerifyMnemonic} 
                disabled={userVerificationInputs.some(input => !input.trim())}
                className="w-full"
              >
                Verify Recovery Phrase
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Congratulations, {fullName}!</h3>
                <p className="text-gray-600">Your Mariposa account and crypto wallet are ready.</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold mb-2">What's Next:</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ Your wallet is secured with your recovery phrase</li>
                  <li>✅ You can now deposit cryptocurrencies</li>
                  <li>✅ Start trading on DragonSwap through Mariposa</li>
                  <li>✅ Access AI-powered trading agents</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms-accepted"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms-accepted" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
              </div>

              <Button 
                onClick={handleComplete} 
                disabled={loading || !termsAccepted}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up your account...
                  </>
                ) : (
                  <>
                    Enter Mariposa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 