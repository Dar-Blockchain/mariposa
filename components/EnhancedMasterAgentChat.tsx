'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
  MessageSquare,
  BarChart3,
  Coins,
  ArrowUpDown,
  Calendar,
  Shield,
  Lightbulb,
  Clock,
  Zap,
  Settings,
  AlertCircle,
  TrendingDown,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Calculator,
  PieChart,
  Percent,
  Globe,
  Search,
  Star,
  Sparkles,
  Brain,
  Database,
  Network,
  Layers,
  Filter,
  Eye,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import InformationVisualization, { 
  MarketDataCard, 
  TokenAnalysisCard, 
  TradingInsightsCard, 
  RecommendationsCard, 
  RiskAssessmentCard,
  ProcessingTimelineCard 
} from './InformationVisualization';
import EnhancedIntentVisualization from './EnhancedIntentVisualization';
import { MockDataButtons, mockInformationResponses } from './MockDataDisplay';
import InteractiveArgumentComponents from './InteractiveArgumentComponents';
import FundingQRDisplay from './FundingQRDisplay';
import TransferConfirmation from './TransferConfirmation';
import BalanceDisplay from './BalanceDisplay';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  classification?: {
    category: string;
    reason: string;
    confidence?: number;
    keywords?: string[];
  };
  responseData?: any;
  processingSteps?: ProcessingStep[];
  isInformationResponse?: boolean;
  interactiveData?: {
    type: 'argumentRequest';
    message: string;
    components: any[];
    missingArgs: string[];
  };
  originalIntent?: any;
  requiresFunding?: boolean;
  fundingInfo?: any;
  token?: string;
  requiresTransferConfirmation?: boolean;
  transferDetails?: any;
  isBalanceResponse?: boolean;
  balanceData?: any;
  isRecommendationResponse?: boolean;
}

interface ProcessingStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  data?: any;
  timestamp?: Date;
}

interface InformationData {
  category: string;
  subcategory?: string;
  data: any;
  sources?: string[];
  confidence?: number;
  relatedTopics?: string[];
  marketData?: any;
  recommendations?: string[];
}

export default function EnhancedMasterAgentChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Welcome to your sophisticated crypto intelligence platform. I'm your dedicated AI analyst, specializing in advanced market research, strategic trading insights, and comprehensive token analysis across the SEI-EVM ecosystem.

