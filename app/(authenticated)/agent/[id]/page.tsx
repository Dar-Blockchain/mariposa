
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  ArrowLeft,
  Settings,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Plus,
  Bookmark,
  BookmarkCheck,
  Calculator,
  BarChart3,
  PieChart,
  Activity,
  Percent,
  ArrowRightLeft,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  strategy?: any; // For storing strategy data
  information?: any; // For storing information data
  actions?: any; // For storing actions data
  showNavigationButton?: boolean; // Added for new agent creation confirmation
  navigationData?: { // Added for new agent creation confirmation
    agentId: string;
    agentName: string;
  };
}

interface StrategyResponse {
  success: boolean;
  data: {
    // Generate-strategy response format
    strategy?: {
      agentName: string;
      description: string;
      primaryStrategy: string;
      riskTolerance: string;
      defaultBudget: number;
      frequency: string;
      portfolioAllocation: {
        [key: string]: {
          symbol: string;
          percentage: string;
          reasoning: string;
        };
      };
      maxPositionSize: number;
      stopLossPercentage: number;
      takeProfitPercentage: number;
      customPrompt: string;
      extractedIntent: string;
      portfolioManagementPlan: {
        initialSetup: Array<{
          step: number;
          action: string;
          actionType: string;
          tokenPair: string;
          percentage: string;
          dollarAmount: number;
          priority: string;
          timeframe: string;
          reasoning: string;
        }>;
        monitoringFrequency: string;
        rebalancingRules: {
          priceIncreaseActions: Array<{
            trigger: string;
            action: string;
            threshold: number;
            actionType: string;
            reasoning: string;
          }>;
          priceDecreaseActions: Array<{
            trigger: string;
            action: string;
            threshold: number;
            actionType: string;
            reasoning: string;
          }>;
          portfolioValueChanges: {
            totalIncrease: {
              trigger: string;
              action: string;
              thresholds: string[];
              actions: string[];
            };
            totalDecrease: {
              trigger: string;
              action: string;
              thresholds: string[];
              actions: string[];
            };
          };
        };
        riskManagement: {
          stopLossStrategy: string;
          takeProfitStrategy: string;
          positionSizing: string;
          diversificationRules: string;
        };
        periodicReview: {
          frequency: string;
          metrics: string[];
          adjustmentCriteria: string;
          performanceTargets: string;
        };
      };
      marketInsights: string;
      riskAssessment: string;
      strategyAdvantages: string;
      potentialDrawbacks: string;
      successMetrics: string;
      agentUuid: string;
    };
    
    // Modify-strategy response format
    agent?: {
      _id: string;
      name: string;
      agentUuid: string;
      description: string;
      userId: string;
      primaryStrategy: string;
      configuration: {
        defaultBudget: number;
        frequency: string;
        riskTolerance: string;
        preferredTokens: string[];
        maxPositionSize: number;
        stopLossPercentage: number;
        takeProfitPercentage: number;
        customPrompt: string;
      };
      isApproved: boolean;
      canBeginWork: boolean;
    };
    
    newStrategy?: {
      portfolioAllocation: {
        [key: string]: {
          symbol: string;
          percentage: string;
          reasoning: string;
        };
      };
      portfolioManagementPlan: {
        initialSetup: Array<{
          step: number;
          action: string;
          actionType: string;
          tokenPair: string;
          percentage: string;
          dollarAmount: number;
          priority: string;
          timeframe: string;
          reasoning: string;
        }>;
        monitoringFrequency: string;
        rebalancingRules: any;
        riskManagement: any;
        periodicReview: any;
      };
      marketInsights: string;
      riskAssessment: string;
      strategyAdvantages: string;
      potentialDrawbacks: string;
      successMetrics: string;
    };
    
    // Common fields
    strategyId?: string;
    strategyVersion?: number;
    agentUuid?: string;
    userId?: string;
    sessionId?: string;
    memoryContext?: string;
    approvalStatus?: {
      isApproved: boolean;
      canBeginWork: boolean;
      requiresApproval: boolean;
      note: string;
    };
    message?: string;
  };
}

const agentTypes = {
  goal: { name: 'Goal Agent', color: 'from-green-400 to-blue-500' },
  trading: { name: 'Trading Agent', color: 'from-purple-400 to-pink-500' },
  security: { name: 'Security Agent', color: 'from-red-400 to-orange-500' },
  defi: { name: 'DeFi Agent', color: 'from-yellow-400 to-orange-500' },
  analytics: { name: 'Analytics Agent', color: 'from-blue-400 to-indigo-500' },
  portfolio: { name: 'Portfolio Agent', color: 'from-indigo-400 to-purple-500' }
};

export const dynamic = 'force-dynamic';

