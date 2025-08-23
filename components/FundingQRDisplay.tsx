'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode,
  Copy,
  RefreshCw,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download
} from 'lucide-react';

interface FundingInstructions {
  status: string;
  shortfall: number;
  currentBalance: number;
  requiredAmount: number;
  walletAddress: string;
  qrCode: {
    qrCodeDataURL: string;
    qrCodeSVG: string;
    paymentURI: string;
  };
  instructions: string[];
  estimatedWaitTime: string;
  autoRefreshEnabled: boolean;
}

interface FundingQRDisplayProps {
  fundingInfo: FundingInstructions;
  token: string;
  onRefreshBalance: () => void;
  onFundingComplete?: () => void;
  isCheckingBalance?: boolean;
}

export default function FundingQRDisplay({
  fundingInfo,
  token,
  onRefreshBalance,
  onFundingComplete,
  isCheckingBalance = false
}: FundingQRDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes countdown
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!fundingInfo.autoRefreshEnabled) return;

    const interval = setInterval(() => {
      setAutoRefreshCount(prev => prev + 1);
      onRefreshBalance();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fundingInfo.autoRefreshEnabled, onRefreshBalance]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0 && onFundingComplete) {
          onFundingComplete();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onFundingComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = fundingInfo.qrCode.qrCodeDataURL;
    link.download = `${token}-funding-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-800">Fund Your Wallet</CardTitle>
              <p className="text-sm text-blue-600 mt-1">
                Send {token} to complete your transfer
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Insufficient Funds
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
            <div className="text-lg font-bold text-red-600">
              {fundingInfo.currentBalance.toFixed(6)}
            </div>
            <div className="text-sm text-gray-600">Current Balance</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
            <div className="text-lg font-bold text-blue-600">
              {fundingInfo.requiredAmount.toFixed(6)}
            </div>
            <div className="text-sm text-gray-600">Required Amount</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
            <div className="text-lg font-bold text-orange-600">
              {fundingInfo.shortfall.toFixed(6)}
            </div>
            <div className="text-sm text-gray-600">Need to Send</div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-lg p-6 border border-blue-200">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              Scan to Send {token}
            </h3>
            
            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                <img 
                  src={fundingInfo.qrCode.qrCodeDataURL} 
                  alt="Funding QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Or send manually to:</p>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                  {fundingInfo.walletAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(fundingInfo.walletAddress, 'Address')}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(fundingInfo.qrCode.paymentURI, 'Payment URI')}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy URI'}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Instructions
          </h4>
          <ul className="space-y-2">
            {fundingInfo.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        {/* Status and Timer */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                Estimated wait time: {fundingInfo.estimatedWaitTime}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Session expires in: {formatTime(timeRemaining)}
            </div>
          </div>
          
          {fundingInfo.autoRefreshEnabled && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw className={`w-3 h-3 ${isCheckingBalance ? 'animate-spin' : ''}`} />
              Auto-checking balance every 30s (checked {autoRefreshCount} times)
            </div>
          )}
        </div>

        {/* Manual Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={onRefreshBalance}
            disabled={isCheckingBalance}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
          >
            {isCheckingBalance ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking Balance...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Balance Now
              </>
            )}
          </Button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1 text-xs">
                <li>• Send exactly {fundingInfo.shortfall.toFixed(6)} {token} or more</li>
                <li>• Only send {token} tokens to this address</li>
                <li>• Transaction may take 1-5 minutes to confirm</li>
                <li>• Keep this page open to monitor progress</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