I provide institutional-grade analysis including risk assessment, portfolio optimization, technical indicators, and real-time market intelligence. How may I assist with your investment strategy today?`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);

  // Listen for quick prompt selections from the landing page
  useEffect(() => {
    const handleQuickPrompt = (event: CustomEvent) => {
      if (event.detail?.prompt) {
        setNewMessage(event.detail.prompt);
        setShowMockButtons(false);
      }
    };

    window.addEventListener('quickPromptSelected', handleQuickPrompt as EventListener);
    return () => {
      window.removeEventListener('quickPromptSelected', handleQuickPrompt as EventListener);
    };
  }, []);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [showMockButtons, setShowMockButtons] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Simple function to detect if user asked for token recommendations
  const isRecommendationRequest = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const recommendationKeywords = ['recommend', 'suggest', 'invest', 'buy', 'portfolio', 'tokens to', 'which tokens', 'best tokens'];
    return recommendationKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const callAgentRoute = async (message: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const userId = user?.id || (user as any)?._id || 'user123';
      
      const requestBody = {
        message,
        userId,
        agentId: 'master-agent',
        execute: true
      };
      
      console.log('🔗 Enhanced API Call:', `${apiUrl}/api/agent/route`);
      console.log('📤 Request:', requestBody);
      
      const response = await fetch(`${apiUrl}/api/agent/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Agent Route Response:', data);
      return data;
    } catch (error) {
      console.error('Error calling agent route API:', error);
      throw error;
    }
  };

  const callEnhancedIntent = async (message: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const userId = user?.id || (user as any)?._id || 'user123';
      
      console.log('🔗 Enhanced Intent API Call:', `${apiUrl}/api/enhanced-intent/process`);
      
      const response = await fetch(`${apiUrl}/api/enhanced-intent/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Enhanced Intent Response:', data);
      return data;
    } catch (error) {
      console.error('Error calling enhanced intent API:', error);
      throw error;
    }
  };

  const addProcessingStep = (step: ProcessingStep) => {
    setProcessingSteps(prev => [...prev, { ...step, timestamp: new Date() }]);
  };

  const updateProcessingStep = (stepName: string, updates: Partial<ProcessingStep>) => {
    setProcessingSteps(prev => 
      prev.map(step => 
        step.step === stepName ? { ...step, ...updates } : step
      )
    );
  };

  const handleMockDataSelection = (mockData: any) => {
    setShowMockButtons(false);
    
    const mockMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: formatResponseContent(mockData, true),
      sender: 'agent',
      timestamp: new Date(),
      classification: mockData.classification,
      responseData: mockData,
      isInformationResponse: true
    };

    setMessages(prev => [...prev, mockMessage]);
  };

  const processInteractiveResponse = async (originalIntent: any, responses: Record<string, string>) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/enhanced-intent/interactive-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalIntent: originalIntent,
          userResponses: responses,
          userId: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error processing interactive response:', error);
      throw error;
    }
  };

  const handleInteractiveSubmit = async (responses: Record<string, string>, messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.originalIntent) return;

    setIsTyping(true);
    
    try {
      const result = await processInteractiveResponse(message.originalIntent, responses);
      
      if (result.success && result.data) {
        const { type, data } = result;
        
        if (type === 'argumentRequest') {
          // Still missing some arguments, update the interactive components
          const updatedMessage: Message = {
            ...message,
            interactiveData: data.interactive,
            originalIntent: data.intent
          };
          
          setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m));
        } else if (type === 'actionComplete') {
          // Action completed, replace interactive message with success message
          const actionType = data?.intent?.extraction?.actionType || 'transfer';
          const successMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `✅ **${actionType.toUpperCase()} Completed Successfully**\n\nYour ${actionType} has been processed successfully.`,
            sender: 'agent',
            timestamp: new Date(),
            classification: {
              category: 'success',
              reason: `${actionType} completed`
            },
            responseData: data
          };
          
          setMessages(prev => prev.map(m => m.id === messageId ? successMessage : m));
        } else if (type === 'transfer') {
          // Handle transfer-specific response
          if (data.status === 'insufficient_funds' && data.requiresFunding) {
            // Show funding QR code interface
            const fundingMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Insufficient Funds**\n\nYou need ${data.shortfall} more ${data.fundingInstructions?.walletAddress ? 'SEI' : 'tokens'} to complete this transfer.\n\nPlease fund your wallet using the QR code below.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'funding',
                reason: 'Insufficient funds for transfer'
              },
              responseData: data,
              requiresFunding: true,
              fundingInfo: data.fundingInstructions,
              token: 'SEI', // Default to SEI, could be extracted from data
              originalIntent: message.originalIntent // Preserve original intent for balance refresh
            };
            
            setMessages(prev => prev.map(m => m.id === messageId ? fundingMessage : m));
          } else {
            // Handle other transfer statuses
            let content = data.status === 'success' ? 
              '✅ **Transfer Completed Successfully**' : 
              '⏳ **Transfer Processing**';
            
            if (data.message) {
              content += `\n\n${data.message}`;
            }
            
            const transferMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: content,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: data.status === 'success' ? 'success' : 'processing',
                reason: 'Transfer update'
              },
              responseData: data
            };
            
            setMessages(prev => prev.map(m => m.id === messageId ? transferMessage : m));
          }
        }
      }
    } catch (error) {
      console.error('Interactive submission error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **Error**\n\nFailed to process your request. Please try again.`,
        sender: 'agent',
        timestamp: new Date(),
        classification: {
          category: 'error',
          reason: 'Processing failed'
        }
      };
      
      setMessages(prev => prev.map(m => m.id === messageId ? errorMessage : m));
    } finally {
      setIsTyping(false);
    }
  };

  const handleInteractiveCancel = (messageId: string) => {
    const cancelMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '❌ **Action Cancelled**\n\nThe action has been cancelled. You can start a new request anytime.',
      sender: 'agent',
      timestamp: new Date(),
      classification: {
        category: 'cancelled',
        reason: 'User cancelled action'
      }
    };
    
    setMessages(prev => prev.map(m => m.id === messageId ? cancelMessage : m));
  };

  const handleRefreshBalance = async (messageId: string) => {
    console.log('Refreshing balance for message:', messageId);
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    // Check if this is a balance display refresh vs funding check
    if (message.isBalanceResponse) {
      // This is a balance display refresh - trigger a new balance check
      try {
        const result = await callEnhancedIntent("get my balance");
        if (result.success && result.type === 'balance' && result.data?.execution?.balanceDetails) {
          // Update the message with new balance data
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, balanceData: result.data.execution.balanceDetails }
              : m
          ));
        }
      } catch (error) {
        console.error('Balance refresh error:', error);
      }
      return;
    }
    
    // Original funding check logic
    // Update the message to show checking status
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, content: m.content.replace('💰 **Insufficient Funds**', '🔄 **Checking Balance**') }
        : m
    ));

    try {
      // Call the same interactive response endpoint to check if balance is now sufficient
      if (message?.originalIntent) {
        let result;
        
        if (message.originalIntent.originalMessage) {
          // This is a direct message, re-process the original message
          result = await callEnhancedIntent(message.originalIntent.originalMessage);
        } else {
          // This is a structured intent, use the interactive response
          result = await processInteractiveResponse(message.originalIntent, {});
        }
        
        if (result.success) {
          // Check if the result still shows insufficient funds
          const { type, data } = result;
          if (type === 'transfer' && data.status === 'insufficient_funds') {
            // Still insufficient, revert message
            setMessages(prev => prev.map(m => 
              m.id === messageId 
                ? { ...m, content: m.content.replace('🔄 **Checking Balance**', '💰 **Insufficient Funds**') }
                : m
            ));
          } else {
            // Balance is now sufficient, proceed with transfer
            const successMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: '✅ **Balance Sufficient**\n\nYour balance has been updated. Processing transfer now...',
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'success',
                reason: 'Balance updated'
              }
            };
            
            setMessages(prev => prev.map(m => m.id === messageId ? successMessage : m));
          }
        } else {
          // Still insufficient, revert message
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, content: m.content.replace('🔄 **Checking Balance**', '💰 **Insufficient Funds**') }
              : m
          ));
        }
      }
    } catch (error) {
      console.error('Balance refresh error:', error);
      // Revert message on error
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, content: m.content.replace('🔄 **Checking Balance**', '💰 **Insufficient Funds**') }
          : m
      ));
    }
  };

  const handleFundingComplete = (messageId: string) => {
    console.log('Funding completed for message:', messageId);
    handleRefreshBalance(messageId);
  };

  const handleTransferConfirm = async (messageId: string) => {
    console.log('Confirming transfer for message:', messageId);
    
    const message = messages.find(m => m.id === messageId);
    if (!message?.transferDetails) return;

    // Update message to show execution status
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, content: m.content.replace('🔄 **Transfer Ready**', '⚡ **Executing Transfer**') }
        : m
    ));

    try {
      // Call the backend to execute the transfer using agent SDK
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/agents/execute-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferDetails: message.transferDetails,
          userId: user?.id || (user as any)?._id || 'user123'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Transfer successful
        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `✅ **Transfer Completed**\n\nTransfer of ${message.transferDetails.amount} ${message.transferDetails.token} to ${message.transferDetails.recipient.name} has been completed successfully.\n\n**Transaction Hash:** ${result.txHash}\n\n**Gas Used:** ${result.gasUsed}`,
          sender: 'agent',
          timestamp: new Date(),
          classification: {
            category: 'success',
            reason: 'Transfer completed'
          },
          responseData: result
        };
        
        setMessages(prev => prev.map(m => m.id === messageId ? successMessage : m));
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer execution error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **Transfer Failed**\n\nThe transfer could not be completed. Please try again.\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error'}*`,
        sender: 'agent',
        timestamp: new Date(),
        classification: {
          category: 'error',
          reason: 'Transfer execution failed'
        }
      };
      
      setMessages(prev => prev.map(m => m.id === messageId ? errorMessage : m));
    }
  };

  const handleTransferCancel = (messageId: string) => {
    console.log('Cancelling transfer for message:', messageId);
    
    const cancelMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '❌ **Transfer Cancelled**\n\nThe transfer has been cancelled. You can start a new transfer anytime.',
      sender: 'agent',
      timestamp: new Date(),
      classification: {
        category: 'cancelled',
        reason: 'User cancelled transfer'
      }
    };
    
    setMessages(prev => prev.map(m => m.id === messageId ? cancelMessage : m));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;
    
    // Hide mock buttons once user starts chatting
    setShowMockButtons(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsTyping(true);
    setProcessingSteps([]);

    try {
      // Add initial processing step
      addProcessingStep({
        step: 'initialization',
        status: 'processing',
        description: 'Analyzing your request...'
      });

      // Try enhanced intent first
      let responseData = null;
      let isInformationCategory = false;

      try {
        addProcessingStep({
          step: 'intent_analysis',
          status: 'processing',
          description: 'Understanding intent and extracting key information...'
        });

        const enhancedResponse = await callEnhancedIntent(currentMessage);
        updateProcessingStep('intent_analysis', { status: 'completed' });

        if (enhancedResponse.success && enhancedResponse.data) {
          const { type, data } = enhancedResponse;
          
          console.log('Enhanced response type:', type);
          console.log('Enhanced response data:', data);
          console.log('Enhanced response full:', enhancedResponse);
          
          // Handle interactive argument requests (transfers, etc.)
          if (type === 'argumentRequest') {
            const agentMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: data.interactive.message,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'action',
                reason: 'Collecting required information for action'
              },
              interactiveData: data.interactive,
              originalIntent: data.intent,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, agentMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }
          
          // Handle direct transfer responses with insufficient funds
          if ((type === 'transfer' && data.status === 'insufficient_funds' && data.requiresFunding) ||
              (data.processing?.status === 'insufficient_funds' && data.processing?.result?.requiresFunding)) {
            console.log('Handling insufficient funds scenario from enhanced intent');
            // Use the processing result data for consistent structure
            const transferData = data.processing?.result || data;
            const fundingMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Insufficient Funds**\n\nYou need ${transferData.shortfall || data.shortfall} more ${transferData.fundingInstructions?.walletAddress || data.fundingInstructions?.walletAddress ? 'SEI' : 'tokens'} to complete this transfer.\n\nPlease fund your wallet using the QR code below.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'funding',
                reason: 'Insufficient funds for transfer'
              },
              responseData: data,
              requiresFunding: true,
              fundingInfo: transferData.fundingInstructions || data.fundingInstructions,
              token: 'SEI',
              processingSteps: [...processingSteps],
              originalIntent: data.intent || { 
                originalMessage: currentMessage,
                userId: user?.id || (user as any)?._id || 'user123' 
              }
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, fundingMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }
          
          // Handle transfer ready to execute
          if (type === 'transfer' && data.status === 'ready_to_execute') {
            console.log('Handling ready to execute transfer from enhanced intent');
            const confirmationMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `🔄 **Transfer Ready**\n\n${data.confirmation.message}\n\nClick confirm to execute the transfer using your agent wallet.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'confirmation',
                reason: 'Transfer ready for execution'
              },
              responseData: data,
              requiresTransferConfirmation: true,
              transferDetails: data.transferDetails,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, confirmationMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle successful swap execution
          if (type === 'swap' && data.executionStatus === 'completed' && data.execution?.success) {
            console.log('Handling successful swap execution from enhanced intent');
            const swapSuccessMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `✅ **Swap Completed Successfully**\n\n**Transaction:** ${data.execution.swapDetails.amountIn} ${data.fromToken} → ${data.execution.swapDetails.amountOut} ${data.toToken}\n\n**Transaction Hash:** ${data.execution.swapDetails.txHash}\n\n**Gas Used:** ${data.execution.swapDetails.gasUsed}\n\n**Estimated Receive:** ${data.estimatedReceive}\n\n**Price Impact:** ${data.priceImpact}`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'success',
                reason: 'Swap completed successfully'
              },
              responseData: data,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, swapSuccessMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle balance requests from actionComplete response
          if (type === 'actionComplete' && data.actionResult?.actionType === 'balance' && data.actionResult?.success) {
            console.log('Handling successful balance request from actionComplete');
            const balanceMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Your Wallet Balance**\n\n**Address:** ${data.actionResult.balanceDetails.address}\n**SEI Balance:** ${data.actionResult.balanceDetails.seiBalance} SEI\n**Total Tokens:** ${data.actionResult.balanceDetails.totalTokens}\n\nSee detailed breakdown below:`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'balance',
                reason: 'Balance information retrieved'
              },
              responseData: data,
              isBalanceResponse: true,
              balanceData: data.actionResult.balanceDetails,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, balanceMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle action errors (including balance failures)
          if (type === 'actionError') {
            console.log('Handling action error from enhanced intent');
            const actionType = data.intent?.extraction?.actionType || 'action';
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `❌ **${actionType.toUpperCase()} Failed**\n\n**Error:** ${data.error}\n\n${actionType === 'balance' ? 'Please make sure you have an active agent set up and try again.' : 'Please check your request and try again.'}`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'error',
                reason: `${actionType} execution failed`
              },
              responseData: data,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle balance requests from actions response
          if (type === 'actions' && enhancedResponse.subtype === 'balance' && data.result?.executionStatus === 'completed' && data.result?.execution?.success) {
            console.log('Handling successful balance request from actions response');
            const balanceMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Your Wallet Balance**\n\n**Address:** ${data.result.execution.balanceDetails.address}\n**SEI Balance:** ${data.result.execution.balanceDetails.seiBalance} SEI\n**Total Tokens:** ${data.result.execution.balanceDetails.totalTokens}\n\nSee detailed breakdown below:`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'balance',
                reason: 'Balance information retrieved'
              },
              responseData: data,
              isBalanceResponse: true,
              balanceData: data.result.execution.balanceDetails,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, balanceMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle balance requests (legacy format)
          if (type === 'balance' && data.executionStatus === 'completed' && data.execution?.success) {
            console.log('Handling successful balance request from enhanced intent');
            const balanceMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Your Wallet Balance**\n\n**Address:** ${data.execution.balanceDetails.address}\n**SEI Balance:** ${data.execution.balanceDetails.seiBalance} SEI\n**Total Tokens:** ${data.execution.balanceDetails.totalTokens}\n\nSee detailed breakdown below:`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'balance',
                reason: 'Balance information retrieved'
              },
              responseData: data,
              isBalanceResponse: true,
              balanceData: data.execution.balanceDetails,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, balanceMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle failed swap execution
          if (type === 'swap' && data.executionStatus === 'failed' && data.execution?.error) {
            console.log('Handling failed swap execution from enhanced intent');
            const swapErrorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `❌ **Swap Failed**\n\n**Error:** ${data.execution.error}\n\n**Swap Details:** ${data.amount} ${data.fromToken} → ${data.toToken}\n\nPlease check your wallet balance and try again.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'error',
                reason: 'Swap execution failed'
              },
              responseData: data,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('intent_analysis', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, swapErrorMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }
          
          responseData = enhancedResponse.data;
          // Enhanced intent endpoint returns type at the top level
          isInformationCategory = enhancedResponse.type === 'information' || 
                                 responseData.type === 'information' ||
                                 (responseData.intent?.classification?.type === 'information');
        }
      } catch (error) {
        updateProcessingStep('intent_analysis', { 
          status: 'error', 
          description: 'Intent analysis failed, falling back to agent route...' 
        });
      }

      // Fallback to agent route
      if (!responseData) {
        addProcessingStep({
          step: 'agent_route',
          status: 'processing',
          description: 'Processing through agent route...'
        });

        const agentResponse = await callAgentRoute(currentMessage);
        updateProcessingStep('agent_route', { status: 'completed' });

        if (agentResponse.success && agentResponse.data) {
          responseData = agentResponse.data;
          isInformationCategory = responseData.classification && 
                                 responseData.classification.type === 'information';
          
          console.log('Agent response data:', responseData);
          console.log('Agent response status:', responseData.status);
          console.log('Agent response requiresFunding:', responseData.requiresFunding);
          
          // Handle direct transfer responses with insufficient funds from agent route
          if (responseData.processing?.status === 'insufficient_funds' && responseData.processing?.result?.requiresFunding) {
            console.log('Handling insufficient funds scenario from agent route');
            const fundingMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Insufficient Funds**\n\nYou need ${responseData.processing.result.shortfall} more ${responseData.processing.result.fundingInstructions?.walletAddress ? 'SEI' : 'tokens'} to complete this transfer.\n\nPlease fund your wallet using the QR code below.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'funding',
                reason: 'Insufficient funds for transfer'
              },
              responseData: responseData,
              requiresFunding: true,
              fundingInfo: responseData.processing.result.fundingInstructions,
              token: 'SEI',
              processingSteps: [...processingSteps],
              originalIntent: responseData.intent || { 
                originalMessage: currentMessage,
                userId: user?.id || (user as any)?._id || 'user123' 
              }
            };
            
            updateProcessingStep('agent_route', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, fundingMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }
          
          // Handle transfer ready to execute from agent route
          if (responseData.processing?.status === 'ready_to_execute' && responseData.processing?.result?.confirmation?.requiresConfirmation) {
            console.log('Handling ready to execute transfer from agent route');
            const confirmationMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `🔄 **Transfer Ready**\n\n${responseData.processing.result.confirmation.message}\n\nClick confirm to execute the transfer using your agent wallet.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'confirmation',
                reason: 'Transfer ready for execution'
              },
              responseData: responseData,
              requiresTransferConfirmation: true,
              transferDetails: responseData.processing.result.transferDetails,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('agent_route', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, confirmationMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle successful balance check from agent route
          if (responseData.processing?.type === 'actions' && 
              responseData.processing?.subtype === 'balance' &&
              responseData.processing?.result?.executionStatus === 'completed' && 
              responseData.processing?.result?.execution?.success) {
            console.log('Handling successful balance request from agent route');
            const balanceData = responseData.processing.result.execution.balanceDetails;
            const balanceMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `💰 **Your Wallet Balance**\n\n**Address:** ${balanceData.address}\n**SEI Balance:** ${balanceData.seiBalance} SEI\n**Total Tokens:** ${balanceData.totalTokens}\n\nSee detailed breakdown below:`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'balance',
                reason: 'Balance information retrieved'
              },
              responseData: responseData,
              isBalanceResponse: true,
              balanceData: balanceData,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('agent_route', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, balanceMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle successful swap execution from agent route
          if (responseData.processing?.type === 'swap' && 
              responseData.processing?.result?.executionStatus === 'completed' && 
              responseData.processing?.result?.execution?.success) {
            console.log('Handling successful swap execution from agent route');
            const swapData = responseData.processing.result;
            const swapSuccessMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `✅ **Swap Completed Successfully**\n\n**Transaction:** ${swapData.execution.swapDetails.amountIn} ${swapData.fromToken} → ${swapData.execution.swapDetails.amountOut} ${swapData.toToken}\n\n**Transaction Hash:** ${swapData.execution.swapDetails.txHash}\n\n**Gas Used:** ${swapData.execution.swapDetails.gasUsed}\n\n**Estimated Receive:** ${swapData.estimatedReceive}\n\n**Price Impact:** ${swapData.priceImpact}`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'success',
                reason: 'Swap completed successfully'
              },
              responseData: responseData,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('agent_route', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, swapSuccessMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle failed balance check from agent route
          if (responseData.processing?.type === 'actions' && 
              responseData.processing?.subtype === 'balance' &&
              responseData.processing?.result?.executionStatus === 'failed' && 
              responseData.processing?.result?.execution?.error) {
            console.log('Handling failed balance request from agent route');
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `❌ **Balance Check Failed**\n\n**Error:** ${responseData.processing.result.execution.error}\n\nPlease make sure you have an active agent set up and try again.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'error',
                reason: 'Balance check failed'
              },
              responseData: responseData,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('agent_route', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }

          // Handle failed swap execution from agent route  
          if (responseData.processing?.type === 'swap' && 
              responseData.processing?.result?.executionStatus === 'failed' && 
              responseData.processing?.result?.execution?.error) {
            console.log('Handling failed swap execution from agent route');
            const swapData = responseData.processing.result;
            const swapErrorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: `❌ **Swap Failed**\n\n**Error:** ${swapData.execution.error}\n\n**Swap Details:** ${swapData.amount} ${swapData.fromToken} → ${swapData.toToken}\n\nPlease check your wallet balance and try again.`,
              sender: 'agent',
              timestamp: new Date(),
              classification: {
                category: 'error',
                reason: 'Swap execution failed'
              },
              responseData: responseData,
              processingSteps: [...processingSteps]
            };
            
            updateProcessingStep('agent_route', { status: 'completed' });
            updateProcessingStep('formatting', { status: 'completed' });
            setMessages(prev => [...prev, swapErrorMessage]);
            setIsTyping(false);
            setProcessingSteps([]);
            return;
          }
        }
      }

      // Final processing step
      addProcessingStep({
        step: 'formatting',
        status: 'processing',
        description: 'Formatting response for optimal display...'
      });

      if (responseData) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: formatResponseContent(responseData, isInformationCategory),
          sender: 'agent',
          timestamp: new Date(),
          classification: responseData.classification,
          responseData: responseData,
          processingSteps: [...processingSteps],
          isInformationResponse: isInformationCategory,
          isRecommendationResponse: isRecommendationRequest(currentMessage)
        };

        updateProcessingStep('formatting', { status: 'completed' });
        setMessages(prev => [...prev, agentMessage]);
      } else {
        throw new Error('No valid response received from any endpoint');
      }

    } catch (error) {
      console.error('Message processing error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ **Processing Error**\n\nI encountered an issue while processing your request. Please try rephrasing your question or try again.\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error'}*`,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setProcessingSteps([]);
    }
  };

  const formatResponseContent = (data: any, isInformation: boolean): string => {
    if (!data) return 'No data available.';

    // For information responses, create rich formatted content
    if (isInformation) {
      return formatInformationResponse(data);
    }

    // For other response types, use existing formatting
    return formatGenericResponse(data);
  };

  const formatInformationResponse = (data: any): string => {
    let content = '';
    
    // Handle enhanced-intent response structure
    const informationData = data.information || data;
    const intentData = data.intent;
    
    // Header with category and confidence
    const category = intentData?.classification?.type || data.type || 'Information';
    const confidence = intentData?.classification?.confidence || informationData.confidence;
    
    content += `🔍 **${category.toUpperCase()} RESPONSE**`;
    if (confidence) {
      const confPercent = typeof confidence === 'string' ? confidence : `${Math.round(confidence * 100)}%`;
      content += ` (${confPercent} confidence)`;
    }
    content += '\n\n';

    // Main analysis content
    if (informationData.result?.analysis) {
      if (typeof informationData.result.analysis === 'string') {
        content += `📊 **Analysis:**\n${informationData.result.analysis}\n\n`;
      } else if (informationData.result.analysis.marketOverview?.summary) {
        content += `📊 **Market Analysis:**\n${informationData.result.analysis.marketOverview.summary}\n\n`;
      }
    }

    // Recommendations from enhanced-intent
    if (informationData.result?.recommendations && Array.isArray(informationData.result.recommendations)) {
      content += `💡 **Recommendations:**\n`;
      informationData.result.recommendations.forEach((rec: any, index: number) => {
        if (typeof rec === 'string') {
          content += `${index + 1}. ${rec}\n`;
        } else if (rec.recommendation) {
          content += `${index + 1}. ${rec.recommendation}\n`;
        }
      });
      content += '\n';
    }

    // Actionable insights
    if (informationData.result?.actionableInsights && Array.isArray(informationData.result.actionableInsights)) {
      content += `🎯 **Actionable Insights:**\n`;
      informationData.result.actionableInsights.forEach((insight: string, index: number) => {
        content += `• ${insight}\n`;
      });
      content += '\n';
    }

    // Risk warnings
    if (informationData.result?.riskWarnings && Array.isArray(informationData.result.riskWarnings)) {
      content += `⚠️ **Risk Warnings:**\n`;
      informationData.result.riskWarnings.forEach((warning: string, index: number) => {
        content += `• ${warning}\n`;
      });
      content += '\n';
    }

    // Next steps
    if (informationData.result?.nextSteps && Array.isArray(informationData.result.nextSteps)) {
      content += `🚀 **Next Steps:**\n`;
      informationData.result.nextSteps.forEach((step: string, index: number) => {
        content += `${index + 1}. ${step}\n`;
      });
      content += '\n';
    }

    // Market context
    if (informationData.result?.marketContext) {
      const mc = informationData.result.marketContext;
      content += `📊 **Market Context:**\n`;
      content += `• Data Source: ${mc.dataSource}\n`;
      content += `• Last Updated: ${new Date(mc.lastUpdated).toLocaleString()}\n`;
      content += `• Analysis Model: ${mc.aiModel}\n`;
      content += '\n';
    }

    // Fallback content handling for older format
    if (!content.trim() || content.trim() === `🔍 **${category.toUpperCase()} RESPONSE**`) {
      if (data.result) {
        content += `📊 **Analysis Results:**\n${data.result}\n\n`;
      }
      if (data.processing?.result) {
        content += `⚡ **Processing Results:**\n${JSON.stringify(data.processing.result, null, 2)}\n\n`;
      }
    }

    return content.trim();
  };

  const formatGenericResponse = (data: any): string => {
    // Existing generic formatting logic
    const { classification, processing } = data;
    
    let content = `🎯 **${classification?.type?.toUpperCase() || 'RESPONSE'}**\n\n`;
    
    if (classification?.reasoning) {
      content += `💭 **Analysis:** ${classification.reasoning}\n\n`;
    }

    if (processing?.result) {
      if (typeof processing.result === 'string') {
        content += processing.result;
      } else {
        content += JSON.stringify(processing.result, null, 2);
      }
    }

    return content;
  };

  const getClassificationIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'information': return <Info className="w-5 h-5 text-blue-600" />;
      case 'action': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'strategy': return <Target className="w-5 h-5 text-green-600" />;
      case 'feedback': return <MessageSquare className="w-5 h-5 text-purple-600" />;
      default: return <Bot className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="secondary" className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (confidence >= 0.7) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
    return <Badge variant="secondary" className="bg-red-100 text-red-800">Low Confidence</Badge>;
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ProcessingStepsDisplay = () => (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Processing Pipeline</span>
      </div>
      <div className="space-y-2">
        {processingSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              step.status === 'completed' ? 'bg-green-500' :
              step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
              step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
            }`} />
            <span className={`text-xs ${
              step.status === 'completed' ? 'text-green-700' :
              step.status === 'processing' ? 'text-blue-700' :
              step.status === 'error' ? 'text-red-700' : 'text-gray-500'
            }`}>
              {step.description}
            </span>
            {step.status === 'processing' && (
              <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const InformationResponseCard = ({ message }: { message: Message }) => {
    if (!message.isInformationResponse || !message.responseData) return null;

    const data = message.responseData;
    
    // Check if this is enhanced-intent data structure
    const hasEnhancedIntentStructure = data.intent || data.information;
    
    if (hasEnhancedIntentStructure) {
      // Use the new enhanced intent visualization
      return (
        <div className="mt-4">
          <EnhancedIntentVisualization data={data} />
        </div>
      );
    }

    // Fallback to original visualization for older format
    const classification = data.classification || {};

    return (
      <div className="mt-4 space-y-4">
        {/* Classification Header */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getClassificationIcon(classification.category)}
                <div>
                  <CardTitle className="text-lg text-blue-800">
                    {classification.category?.toUpperCase() || 'INFORMATION'} Response
                  </CardTitle>
                  <p className="text-sm text-blue-600 mt-1">
                    {classification.reasoning || 'Detailed information analysis'}
                  </p>
                </div>
              </div>
              {classification.confidence && getConfidenceBadge(classification.confidence)}
            </div>
          </CardHeader>
          
          {classification.keywords && classification.keywords.length > 0 && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {classification.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Search className="w-3 h-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Processing Results */}
        {data.processing?.result && (
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {typeof data.processing.result === 'string' 
                    ? data.processing.result 
                    : JSON.stringify(data.processing.result, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Visualizations */}
        <InformationVisualization 
          data={data} 
          category={classification.category} 
          confidence={classification.confidence} 
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Clean, minimal header - removed completely for minimalism */}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Clean Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white ml-4 shadow-md'
                      : 'bg-gray-50 text-gray-900 mr-4'
                  }`}
                >

                  {/* Clean Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  
                  {/* Professional Agent Signature */}
                  {message.sender === 'agent' && (
                    <div className="mt-3 pt-2 border-t border-orange-100/50">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <img src="/mariposa-logo.png" alt="Mariposa" className="w-3 h-3" />
                            <span className="font-medium text-orange-600">Mariposa AI</span>
                          </div>
                          <div className="w-1 h-1 bg-orange-300 rounded-full"></div>
                          <span>SEI-EVM Specialist</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-orange-600">Live</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Components for Missing Arguments */}
                {message.interactiveData && (
                  <div className="mt-4">
                    <InteractiveArgumentComponents
                      interactiveData={message.interactiveData}
                      onSubmit={(responses) => handleInteractiveSubmit(responses, message.id)}
                      onCancel={() => handleInteractiveCancel(message.id)}
                    />
                  </div>
                )}

                {/* Funding QR Display for Insufficient Funds */}
                {message.requiresFunding && message.fundingInfo && (
                  <div className="mt-4">
                    <FundingQRDisplay
                      fundingInfo={message.fundingInfo}
                      token={message.token || 'SEI'}
                      onRefreshBalance={() => handleRefreshBalance(message.id)}
                      onFundingComplete={() => handleFundingComplete(message.id)}
                    />
                  </div>
                )}

                {/* Transfer Confirmation for Ready to Execute */}
                {message.requiresTransferConfirmation && message.transferDetails && (
                  <div className="mt-4">
                    <TransferConfirmation
                      transferDetails={message.transferDetails}
                      onConfirm={() => handleTransferConfirm(message.id)}
                      onCancel={() => handleTransferCancel(message.id)}
                    />
                  </div>
                )}

                {/* Balance Display for Balance Requests */}
                {message.isBalanceResponse && message.balanceData && (
                  <div className="mt-4">
                    <BalanceDisplay
                      balanceInfo={message.balanceData}
                      onRefreshBalance={() => handleRefreshBalance(message.id)}
                      isRefreshing={false}
                    />
                  </div>
                )}

                {/* Enhanced Information Response */}
                {message.sender === 'agent' && message.isInformationResponse && (
                  <InformationResponseCard message={message} />
                )}

                {/* Simple Execute Strategy Button for Token Recommendations */}
                {message.sender === 'agent' && message.isRecommendationResponse && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Would you like to execute this recommendation as a strategy?
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          setNewMessage("Yes, please help me execute this recommendation as an automated strategy");
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Execute Strategy
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Removed mock data buttons for minimalism */}

          {/* Processing Steps */}
          {isTyping && processingSteps.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] mr-4">
                <ProcessingStepsDisplay />
              </div>
            </div>
          )}

          {/* Clean Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 rounded-2xl px-4 py-3 mr-4 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Analyzing market data</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Minimalist Input Section */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Describe your investment inquiry, market analysis needs, or trading strategy question..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder:text-gray-500 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
            >
              {isTyping ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </div>
          
          {/* Professional Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2 font-medium">Professional Analysis Templates:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Show my complete portfolio balance and holdings",
                  "Get my SEI balance and all token assets", 
                  "Market sentiment analysis with technical indicators",
                  "Portfolio optimization recommendations"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(suggestion)}
                    className="text-xs px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-gray-700 hover:text-orange-900 transition-all duration-200 hover:scale-[1.02] hover:border-orange-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}