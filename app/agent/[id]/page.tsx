
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
  Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  strategy?: any; // For storing strategy data
}

interface StrategyResponse {
  success: boolean;
  data: {
    strategy: {
      analysis: string;
      extractedParameters: {
        intent: string;
        mentionedCoins: string[];
        budgetHints: string;
        timeline: string;
      };
      strategy: string;
      budgetRecommendation: {
        proposedBudget: string;
        minimumBudget: string;
        recommendedBudget: string;
        percentageAllocation: {
          [key: string]: string;
        };
        reasoning: string;
      };
      actionPlan: Array<{
        step: number;
        action: string;
        actionType: string;
        percentage: string;
        dollarAmount: string;
        tokenPair: string;
        ref: string;
        reasoning: string;
      }>;
      marketInsights: {
        currentConditions: string;
        priceAnalysis: string;
        recommendation: string;
        riskFactors: string;
      };
      userMessage: string;
    };
    agent: {
      id: string;
      name: string;
      primaryStrategy: string;
      configuration: any;
    };
    originalMessage: string;
    sessionId: string;
    memoryContext: string;
    timestamp: string;
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
      content: `Hello! I'm your AI assistant. I'm here to help you with your crypto needs. How can I assist you today?`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [budgetAccepted, setBudgetAccepted] = useState<boolean | null>(null);
  const [userBudget, setUserBudget] = useState<string>('');
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [awaitingBudgetResponse, setAwaitingBudgetResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock agent data - in real app, this would come from your state/API
  const agent = {
    id: agentId,
    name: 'AI Trading Assistant',
    type: 'trading' as keyof typeof agentTypes
  };

  const agentInfo = agentTypes[agent.type] || agentTypes.trading;

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
    setBudgetAccepted(accepted);
    setAwaitingBudgetResponse(false);
    
    if (accepted && strategy?.budgetRecommendation) {
      const proposedBudget = strategy.budgetRecommendation.proposedBudget || '$500';
      const proposedAmount = extractBudgetAmount(proposedBudget);
      const acceptMessage: Message = {
        id: Date.now().toString(),
        content: `Great! I'll begin working with the proposed budget of ${proposedBudget}. Let me start implementing the strategy for you.`,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, acceptMessage]);
    } else if (!accepted) {
      setUserBudget('');
      setShowBudgetWarning(false);
      const adjustMessage: Message = {
        id: Date.now().toString(),
        content: `No problem! Please let me know what budget you'd like to work with, and I'll adjust the strategy accordingly.`,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, adjustMessage]);
    }
  };

  const handleBudgetAdjustment = (strategy: any) => {
    const userAmount = parseInt(userBudget);
    const proposedBudget = strategy?.budgetRecommendation?.proposedBudget || '$500';
    const proposedAmount = extractBudgetAmount(proposedBudget);
    
    if (userAmount < proposedAmount) {
      setShowBudgetWarning(true);
      return;
    }
    
    setShowBudgetWarning(false);
    setBudgetAccepted(true);
    setAwaitingBudgetResponse(false);
    
    const adjustedMessage: Message = {
      id: Date.now().toString(),
      content: `Perfect! I'll work with your adjusted budget of $${userAmount}. Let me recalculate the strategy based on your preferred amount.`,
      sender: 'agent',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, adjustedMessage]);
  };

  const callBackendAPI = async (message: string): Promise<StrategyResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agent/strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          agentId 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling backend API:', error);
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
    setBudgetAccepted(null);
    setAwaitingBudgetResponse(false);

    try {
      const response = await callBackendAPI(newMessage);
      
      if (response.success && response.data.strategy) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.strategy.analysis,
          sender: 'agent',
          timestamp: new Date(),
          strategy: response.data // Store the full response to access agent data
        };

        setMessages(prev => [...prev, agentMessage]);
        setAwaitingBudgetResponse(true);
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
    const agent = data.agent;
    
    return (
      <div className="grid gap-4 mt-4 max-w-4xl">
        {/* 1. Strategy Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              <span>Strategy Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{strategy.userMessage}</p>
          </CardContent>
        </Card>

      {/* 2. Budget Allocation */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <DollarSign className="w-5 h-5" />
            <span>Budget Allocation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium mb-2">Proposed Budget: {strategy.budgetRecommendation?.proposedBudget || 'N/A'}</p>
              <p className="text-gray-600 mb-3">{strategy.budgetRecommendation?.reasoning || 'No reasoning provided'}</p>
            </div>
                          <div className="space-y-2">
                <h4 className="font-medium text-sm">Asset Allocation:</h4>
                {strategy.budgetRecommendation?.percentageAllocation && 
                  Object.keys(strategy.budgetRecommendation.percentageAllocation).map((token) => (
                    <div key={token} className="flex justify-between text-sm">
                      <span>{token}:</span>
                      <span className="font-medium">{strategy.budgetRecommendation.percentageAllocation[token]}</span>
                    </div>
                  ))}
              </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Analysis Parameters */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Target className="w-5 h-5" />
            <span>Analysis Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{strategy.extractedParameters?.intent || 'N/A'}</Badge>
              <span className="text-xs text-gray-600">Intent</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRiskLevelColor(agent?.configuration?.riskTolerance || 'moderate')}>
                {(agent?.configuration?.riskTolerance || 'moderate').charAt(0).toUpperCase() + (agent?.configuration?.riskTolerance || 'moderate').slice(1)} Risk
              </Badge>
              <span className="text-xs text-gray-600">Risk Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{strategy.extractedParameters?.timeline || 'N/A'}</Badge>
              <span className="text-xs text-gray-600">Timeline</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{strategy.extractedParameters?.mentionedCoins?.join(', ') || 'N/A'}</Badge>
              <span className="text-xs text-gray-600">Tokens</span>
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
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">Current Conditions:</h4>
              <p className="text-sm text-purple-700">{strategy.marketInsights.currentConditions}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Price Analysis:</h4>
              <p className="text-sm text-purple-700">{strategy.marketInsights.priceAnalysis}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Recommendation:</h4>
              <p className="text-sm text-purple-700">{strategy.marketInsights.recommendation}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Risk Factors:</h4>
              <p className="text-sm text-purple-700">{strategy.marketInsights.riskFactors}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Action Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Action Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strategy.actionPlan.map((action: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {action.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.action}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="default">{action.actionType}</Badge>
                    <Badge variant="outline">{action.percentage}</Badge>
                    <Badge variant="outline">{action.dollarAmount}</Badge>
                    <Badge variant="outline">{action.tokenPair}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{action.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Acceptance Section */}
      {awaitingBudgetResponse && budgetAccepted === null && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <CheckCircle className="w-5 h-5" />
              <span>Strategy Approval</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Do you accept this strategy and want me to begin working with the budget of {strategy.budgetRecommendation?.proposedBudget || '$500'}?
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleBudgetAcceptance(true, strategy)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Yes, Begin Working
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleBudgetAcceptance(false)}
                >
                  No, I want to adjust
                </Button>
              </div>

              {!budgetAccepted && budgetAccepted !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your preferred budget:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={userBudget}
                          onChange={(e) => {
                            setUserBudget(e.target.value);
                            setShowBudgetWarning(false);
                          }}
                          placeholder="Enter amount in USD"
                          className="flex-1"
                        />
                        <Button onClick={() => handleBudgetAdjustment(strategy)}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                    
                    {showBudgetWarning && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          ⚠️ Warning: Your budget (${userBudget}) is lower than the recommended minimum 
                          ({strategy.budgetRecommendation?.proposedBudget || '$500'}). This may limit the strategy's effectiveness.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
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
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{agent.name}</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
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