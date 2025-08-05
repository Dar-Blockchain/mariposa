
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  strategy?: any; // For storing strategy data
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
  const agentId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: agentId === 'default' 
        ? `Welcome! I'm your Master Agent - your personal AI assistant for all cryptocurrency and trading needs. I can help you with portfolio management, trading strategies, market analysis, and more. What would you like to explore today?`
        : `Hello! I'm your AI assistant. I'm here to help you with your crypto needs. How can I assist you today?`,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock agent data - in real app, this would come from your state/API
  // Special handling for Master Agent (default ID)
  const isMasterAgent = agentId === 'default';
  const agent = {
    id: agentId,
    name: isMasterAgent ? 'Master Agent' : 'AI Trading Assistant',
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
          userId: 'user123' // In real app, get this from authentication
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
          userId: 'user123' // In real app, get this from authentication
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
      let response: StrategyResponse;
      
      // If this is the master agent (default), use generate-strategy for new agent creation
      // If this is an existing agent, use modify-strategy
      // Also use modify-strategy if there's a pending strategy that was previously generated
      // BUT if we just approved an agent, always create a new one
      if (isMasterAgent && (!pendingAgentData || lastApprovedAgent)) {
        // Create new agent - either no pending data or we just approved one
        response = await callGenerateStrategy(newMessage);
        // Reset the approval tracking
        setLastApprovedAgent(null);
      } else if (isMasterAgent && pendingAgentData && !lastApprovedAgent) {
        // User has a pending strategy and is sending another message - modify the existing strategy
        response = await callModifyStrategyWithMemory(newMessage, pendingAgentData.agentUuid);
      } else {
        response = await callModifyStrategy(newMessage, agentId);
      }
      
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
            agentName: response.data.agent.name,
            defaultBudget: response.data.agent.configuration.defaultBudget,
            riskTolerance: response.data.agent.configuration.riskTolerance,
            frequency: response.data.agent.configuration.frequency,
            primaryStrategy: response.data.agent.primaryStrategy
          };
          isModification = true;
          // Update pending data for modifications
          setPendingAgentData({
            ...response.data,
            strategy: strategyInfo,
            agentUuid: response.data.agent.agentUuid,
            strategyId: response.data.strategyId
          });
        }
        
        // Create a comprehensive response message
        let responseContent = '';
        
        if (isModification) {
          // For strategy modifications
          responseContent = `🔄 **Strategy Modified Successfully!**

🤖 **${strategyInfo.agentName}** - ${strategyInfo.description}

**Updated Strategy Overview:**
• **Primary Strategy:** ${strategyInfo.primaryStrategy}
• **Risk Tolerance:** ${strategyInfo.riskTolerance}
• **Budget:** $${strategyInfo.defaultBudget?.toLocaleString()}
• **Frequency:** ${strategyInfo.frequency}
• **Strategy Version:** ${response.data.strategyVersion || 'N/A'}

**📊 Portfolio Allocation:**
${Object.entries(strategyInfo.portfolioAllocation || {}).map(([key, alloc]: [string, any]) => 
  `• **${alloc.symbol}**: ${alloc.percentage} - ${alloc.reasoning}`
).join('\n')}

**🎯 Initial Actions Required:**
${(strategyInfo.portfolioManagementPlan?.initialSetup || []).map((action: any, index: number) => 
  `${index + 1}. **${action.action}** (${action.actionType})
   • Pair: ${action.tokenPair}
   • Amount: ${action.percentage} ($${action.dollarAmount})
   • Priority: ${action.priority}
   • Timeframe: ${action.timeframe}
   • Reason: ${action.reasoning}`
).join('\n\n')}

**📈 Market Insights:**
${strategyInfo.marketInsights}

**⚠️ Risk Assessment:**
${strategyInfo.riskAssessment}

**✅ Strategy Advantages:**
${strategyInfo.strategyAdvantages}

**⚠️ Potential Drawbacks:**
${strategyInfo.potentialDrawbacks}

**📊 Success Metrics:**
${strategyInfo.successMetrics}

**🔐 Approval Status:**
${response.data.approvalStatus?.requiresApproval ? 
  `⚠️ **Requires Re-approval** - ${response.data.approvalStatus.note}` : 
  '✅ **Ready to Execute**'
}

**Memory Context:** ${response.data.memoryContext === 'used' ? '🧠 Used previous conversation history' : '🆕 New conversation'}`;

          // Don't show agent creation confirmation for modifications, show strategy directly
          setAwaitingAgentConfirmation(false);
          
        } else if (isMasterAgent) {
          // For new agent creation
          responseContent = `🤖 **${strategyInfo.agentName}** - ${strategyInfo.description}

**Strategy Overview:**
• **Primary Strategy:** ${strategyInfo.primaryStrategy}
• **Risk Tolerance:** ${strategyInfo.riskTolerance}
• **Default Budget:** $${strategyInfo.defaultBudget.toLocaleString()}
• **Frequency:** ${strategyInfo.frequency}

**Portfolio Allocation:**
${Object.values(strategyInfo.portfolioAllocation || {}).map((alloc: any) => 
  `• ${alloc.symbol}: ${alloc.percentage} - ${alloc.reasoning}`
).join('\n')}

**Risk Management:**
• **Max Position Size:** $${strategyInfo.maxPositionSize?.toLocaleString() || 'N/A'}
• **Stop Loss:** ${strategyInfo.stopLossPercentage || 'N/A'}%
• **Take Profit:** ${strategyInfo.takeProfitPercentage || 'N/A'}%

**Market Insights:** ${strategyInfo.marketInsights}

**Strategy Advantages:** ${strategyInfo.strategyAdvantages}

This strategy has been customized based on your preferences. Would you like me to create this agent?`;

          // Show agent creation confirmation for new agents
          setAwaitingAgentConfirmation(true);
        }

        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'agent',
          timestamp: new Date(),
          strategy: response.data // Store the full response
        };

        setMessages(prev => [...prev, agentMessage]);
        
        // Set awaiting confirmation only for new agent creation
        if (isMasterAgent) {
          setAwaitingAgentConfirmation(true);
        }
      }
    } catch (error) {
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
                <h3 className="font-bold text-lg text-gray-900">{strategy.agentName}</h3>
                <p className="text-gray-600 mt-1">{strategy.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Strategy</p>
                  <p className="font-medium text-sm">{strategy.primaryStrategy}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Risk Level</p>
                  <p className="font-medium text-sm capitalize">{strategy.riskTolerance}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Budget</p>
                  <p className="font-medium text-sm">${strategy.defaultBudget.toLocaleString()}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Frequency</p>
                  <p className="font-medium text-sm capitalize">{strategy.frequency}</p>
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
                <p className="text-sm text-gray-700">{strategy.strategyAdvantages}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-red-700">⚠️ Potential Drawbacks:</h4>
                <p className="text-sm text-gray-700">{strategy.potentialDrawbacks}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1 text-blue-700">📊 Success Metrics:</h4>
                <p className="text-sm text-gray-700">{strategy.successMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${isMasterAgent ? 'from-yellow-400 to-orange-500' : agentInfo.color} flex items-center justify-center flex-shrink-0 ${isMasterAgent ? 'ring-2 ring-yellow-300 ring-offset-2' : ''}`}>
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{agent.name}</h1>
                  {isMasterAgent && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none text-xs">
                      ⭐ Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {!isMasterAgent && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/agent/master')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none hover:from-green-600 hover:to-emerald-600 hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Agent
              </Button>
            )}
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
                      
                      {/* Navigation Button for Approved Agents */}
                      {message.showNavigationButton && message.navigationData && (
                        <div className="mt-3">
                          <Button
                            onClick={() => router.push(`/agent/${message.navigationData?.agentId}`)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 w-full sm:w-auto"
                          >
                            🚀 Go to {message.navigationData.agentName}
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