export default function AgentChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  console.log(user);

  const agentId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI assistant. I'm here to help you with your crypto needs. How can I assist you today?`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAgentData, setPendingAgentData] = useState<any>(null);
  const [awaitingAgentConfirmation, setAwaitingAgentConfirmation] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [lastApprovedAgent, setLastApprovedAgent] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect to new Master Agent component for default/master IDs
  useEffect(() => {
    if (agentId === 'default' || agentId === 'master') {
      router.push('/agent/master');
      return;
    }
  }, [agentId, router]);

  // Return early if redirecting
  if (agentId === 'default' || agentId === 'master') {
    return null;
  }

  // Mock agent data - in real app, this would come from your state/API  
  const agent = {
    id: agentId,
    name: 'AI Trading Assistant',
    type: 'trading' as keyof typeof agentTypes
  };

  const agentInfo = agentTypes[agent.type] || agentTypes.trading;

  // Initialize session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    setSessionId(newSessionId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Get risk level color based on risk tolerance
  const getRiskLevelColor = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    if (level.includes('low') || level.includes('conservative')) {
      return 'bg-green-100 text-green-700 border-green-300';
    } else if (level.includes('medium') || level.includes('moderate') || level.includes('mid')) {
      return 'bg-orange-100 text-orange-700 border-orange-300';
    } else if (level.includes('high') || level.includes('aggressive')) {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // Extract proposed budget amount for comparison
  const extractBudgetAmount = (budgetString: string | undefined): number => {
    if (!budgetString || typeof budgetString !== 'string') {
      return 0;
    }
    const match = budgetString.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleBudgetAcceptance = (accepted: boolean, strategy?: any) => {
    // This function is no longer needed as budget is handled by the API
  };

  const callGenerateStrategy = async (message: string): Promise<StrategyResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agents/generate-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          userId: user?.id || (user as any)?._id || 'user123' // Fallback for compatibility
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling generate strategy API:', error);
      throw error;
    }
  };

  const callModifyStrategy = async (message: string, agentId: string): Promise<StrategyResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agents/${agentId}/modify-strategy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          userId: user?.id || (user as any)?._id || 'user123' // Fallback for compatibility
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling modify strategy API:', error);
      throw error;
    }
  };

  const createMemoryForDeclinedStrategy = async () => {
    if (!pendingAgentData) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agent/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123', // In real app, get this from authentication
          sessionId: sessionId,
          agentId: pendingAgentData.agentUuid,
          userMessage: 'Strategy generated but declined by user',
          extractedParameters: {
            intent: 'strategy_declined',
            mentionedCoins: Object.values(pendingAgentData.strategy.portfolioAllocation || {}).map((token: any) => token.symbol),
            riskIndicators: pendingAgentData.strategy.riskTolerance,
            budgetHints: `$${pendingAgentData.strategy.defaultBudget}`,
            timeline: pendingAgentData.strategy.frequency,
            customInstructions: pendingAgentData.strategy.extractedIntent
          },
          strategyType: pendingAgentData.strategy.primaryStrategy === 'DCA' ? 'long_holding' : 'short_trading',
          budgetAmount: pendingAgentData.strategy.defaultBudget,
          actions: (pendingAgentData.strategy.portfolioManagementPlan?.initialSetup || []).map((action: any, index: number) => ({
            step: index + 1,
            actionType: action.actionType,
            percentage: action.percentage,
            tokenPair: action.tokenPair,
            priority: action.priority,
            reasoning: action.reasoning
          })),
          summary: `Strategy generated (${pendingAgentData.strategy.primaryStrategy}) but declined by user - available for modifications`,
          outcome: 'cancelled'
        }),
      });

      if (response.ok) {
        console.log('Memory created for declined strategy');
      }
    } catch (error) {
      console.error('Error creating memory for declined strategy:', error);
    }
  };

  const callModifyStrategyWithMemory = async (message: string, agentUuid: string): Promise<StrategyResponse> => {
    try {
      // First, create memory for the declined strategy if it hasn't been created yet
      await createMemoryForDeclinedStrategy();
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agents/${agentUuid}/modify-strategy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          userId: 'user123', // In real app, get this from authentication
          useMemory: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling modify strategy with memory API:', error);
      throw error;
    }
  };

  const callApproveAgent = async (agentId: string, userId: string): Promise<any> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agents/${agentId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          isApproved: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling approve agent API:', error);
      throw error;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // New function to call the agent route endpoint
  const callAgentRoute = async (message: string) => {
    try {
      console.log(user)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const userId = user?.id || (user as any)?._id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${apiUrl}/api/agent/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          agentId,
          userId,
          execute:true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling agent route API:', error);
      throw error;
    }
  };

  // Function to handle information-type responses
  const handleInformationResponse = (response: any) => {
    if (response.success && response.data.processing?.type === 'information') {
      const info = response.data.processing.result;
      const classification = response.data.classification;
      
      // Create a comprehensive response message with enhanced analysis
      let responseContent = '';
      
      if (info.requestType === 'token_specific') {
        const recommendation = info.recommendations[0]; // Get primary recommendation
        const potentialReturn = recommendation ? ((recommendation.targetPrice - recommendation.currentPrice) / recommendation.currentPrice * 100).toFixed(2) : '0';
        
        // Enhanced token-specific analysis
        responseContent = `## 📊 Investment Analysis: ${classification.keywords.join(', ')}

**Market Summary:**
${info.analysis.marketOverview.summary}

**📈 Investment Recommendation:**
• **Action:** ${recommendation?.action || 'HOLD'} (${recommendation?.confidence || 0}% confidence)
• **Current Price:** $${recommendation?.currentPrice || 'N/A'}
• **Target Price:** $${recommendation?.targetPrice || 'N/A'}
• **Potential Return:** ${potentialReturn}%
• **Investment Timeline:** ${recommendation?.timeframe || 'Not specified'}
• **Risk Level:** ${recommendation?.riskScore || 0}/100

**💡 Investment Rationale:**
${recommendation?.reasoning || 'No specific reasoning provided'}

**📊 Technical Analysis:**
• **Trend Direction:** ${info.analysis.technicalSignals.trend.toUpperCase()}
• **Signal Strength:** ${info.analysis.technicalSignals.strength}/100
• **Key Support Level:** $${info.analysis.technicalSignals.support}
• **Key Resistance Level:** $${info.analysis.technicalSignals.resistance}
• **RSI Indicator:** ${info.analysis.technicalSignals.rsi} ${info.analysis.technicalSignals.rsi > 70 ? '(Overbought)' : info.analysis.technicalSignals.rsi < 30 ? '(Oversold)' : '(Neutral)'}

**🏗️ Fundamental Strength (Overall: ${info.analysis.fundamentalScore.overallScore}/100):**
• **Ecosystem Health:** ${info.analysis.fundamentalScore.ecosystemHealth}/100
• **Development Activity:** ${info.analysis.fundamentalScore.developmentActivity}/100
• **Partnership Network:** ${info.analysis.fundamentalScore.partnershipStrength}/100
• **Adoption Growth:** ${info.analysis.fundamentalScore.adoptionGrowth}/100

**💰 Investment Calculator:**
For different investment amounts:
• $100 investment → Potential value: $${(100 * (1 + parseFloat(potentialReturn) / 100)).toFixed(2)}
• $500 investment → Potential value: $${(500 * (1 + parseFloat(potentialReturn) / 100)).toFixed(2)}
• $1,000 investment → Potential value: $${(1000 * (1 + parseFloat(potentialReturn) / 100)).toFixed(2)}

**🎯 Action Plan:**
${info.actionableInsights.map((insight: string, index: number) => `${index + 1}. ${insight}`).join('\n')}

**⚠️ Risk Assessment:**
${info.riskWarnings.map((warning: string) => `• ${warning}`).join('\n')}

**📋 Next Steps:**
${info.nextSteps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}

**📊 Market Data:**
• Source: ${info.marketContext.dataSource}
• Last Updated: ${new Date(info.marketContext.lastUpdated).toLocaleString()}
• Analysis Model: ${info.marketContext.aiModel}`;
      } else {
        // For general information requests
        responseContent = `## 📊 Market Information

${info.analysis?.marketOverview?.summary || 'No market overview available.'}

${info.recommendations ? `**Recommendations:**\n${info.recommendations.map((rec: any) => `• ${rec.token || 'General'}: ${rec.action} - ${rec.reasoning}`).join('\n')}` : ''}

${info.actionableInsights ? `**Actionable Insights:**\n${info.actionableInsights.map((insight: string) => `• ${insight}`).join('\n')}` : ''}

${info.riskWarnings ? `**⚠️ Risk Warnings:**\n${info.riskWarnings.map((warning: string) => `• ${warning}`).join('\n')}` : ''}`;
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'agent',
        timestamp: new Date(),
        information: response.data // Store the full response
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false); // Stop typing indicator
      return true;
    }
    return false;
  };

  // Function to handle actions-type responses
  const handleActionsResponse = (response: any) => {
    if (response.success && response.data.processing?.type === 'actions') {
      const actions = response.data.processing.result;
      const classification = response.data.classification;
      
      // Create a comprehensive response message for actions
      let responseContent = '';
      
      if (actions.actionType === 'transfer') {
        // For transfer actions
        const transaction = actions.transaction;
        const execution = actions.execution;
        
        // Format the response content
        responseContent = `## 💸 Transaction: ${classification.keywords.join(' ')}

${actions.userMessage || 'Transaction processed successfully.'}

**Transaction Details:**
• **Type:** ${transaction.fromToken} Transfer
• **Amount:** ${transaction.amount} ${transaction.fromToken}
• **Recipient:** ${transaction.recipient}
• **Gas Fee:** ${transaction.estimatedGasFee} ${transaction.fromToken}
• **Risk Score:** ${transaction.riskScore}/100
• **Confidence:** ${transaction.confidence}%

**Validation:**
• **Balance Check:** ${actions.validation.balanceCheck ? '✅ Sufficient' : '❌ Insufficient'}
• **Address Valid:** ${actions.validation.addressValid ? '✅ Valid' : '❌ Invalid'}
• **Network Status:** ${actions.validation.networkStatus === 'online' ? '✅ Online' : '❌ Offline'}
• **Estimated Success:** ${actions.validation.estimatedSuccess}%

${execution.success ? `**✅ Transaction Successful!**
• **Transaction ID:** ${execution.transactionDetails.transactionId}
• **Status:** ${execution.transactionDetails.status}
• **From:** ${execution.transactionDetails.fromAccount}
• **To:** ${execution.transactionDetails.toAccount}
• **Amount:** ${execution.transactionDetails.amount} ${transaction.fromToken}
• **Memo:** ${execution.transactionDetails.memo || 'None'}
• **Timestamp:** ${new Date(execution.transactionDetails.timestamp).toLocaleString()}
` : '**❌ Transaction Failed**\nThe transaction could not be completed. Please try again.'}

**⚠️ Important Alerts:**
${actions.alerts.map((alert: string) => `• ${alert}`).join('\n')}

**Steps:**
${actions.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}

**Warnings:**
${actions.warnings.map((warning: string) => `• ${warning}`).join('\n')}

**Recommendations:**
${actions.recommendations.map((recommendation: string) => `• ${recommendation}`).join('\n')}`;
      } else {
        // For other action types
        responseContent = `## 🔄 Action: ${classification.actionSubtype || 'Blockchain Action'}

${actions.userMessage || 'Action processed successfully.'}

**Status:** ${actions.status}
**Type:** ${actions.actionType}
**Risk Level:** ${actions.riskLevel}
**Estimated Time:** ${actions.estimatedTime}

${actions.alerts ? `**⚠️ Alerts:**\n${actions.alerts.map((alert: string) => `• ${alert}`).join('\n')}` : ''}

${actions.steps ? `**Steps:**\n${actions.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}` : ''}

${actions.warnings ? `**Warnings:**\n${actions.warnings.map((warning: string) => `• ${warning}`).join('\n')}` : ''}

${actions.recommendations ? `**Recommendations:**\n${actions.recommendations.map((recommendation: string) => `• ${recommendation}`).join('\n')}` : ''}`;
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'agent',
        timestamp: new Date(),
        actions: response.data // Store the full response
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false); // Stop typing indicator
      return true;
    }
    return false;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // First try to use the agent route endpoint for all message types
      const routeResponse = await callAgentRoute(newMessage);
      
      // Check if it's an information-type response
      let handled = handleInformationResponse(routeResponse);
      
      // If not handled as information, check if it's an actions-type response
      if (!handled) {
        handled = handleActionsResponse(routeResponse);
      }
      
      // If not handled as information or actions, fall back to strategy handling
      if (!handled) {
        // For specific agents, use the strategy modification logic
        let response: StrategyResponse;
        
        if (pendingAgentData && !lastApprovedAgent) {
          response = await callModifyStrategyWithMemory(newMessage, pendingAgentData.agentUuid);
        } else {
          response = await callModifyStrategy(newMessage, agentId);
        }
        
        handleStrategyResponse(response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Extract strategy response handling into separate function
  const handleStrategyResponse = (response: StrategyResponse) => {
    if (response.success && (response.data.strategy || response.data.newStrategy)) {
      // Handle different response formats
      let strategyInfo;
      let isModification = false;
      
      if (response.data.strategy) {
        // Generate-strategy response format
        strategyInfo = response.data.strategy;
        setPendingAgentData(response.data);
      } else if (response.data.newStrategy) {
        // Modify-strategy response format
        strategyInfo = {
          ...response.data.agent,
          ...response.data.newStrategy,
          agentName: response.data.agent?.name || 'Unnamed Agent',
          defaultBudget: response.data.agent?.configuration?.defaultBudget || 1000,
          riskTolerance: response.data.agent?.configuration?.riskTolerance || 'medium',
          frequency: response.data.agent?.configuration?.frequency || 'daily',
          primaryStrategy: response.data.agent?.primaryStrategy || 'balanced'
        };
        isModification = true;
        // Update pending data for modifications
        setPendingAgentData({
          ...response.data,
          strategy: strategyInfo,
          agentUuid: response.data.agent?.agentUuid || response.data.agentUuid,
          strategyId: response.data.strategyId
        });
      }
      
      // Create a comprehensive response message
      let responseContent = '';
      
      if (isModification) {
        // For strategy modifications
        responseContent = `🔄 **Strategy Modified Successfully!**

🤖 **${strategyInfo?.agentName}** - ${strategyInfo?.description}

**Updated Strategy Overview:**
• **Primary Strategy:** ${strategyInfo?.primaryStrategy}
• **Risk Tolerance:** ${strategyInfo?.riskTolerance}
• **Budget:** $${strategyInfo?.defaultBudget?.toLocaleString()}
• **Frequency:** ${strategyInfo?.frequency}
• **Strategy Version:** ${response.data.strategyVersion || 'N/A'}

**📊 Portfolio Allocation:**
${Object.entries(strategyInfo?.portfolioAllocation || {}).map(([key, alloc]: [string, any]) => 
  `• **${alloc.symbol}**: ${alloc.percentage} - ${alloc.reasoning}`
).join('\n')}

**🎯 Initial Actions Required:**
${(strategyInfo?.portfolioManagementPlan?.initialSetup || []).map((action: any, index: number) => 
  `${index + 1}. **${action.action}** (${action.actionType})
   • Pair: ${action.tokenPair}
   • Amount: ${action.percentage} ($${action.dollarAmount})
   • Priority: ${action.priority}
   • Timeframe: ${action.timeframe}
   • Reason: ${action.reasoning}`
).join('\n\n')}

**📈 Market Insights:**
${strategyInfo?.marketInsights}

**⚠️ Risk Assessment:**
${strategyInfo?.riskAssessment}

**✅ Strategy Advantages:**
${strategyInfo?.strategyAdvantages}

**⚠️ Potential Drawbacks:**
${strategyInfo?.potentialDrawbacks}

**📊 Success Metrics:**
${strategyInfo?.successMetrics}

**🔐 Approval Status:**
${response.data.approvalStatus?.requiresApproval ? 
  `⚠️ **Requires Re-approval** - ${response.data.approvalStatus.note}` : 
  '✅ **Ready to Execute**'
}

**Memory Context:** ${response.data.memoryContext === 'used' ? '🧠 Used previous conversation history' : '🆕 New conversation'}`;

        // Don't show agent creation confirmation for modifications, show strategy directly
        setAwaitingAgentConfirmation(false);
        
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'agent',
        timestamp: new Date(),
        strategy: response.data // Store the full response
      };

      setMessages(prev => [...prev, agentMessage]);
    }
  };

  const handleAgentCreationConfirmation = async (confirmed: boolean) => {
    setAwaitingAgentConfirmation(false);
    
    if (confirmed && pendingAgentData) {
      try {
        // Call the approve endpoint to approve the agent
        const approveResponse = await callApproveAgent(
          pendingAgentData.agentUuid, 
          'user123' // In real app, get this from authentication
        );

        if (approveResponse.success) {
          // Set the approved agent tracking
          setLastApprovedAgent(pendingAgentData.agentUuid);
          
          // Create confirmation message with navigation button
          const confirmationMessage: Message = {
            id: Date.now().toString(),
            content: `✅ **Agent Approved and Ready!**

🤖 **${pendingAgentData.strategy?.agentName || pendingAgentData.agent?.name}** has been approved and is ready to start trading!

**Agent Details:**
• **Agent ID:** ${pendingAgentData.agentUuid}
• **Strategy ID:** ${pendingAgentData.strategyId}
• **Status:** Approved ✅
• **Can Begin Work:** ${approveResponse.data?.agent?.canBeginWork ? 'Yes ✅' : 'No ❌'}

${pendingAgentData.message || 'Your agent is now ready to execute the trading strategy!'}

Click the button below to go to your new agent, or send another message to create a different agent.`,
            sender: 'agent',
            timestamp: new Date(),
            showNavigationButton: true,
            navigationData: {
              agentId: pendingAgentData.agentUuid,
              agentName: pendingAgentData.strategy?.agentName || pendingAgentData.agent?.name
            }
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          
        } else {
          throw new Error(approveResponse.message || 'Failed to approve agent');
        }
        
      } catch (error) {
        console.error('Error approving agent:', error);
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `❌ **Error Approving Agent**

There was an error approving your agent. Please try again or contact support.

Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sender: 'agent',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } else {
      // User declined agent creation - create memory for future strategy modifications
      await createMemoryForDeclinedStrategy();
      
      const declineMessage: Message = {
        id: Date.now().toString(),
        content: `No problem! I've saved your strategy preferences. Feel free to ask me about different trading strategies or modify your requirements. I'm here to help you find the perfect trading approach!`,
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, declineMessage]);
    }
    
    // Clear pending data so next message creates a new agent
    setPendingAgentData(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const saveAnalysis = (messageId: string) => {
    setSavedAnalyses(prev => new Set(prev).add(messageId));
    // In a real app, you would also save to localStorage or backend
    const analysisData = messages.find(m => m.id === messageId);
    if (analysisData?.information) {
      localStorage.setItem(`analysis_${messageId}`, JSON.stringify(analysisData.information));
    }
  };

  const unsaveAnalysis = (messageId: string) => {
    setSavedAnalyses(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
    localStorage.removeItem(`analysis_${messageId}`);
  };

  const renderStrategyCards = (data: any) => {
    const strategy = data.strategy;
    
    return (
      <div className="grid gap-4 mt-4 max-w-4xl">
        {/* 1. Strategy Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Strategy Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{strategy?.agentName || 'Unnamed Agent'}</h3>
                <p className="text-gray-600 mt-1">{strategy?.description || 'No description available'}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Strategy</p>
                  <p className="font-medium text-sm">{strategy?.primaryStrategy || 'N/A'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Risk Level</p>
                  <p className="font-medium text-sm capitalize">{strategy?.riskTolerance || 'medium'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Budget</p>
                  <p className="font-medium text-sm">${strategy?.defaultBudget?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Frequency</p>
                  <p className="font-medium text-sm capitalize">{strategy?.frequency || 'daily'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Portfolio Allocation */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <DollarSign className="w-5 h-5" />
              <span>Portfolio Allocation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(strategy.portfolioAllocation || {}).map(([key, alloc]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">{alloc.symbol}</span>
                      <Badge variant="outline">{alloc.percentage}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alloc.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Risk Management */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Target className="w-5 h-5" />
              <span>Risk Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Max Position</p>
                <p className="font-medium">${strategy.maxPositionSize?.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Stop Loss</p>
                <p className="font-medium">{strategy.stopLossPercentage}%</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Take Profit</p>
                <p className="font-medium">{strategy.takeProfitPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Market Insights */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <TrendingUp className="w-5 h-5" />
              <span>Market Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">{strategy.marketInsights}</p>
          </CardContent>
        </Card>

        {/* 5. Action Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>Initial Setup Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategy.portfolioManagementPlan?.initialSetup?.map((action: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {action.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.action}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="default">{action.actionType}</Badge>
                      <Badge variant="outline">{action.percentage}</Badge>
                      <Badge variant="outline">${action.dollarAmount}</Badge>
                      <Badge variant="outline">{action.tokenPair}</Badge>
                      <Badge variant="outline">{action.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{action.reasoning}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No action plan available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6. Strategy Analysis */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Strategy Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1 text-green-700">✅ Advantages:</h4>
                <p className="text-sm text-gray-700">{strategy?.strategyAdvantages || 'No advantages specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-red-700">⚠️ Potential Drawbacks:</h4>
                <p className="text-sm text-gray-700">{strategy?.potentialDrawbacks || 'No drawbacks specified'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-blue-700">📊 Success Metrics:</h4>
                <p className="text-sm text-gray-700">{strategy?.successMetrics || 'No metrics specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Function to render information cards for market analysis
  const renderActionsCards = (data: any) => {
    if (!data.processing?.result) return null;
    
    const actions = data.processing.result;
    const classification = data.classification;
    
    // Only render cards for actions type responses
    if (data.classification.type !== 'actions') return null;
    
    // Handle different action subtypes
    if (classification.actionSubtype === "transfer") {
      const transaction = actions.transaction;
      const validation = actions.validation;
      const execution = actions.execution;
      
      return (
        <div className="grid gap-4 mt-4 max-w-4xl">
          {/* Transaction Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">💸 Transaction Details</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const reportText = `Transaction Report\nGenerated: ${new Date(data.metadata?.timestamp || '').toLocaleString()}\n\nTransaction Type: ${classification.actionSubtype}\nAmount: ${transaction.amount} ${transaction.fromToken}\nRecipient: ${transaction.recipient}\nEstimated Gas Fee: ${transaction.estimatedGasFee} ${transaction.fromToken}\nRisk Score: ${transaction.riskScore}/100\nConfidence: ${transaction.confidence}%\n\nStatus: ${execution?.success ? 'Success' : 'Pending'}${execution?.transactionDetails?.transactionId ? '\nTransaction ID: ' + execution.transactionDetails.transactionId : ''}`;
                  navigator.clipboard.writeText(reportText);
                }}
                className="flex items-center space-x-1"
              >
                <Copy className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>

          {/* Transaction Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <span>Transaction Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Transfer {transaction.amount} {transaction.fromToken}</h3>
                  <p className="text-gray-600 mt-1">{actions.userMessage}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="font-medium text-sm">{transaction.amount} {transaction.fromToken}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Recipient</p>
                    <p className="font-medium text-sm">{transaction.recipient}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Gas Fee</p>
                    <p className="font-medium text-sm">{transaction.estimatedGasFee} {transaction.fromToken}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Risk Score</p>
                    <p className="font-medium text-sm">{transaction.riskScore}/100</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation & Execution */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Validation & Execution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Balance Check</p>
                    <p className="font-medium">{validation.balanceCheck ? '✅ Sufficient' : '❌ Insufficient'}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Address Valid</p>
                    <p className="font-medium">{validation.addressValid ? '✅ Valid' : '❌ Invalid'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Network Status</p>
                    <p className="font-medium capitalize">{validation.networkStatus}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">Success Probability</p>
                    <p className="font-medium">{validation.estimatedSuccess}%</p>
                  </div>
                </div>
                {execution && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="font-medium text-green-800">Transaction {execution.success ? 'Completed' : 'Pending'}</p>
                    </div>
                    {execution.transactionDetails && (
                      <div className="text-sm text-gray-700 space-y-1 mt-2">
                        <p><span className="font-medium">Transaction ID:</span> {execution.transactionDetails.transactionId}</p>
                        <p><span className="font-medium">Status:</span> {execution.transactionDetails.status}</p>
                        <p><span className="font-medium">Timestamp:</span> {new Date(execution.transactionDetails.timestamp).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Recommendations */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Alerts & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actions.alerts && actions.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-amber-800">Important Alerts</h3>
                    {actions.alerts.map((alert: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">{alert}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {actions.recommendations && actions.recommendations.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-semibold text-amber-800">Recommendations</h3>
                    {actions.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Source */}
          <div className="text-xs text-gray-500 text-center">
            Processed at: {new Date(data.metadata?.processingTime || '').toLocaleString()} | Version: {data.metadata?.routerVersion || '1.0.0'}
          </div>
        </div>
      );
    } else {
      // Generic handler for other action types
      return (
        <div className="grid gap-4 mt-4 max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">⚙️ Action Details</h3>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Action Type: {classification.actionSubtype}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(actions, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  const renderActionsCards = (data: any) => {
    if (!data.processing?.result) return null;
    
    const actions = data.processing.result;
    const classification = data.classification;
    
    // Only render cards for actions type responses
    if (data.processing.type !== 'actions') return null;
    
    return (
      <div className="grid gap-4 mt-4 max-w-4xl">
        {/* Actions Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {actions.actionType === 'transfer' ? (
              <span className="flex items-center"><ArrowRightLeft className="w-5 h-5 mr-2 text-blue-600" /> Transaction Details</span>
            ) : (
              <span className="flex items-center"><Activity className="w-5 h-5 mr-2 text-purple-600" /> Action Details</span>
            )}
          </h3>
        </div>
        
        {/* Transaction Details for Transfer Actions */}
        {actions.actionType === 'transfer' && (
          <>
            {/* Transaction Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  <span>Transaction Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Token</p>
                    <p className="font-medium text-sm">{actions.transaction.fromToken}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="font-medium text-sm">{actions.transaction.amount} {actions.transaction.fromToken}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Recipient</p>
                    <p className="font-medium text-sm truncate">{actions.transaction.recipient}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Gas Fee</p>
                    <p className="font-medium text-sm">{actions.transaction.estimatedGasFee} {actions.transaction.fromToken}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Risk Score</p>
                    <p className="font-medium text-sm">{actions.transaction.riskScore}/100</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Confidence</p>
                    <p className="font-medium text-sm">{actions.transaction.confidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Validation & Execution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Validation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Validation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Balance Check:</span>
                      <Badge variant={actions.validation.balanceCheck ? "success" : "destructive"}>
                        {actions.validation.balanceCheck ? "Sufficient" : "Insufficient"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Address Valid:</span>
                      <Badge variant={actions.validation.addressValid ? "success" : "destructive"}>
                        {actions.validation.addressValid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Network Status:</span>
                      <Badge variant={actions.validation.networkStatus === "online" ? "success" : "destructive"}>
                        {actions.validation.networkStatus === "online" ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Probability:</span>
                      <span className="font-medium text-sm">{actions.validation.estimatedSuccess}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Execution Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    {actions.execution?.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span>Execution Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {actions.execution?.success ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant="success">{actions.execution.transactionDetails.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Transaction ID:</span>
                        <span className="font-medium text-sm truncate max-w-[150px]">{actions.execution.transactionDetails.transactionId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">From:</span>
                        <span className="font-medium text-sm truncate max-w-[150px]">{actions.execution.transactionDetails.fromAccount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">To:</span>
                        <span className="font-medium text-sm truncate max-w-[150px]">{actions.execution.transactionDetails.toAccount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Timestamp:</span>
                        <span className="font-medium text-sm">{new Date(actions.execution.transactionDetails.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">Transaction failed. Please try again or contact support.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Alerts & Recommendations */}
            <div className="grid grid-cols-1 gap-4">
              {/* Alerts */}
              {actions.alerts && actions.alerts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Important Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {actions.alerts.map((alert: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                          <span className="text-sm">{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {/* Recommendations */}
              {actions.recommendations && actions.recommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {actions.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
        
        {/* Generic Display for Other Action Types */}
        {actions.actionType !== 'transfer' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>{actions.actionType} Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-medium text-sm">{actions.status}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Risk Level</p>
                    <p className="font-medium text-sm capitalize">{actions.riskLevel}</p>
                  </div>
                </div>
                
                {actions.alerts && actions.alerts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Alerts</h4>
                    <ul className="space-y-1">
                      {actions.alerts.map((alert: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <AlertTriangle className="w-3 h-3 text-amber-500 mr-1 mt-0.5" />
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {actions.steps && actions.steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Steps</h4>
                    <ol className="space-y-1 list-decimal list-inside">
                      {actions.steps.map((step: string, index: number) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  const renderInformationCards = (data: any) => {
    if (!data.processing?.result) return null;
    
    const info = data.processing.result;
    const classification = data.classification;
    
    // Only render cards for token-specific information
    if (info.requestType !== 'token_specific') return null;
    
    return (
      <div className="grid gap-4 mt-4 max-w-4xl">
        {/* Analysis Header with Save/Bookmark */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">📊 Investment Analysis Report</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const messageId = data.metadata?.timestamp || Date.now().toString();
                if (savedAnalyses.has(messageId)) {
                  unsaveAnalysis(messageId);
                } else {
                  saveAnalysis(messageId);
                }
              }}
              className="flex items-center space-x-1"
            >
              {savedAnalyses.has(data.metadata?.timestamp || '') ? (
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span>{savedAnalyses.has(data.metadata?.timestamp || '') ? 'Saved' : 'Save'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const reportText = `Investment Analysis Report for ${classification.keywords.join(', ')}
Generated: ${new Date(data.metadata?.timestamp || '').toLocaleString()}

Market Summary: ${info.analysis.marketOverview.summary}

Recommendation: ${info.recommendations[0]?.action} with ${info.recommendations[0]?.confidence}% confidence
Current Price: $${info.recommendations[0]?.currentPrice}
Target Price: $${info.recommendations[0]?.targetPrice}
Potential Return: ${((info.recommendations[0]?.targetPrice - info.recommendations[0]?.currentPrice) / info.recommendations[0]?.currentPrice * 100).toFixed(2)}%

Risk Score: ${info.recommendations[0]?.riskScore}/100
Timeline: ${info.recommendations[0]?.timeframe}

Technical Analysis:
- Trend: ${info.analysis.technicalSignals.trend}
- Support: $${info.analysis.technicalSignals.support}
- Resistance: $${info.analysis.technicalSignals.resistance}
- RSI: ${info.analysis.technicalSignals.rsi}

Investment Rationale: ${info.recommendations[0]?.reasoning}`;
                navigator.clipboard.writeText(reportText);
              }}
              className="flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* 1. Market Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Market Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Analysis for {classification.keywords.join(', ')}</h3>
                <p className="text-gray-600 mt-1">{info.analysis.marketOverview.summary}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Price</p>
                  <p className="font-medium text-sm">${info.analysis.keyMetrics.avgPrice}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">24h Change</p>
                  <p className={`font-medium text-sm ${info.analysis.keyMetrics.avgChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {info.analysis.keyMetrics.avgChange24h >= 0 ? '+' : ''}{info.analysis.keyMetrics.avgChange24h}%
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Sentiment</p>
                  <p className="font-medium text-sm capitalize">{info.analysis.marketOverview.sentiment}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Volatility</p>
                  <p className="font-medium text-sm">{info.analysis.keyMetrics.volatilityIndex}/100</p>
                </div>
              </div>
              
              {/* Enhanced Market Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <BarChart3 className="w-4 h-4 text-blue-600 mr-1" />
                    <p className="text-xs text-blue-600 font-medium">Market Cap</p>
                  </div>
                  <p className="font-bold text-sm text-blue-800">
                    ${(info.analysis.marketOverview.totalMarketCap / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="w-4 h-4 text-green-600 mr-1" />
                    <p className="text-xs text-green-600 font-medium">24h Volume</p>
                  </div>
                  <p className="font-bold text-sm text-green-800">
                    ${(info.analysis.marketOverview.volume24h / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <PieChart className="w-4 h-4 text-purple-600 mr-1" />
                    <p className="text-xs text-purple-600 font-medium">Liquidity Score</p>
                  </div>
                  <p className="font-bold text-sm text-purple-800">{info.analysis.keyMetrics.liquidityScore}/100</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Investment Recommendation & Calculator */}
        {info.recommendations && info.recommendations.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Investment Recommendation & Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {info.recommendations.map((rec: any, index: number) => {
                  const potentialReturn = ((rec.targetPrice - rec.currentPrice) / rec.currentPrice * 100);
                  const investmentAmounts = [100, 500, 1000, 5000];
                  
                  return (
                    <div key={index} className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xl">{rec.token}</span>
                          <Badge variant="outline" className={rec.action === 'BUY' ? 'bg-green-100 text-green-800 border-green-300' : rec.action === 'SELL' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}>
                            {rec.action}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            {rec.confidence}% Confidence
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Price Information */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <p className="text-xs text-blue-600 font-medium">Current Price</p>
                          <p className="font-bold text-lg text-blue-800">${rec.currentPrice}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <p className="text-xs text-green-600 font-medium">Target Price</p>
                          <p className="font-bold text-lg text-green-800">${rec.targetPrice}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <p className="text-xs text-purple-600 font-medium">Potential Return</p>
                          <p className={`font-bold text-lg ${potentialReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {potentialReturn > 0 ? '+' : ''}{potentialReturn.toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                          <p className="text-xs text-orange-600 font-medium">Timeline</p>
                          <p className="font-bold text-lg text-orange-800">{rec.timeframe}</p>
                        </div>
                      </div>

                      {/* Investment Calculator */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Investment Calculator
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {investmentAmounts.map(amount => {
                            const potentialValue = amount * (1 + potentialReturn / 100);
                            const profit = potentialValue - amount;
                            return (
                              <div key={amount} className="text-center p-3 bg-white rounded-lg border">
                                <p className="text-xs text-gray-600">Invest ${amount}</p>
                                <p className="font-medium text-sm text-gray-800">${potentialValue.toFixed(2)}</p>
                                <p className={`text-xs ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {profit > 0 ? '+' : ''}${profit.toFixed(2)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm font-medium">Risk Level:</span>
                          <div className="flex-1 max-w-[150px] h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${rec.riskScore < 30 ? 'bg-gradient-to-r from-green-400 to-green-500' : rec.riskScore < 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                              style={{ width: `${rec.riskScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {rec.riskScore}/100 
                            <span className={`ml-1 text-xs ${rec.riskScore < 30 ? 'text-green-600' : rec.riskScore < 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                              ({rec.riskScore < 30 ? 'Low' : rec.riskScore < 70 ? 'Medium' : 'High'})
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-1">Investment Rationale:</h5>
                        <p className="text-sm text-blue-700">{rec.reasoning}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Technical Analysis */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />
              <span>Technical Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trend:</span>
                <Badge variant="outline" className={info.analysis.technicalSignals.trend === 'upward' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {info.analysis.technicalSignals.trend}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Strength:</span>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${info.analysis.technicalSignals.strength < 30 ? 'bg-red-500' : info.analysis.technicalSignals.strength < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${info.analysis.technicalSignals.strength}%` }}
                  ></div>
                </div>
                <span className="text-xs">{info.analysis.technicalSignals.strength}/100</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Support</p>
                  <p className="font-medium">${info.analysis.technicalSignals.support}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Resistance</p>
                  <p className="font-medium">${info.analysis.technicalSignals.resistance}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">RSI</p>
                  <p className="font-medium">{info.analysis.technicalSignals.rsi}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Volume</p>
                  <p className="font-medium">{info.analysis.technicalSignals.volume.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Fundamental Score */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Target className="w-5 h-5" />
              <span>Fundamental Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-full max-w-[150px] h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${info.analysis.fundamentalScore.overallScore < 30 ? 'bg-red-500' : info.analysis.fundamentalScore.overallScore < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${info.analysis.fundamentalScore.overallScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{info.analysis.fundamentalScore.overallScore}/100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Ecosystem Health</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-full max-w-[80px] h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${info.analysis.fundamentalScore.ecosystemHealth}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">{info.analysis.fundamentalScore.ecosystemHealth}/100</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Development Activity</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-full max-w-[80px] h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${info.analysis.fundamentalScore.developmentActivity}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">{info.analysis.fundamentalScore.developmentActivity}/100</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Partnership Strength</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-full max-w-[80px] h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500"
                        style={{ width: `${info.analysis.fundamentalScore.partnershipStrength}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">{info.analysis.fundamentalScore.partnershipStrength}/100</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">Adoption Growth</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="w-full max-w-[80px] h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ width: `${info.analysis.fundamentalScore.adoptionGrowth}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">{info.analysis.fundamentalScore.adoptionGrowth}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Risk Warnings */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Risk Warnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {info.riskWarnings.map((warning: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{warning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 6. Actionable Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Actionable Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {info.actionableInsights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 7. Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Clock className="w-5 h-5" />
              <span>Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {info.nextSteps.map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-blue-800">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 8. Data Source */}
        <div className="text-xs text-gray-500 text-center">
          Data Source: {info.marketContext.dataSource} | Last Updated: {new Date(info.marketContext.lastUpdated).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${agentInfo.color} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{agent.name}</h1>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/agent/master')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none hover:from-green-600 hover:to-emerald-600 hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Master Agent
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 h-8 w-8 sm:h-10 sm:w-10">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 h-8 w-8 sm:h-10 sm:w-10">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 sm:space-x-3`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : `bg-gradient-to-r ${agentInfo.color}`
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`group relative ${message.sender === 'user' ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'}`}>
                      <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      }`}>
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Strategy Display */}
                      {message.strategy && renderStrategyCards(message.strategy)}
                      
                      {/* Information Display */}
                      {message.information && renderInformationCards(message.information)}
                      
                      {/* Actions Display */}
                      {message.actions && renderActionsCards(message.actions)}
                      
                      {/* Navigation Button for Approved Agents */}
                      {message.showNavigationButton && message.navigationData && (
                        <div className="mt-3">
                          <Button
                            onClick={() => router.push('/dashboard')}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                          >
                            🚀 Go to Dashboard
                          </Button>
                        </div>
                      )}
                      
                      {/* Message Actions */}
                      <div className={`absolute top-0 ${message.sender === 'user' ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex`}>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-gray-100"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {message.sender === 'agent' && message.information && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-gray-100"
                              onClick={() => {
                                if (savedAnalyses.has(message.id)) {
                                  unsaveAnalysis(message.id);
                                } else {
                                  saveAnalysis(message.id);
                                }
                              }}
                            >
                              {savedAnalyses.has(message.id) ? (
                                <BookmarkCheck className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Bookmark className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          {message.sender === 'agent' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${agentInfo.color} flex items-center justify-center`}>
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm">
                      <div className="flex space-x-1 items-center">
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm text-gray-600 ml-2">Analyzing your request...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Agent Creation Confirmation */}
              {awaitingAgentConfirmation && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${agentInfo.color} flex items-center justify-center`}>
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-4 rounded-2xl shadow-sm max-w-sm">
                      <p className="text-sm text-gray-700 mb-3">
                        Would you like me to create this agent and start implementing the strategy?
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAgentCreationConfirmation(true)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm px-4 py-2"
                        >
                          ✅ Create Agent
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAgentCreationConfirmation(false)}
                          className="text-sm px-4 py-2"
                        >
                          ❌ Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full pr-10 sm:pr-12 rounded-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 p-0"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}