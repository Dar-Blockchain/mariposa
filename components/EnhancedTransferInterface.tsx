'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send,
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  Wallet,
  QrCode
} from 'lucide-react';

import TransferArgumentsForm from './TransferArgumentsForm';
import FundingQRDisplay from './FundingQRDisplay';

interface EnhancedTransferInterfaceProps {
  userId: string;
  onTransferComplete?: (result: any) => void;
}

export default function EnhancedTransferInterface({
  userId,
  onTransferComplete
}: EnhancedTransferInterfaceProps) {
  const [transferMessage, setTransferMessage] = useState('');
  const [transferState, setTransferState] = useState<'input' | 'missing_args' | 'insufficient_funds' | 'confirmation' | 'processing' | 'completed'>('input');
  const [processingData, setProcessingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialTransfer = async () => {
    if (!transferMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/transfer/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transferMessage,
          userId: userId
        })
      });

      const result = await response.json();
      console.log('📊 Transfer processing result:', result);

      setProcessingData(result.data);

      if (result.success) {
        if (result.data.status === 'ready_to_execute') {
          setTransferState('confirmation');
        } else {
          setTransferState('completed');
        }
      } else {
        switch (result.data.status) {
          case 'missing_arguments':
            setTransferState('missing_args');
            break;
          case 'insufficient_funds':
            setTransferState('insufficient_funds');
            break;
          case 'recipient_not_found':
            setTransferState('missing_args');
            break;
          default:
            console.error('Transfer processing failed:', result.data.error);
        }
      }
    } catch (error) {
      console.error('Transfer processing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transfer/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          providedArguments: formData
        })
      });

      const result = await response.json();
      console.log('📊 Transfer completion result:', result);

      setProcessingData(result.data);

      if (result.success) {
        if (result.data.status === 'ready_to_execute') {
          setTransferState('confirmation');
        } else if (result.data.status === 'insufficient_funds') {
          setTransferState('insufficient_funds');
        }
      }
    } catch (error) {
      console.error('Transfer completion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTransfer = async () => {
    setIsLoading(true);
    setTransferState('processing');

    try {
      const response = await fetch('/api/transfer/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          transferDetails: processingData.transferDetails
        })
      });

      const result = await response.json();
      console.log('📊 Transfer execution result:', result);

      if (result.success) {
        setTransferState('completed');
        setProcessingData({ ...processingData, execution: result.execution });
        
        if (onTransferComplete) {
          onTransferComplete(result);
        }
      } else {
        console.error('Transfer execution failed:', result.error);
      }
    } catch (error) {
      console.error('Transfer execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!processingData) return;

    try {
      const response = await fetch(`/api/transfer/balance?userId=${userId}&token=${processingData.transferDetails?.token || 'SEI'}&amount=${processingData.transferDetails?.amount || 1}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('📊 Balance check result:', result);

      if (result.success && result.balance.success) {
        // Balance is now sufficient
        setTransferState('confirmation');
        setProcessingData({
          ...processingData,
          status: 'ready_to_execute'
        });
      }
    } catch (error) {
      console.error('Balance refresh error:', error);
    }
  };

  const resetTransfer = () => {
    setTransferState('input');
    setProcessingData(null);
    setTransferMessage('');
  };

  const renderInputState = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Enhanced Transfer
        </CardTitle>
        <p className="text-sm text-gray-600">
          Send tokens with smart argument validation and contact resolution
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Transfer Message
          </label>
          <Input
            placeholder="e.g., transfer 1 SEI to Alice, send 10 USDC to my friend Bob"
            value={transferMessage}
            onChange={(e) => setTransferMessage(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Supports: amount, token, recipient name or address
          </div>
          <Button
            onClick={handleInitialTransfer}
            disabled={!transferMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Process Transfer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderMissingArgsState = () => (
    <TransferArgumentsForm
      formSchema={processingData.formSchema}
      missingArguments={processingData.missingArguments}
      argumentAnalysis={processingData.argumentAnalysis}
      onSubmit={handleFormSubmit}
      onCancel={resetTransfer}
      isLoading={isLoading}
    />
  );

  const renderInsufficientFundsState = () => (
    <FundingQRDisplay
      fundingInfo={processingData.fundingInstructions}
      token={processingData.transferDetails?.token || 'SEI'}
      onRefreshBalance={handleRefreshBalance}
      onFundingComplete={() => setTransferState('confirmation')}
      isCheckingBalance={isLoading}
    />
  );

  const renderConfirmationState = () => (
    <Card className="w-full max-w-2xl mx-auto border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Confirm Transfer
        </CardTitle>
        <p className="text-sm text-green-600">
          Please review and confirm your transfer details
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transfer Summary */}
        <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
          <h4 className="font-semibold text-gray-800">Transfer Details</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Amount</label>
              <div className="text-lg font-bold text-gray-900">
                {processingData.transferDetails.amount} {processingData.transferDetails.token}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Recipient</label>
              <div className="text-lg font-bold text-gray-900">
                {processingData.transferDetails.recipient.name}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">To Address</label>
            <div className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded">
              {processingData.transferDetails.to}
            </div>
          </div>

          {processingData.estimatedGas && (
            <div>
              <label className="text-sm text-gray-600">Estimated Gas Fee</label>
              <div className="text-sm text-gray-700">
                {processingData.estimatedGas.estimatedFee} SEI
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {processingData.confirmation?.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={resetTransfer}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExecuteTransfer}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Execute Transfer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessingState = () => (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800">
              Executing your transfer...
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Please wait while we process your transaction on the blockchain
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompletedState = () => (
    <Card className="w-full max-w-2xl mx-auto border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Transfer Completed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Transfer Successful!
          </h3>
          <p className="text-sm text-gray-600">
            Your transfer has been completed successfully.
          </p>
        </div>

        {processingData.execution && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-2">Transaction Details</h4>
            {processingData.execution.transactionHash && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Transaction Hash</label>
                  <div className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded break-all">
                    {processingData.execution.transactionHash}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={resetTransfer}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            <Send className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic
  switch (transferState) {
    case 'input':
      return renderInputState();
    case 'missing_args':
      return renderMissingArgsState();
    case 'insufficient_funds':
      return renderInsufficientFundsState();
    case 'confirmation':
      return renderConfirmationState();
    case 'processing':
      return renderProcessingState();
    case 'completed':
      return renderCompletedState();
    default:
      return renderInputState();
  }
}
