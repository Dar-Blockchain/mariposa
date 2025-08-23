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
      content: `🌟 **Welcome to Enhanced Master Agent**

I'm your comprehensive AI assistant for cryptocurrency and trading intelligence. I specialize in providing detailed, actionable information with beautiful visualizations.

**What I can help you with:**
🔍 **Market Intelligence** - Real-time data, price analysis, trends
📊 **Portfolio Insights** - Performance analysis, optimization tips  
🎯 **Trading Guidance** - Strategy recommendations, risk assessment
🌐 **Crypto Education** - Explanations, tutorials, best practices

Ask me anything about crypto markets, and I'll provide rich, detailed insights!`,
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
    
    // Update the message to show checking status
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, content: m.content.replace('💰 **Insufficient Funds**', '🔄 **Checking Balance**') }
        : m
    ));

    try {
      // Call the same interactive response endpoint to check if balance is now sufficient
      const message = messages.find(m => m.id === messageId);
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
          isInformationResponse: isInformationCategory
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Enhanced Master Agent</h1>
              <p className="text-sm text-gray-600">Intelligent Crypto Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-4'
                      : 'bg-white border border-gray-200 mr-4'
                  }`}
                >
                  {/* Sender Info */}
                  <div className="flex items-center gap-2 mb-2">
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.sender === 'user' ? 'You' : 'Enhanced Agent'}
                    </span>
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className={`prose prose-sm max-w-none ${
                    message.sender === 'user' ? 'prose-invert' : ''
                  }`}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>

                  {/* Classification Badge */}
                  {message.classification && message.sender === 'agent' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      {getClassificationIcon(message.classification.category)}
                      <span className="text-xs font-medium text-gray-600">
                        {message.classification.category}
                      </span>
                      {message.classification.confidence && (
                        <span className="text-xs text-gray-500">
                          ({Math.round(message.classification.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Copy Button */}
                  {message.sender === 'agent' && (
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
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

                {/* Enhanced Information Response */}
                {message.sender === 'agent' && message.isInformationResponse && (
                  <InformationResponseCard message={message} />
                )}
              </div>
            </div>
          ))}

          {/* Mock Data Buttons - Show after welcome message */}
          {showMockButtons && messages.length === 1 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] mr-4">
                <MockDataButtons onSelectMock={handleMockDataSelection} />
              </div>
            </div>
          )}

          {/* Processing Steps */}
          {isTyping && processingSteps.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] mr-4">
                <ProcessingStepsDisplay />
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 mr-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Enhanced Agent is thinking</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ask me anything about crypto markets..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="pr-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Enhanced Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {/* Risk-Based Shortcuts */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('tokens without risk on sei-evm')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <Shield className="w-3 h-3 text-green-600" />
              <span>Safe Tokens</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('high risk tokens with high potential on sei-evm')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <TrendingUp className="w-3 h-3 text-red-600" />
              <span>High Risk</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('new tokens on sei-evm network')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <Star className="w-3 h-3 text-blue-600" />
              <span>New Tokens</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('sei-evm market analysis and trends')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <BarChart3 className="w-3 h-3 text-purple-600" />
              <span>Market Analysis</span>
            </Button>
            
            {/* Token Type Shortcuts */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('stablecoins on sei-evm')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <DollarSign className="w-3 h-3 text-green-600" />
              <span>Stablecoins</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('defi tokens on sei-evm')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <Coins className="w-3 h-3 text-indigo-600" />
              <span>DeFi Tokens</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('meme tokens on sei-evm')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <Activity className="w-3 h-3 text-orange-600" />
              <span>Meme Tokens</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('wrapped tokens like WETH WBTC on sei-evm')}
              className="text-xs flex items-center gap-1 justify-start"
            >
              <ArrowUpDown className="w-3 h-3 text-gray-600" />
              <span>Wrapped</span>
            </Button>
          </div>
          
          {/* Additional Quick Actions Row */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('What is the current SEI price?')}
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              SEI Price
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('Explain how sei-evm works')}
              className="text-xs"
            >
              <Info className="w-3 h-3 mr-1" />
              SEI Guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('portfolio recommendations for sei-evm')}
              className="text-xs"
            >
              <Target className="w-3 h-3 mr-1" />
              Portfolio Tips
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewMessage('best trading strategies for sei-evm')}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Strategies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}