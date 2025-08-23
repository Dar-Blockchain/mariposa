'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  User,
  Wallet,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TransferDetails {
  from: string;
  to: string;
  amount: number;
  token: string;
  recipient: {
    name: string;
    address: string;
    category: string;
  };
}

interface TransferConfirmationProps {
  transferDetails: TransferDetails;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isExecuting?: boolean;
}

export default function TransferConfirmation({
  transferDetails,
  onConfirm,
  onCancel,
  isExecuting = false
}: TransferConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-800">Confirm Transfer</CardTitle>
              <p className="text-sm text-green-600 mt-1">
                Review and confirm the transaction details
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Ready to Execute
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transfer Summary */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-green-700">
              {transferDetails.amount} {transferDetails.token}
            </div>
            
            {/* From/To Flow */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">From</div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium">Your Agent</div>
                    <div className="text-xs text-gray-500">
                      {formatAddress(transferDetails.from)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mx-4">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">To</div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium">{transferDetails.recipient.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatAddress(transferDetails.recipient.address)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            Recipient Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{transferDetails.recipient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <Badge variant="outline" className="text-xs">
                {transferDetails.recipient.category}
              </Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Address:</span>
              <div className="text-right">
                <code className="text-xs bg-gray-100 px-1 rounded">
                  {transferDetails.recipient.address}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isExecuting}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
          >
            {isLoading || isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Transfer
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isExecuting}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1">
                <li>• This transaction cannot be reversed</li>
                <li>• Make sure the recipient address is correct</li>
                <li>• Transaction fees will be deducted from your balance</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}