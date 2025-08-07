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
  AlertCircle,
  TrendingDown,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Calculator,
  PieChart,
  Percent
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  classification?: {
    category: string;
    reason: string;
  };
  responseData?: any; // Complete response data from backend
}

interface AgentRouteResponse {
  success: boolean;
  data: {
    // Layer 1 results
    classification: {
      type: string;
      confidence: number;
      reasoning: string;
      keywords: string[];
      actionSubtype?: string;
    };
    
    // Layer 2 results  
    processing: {
      type: string;
      subtype?: string;
      status: string;
      result: {
        actionType?: string;
        steps?: string[];
        warnings?: string[];
        riskLevel?: string;
        estimatedTime?: string;
        executionStatus?: string;
        execution?: {
          success: boolean;
          transactionDetails?: any;
          executionSummary?: any;
          parsedRequest?: any;
          error?: string;
        };
        // Strategy fields
        recommendations?: string[];
        strategyType?: string;
        riskAssessment?: string;
        timeframe?: string;
        // Information fields
        answer?: string;
        category?: string;
        relatedData?: any[];
        // Feedback fields
        sentiment?: string;
        keyInsights?: string[];
        suggestions?: string[];
        analysis?: string;
        // General response
        response?: string;
      };
    };
    
    // Metadata
    metadata: {
      originalMessage: string;
      userId?: string;
      agentId?: string;
      processingTime: string;
      timestamp: string;
      routerVersion: string;
    };
  };
}

export default function MasterAgentChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Welcome! I'm your Master Agent - your comprehensive AI assistant for all cryptocurrency and trading needs. I can help you with:

🔍 **Information** - Market data, price analysis, crypto explanations
⚡ **Actions** - Trading operations, transfers, swaps
📊 **Strategy** - Investment plans, portfolio recommendations  
💬 **Feedback** - Performance analysis, trade reviews

Ask me anything about crypto, and I'll provide detailed insights and actionable guidance!`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [savedAnalyses, setSavedAnalyses] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    setSessionId(newSessionId);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveAnalysis = (messageId: string) => {
    setSavedAnalyses(prev => new Set(prev).add(messageId));
    // In a real app, you would also save to localStorage or backend
    const analysisData = messages.find(m => m.id === messageId);
    if (analysisData?.responseData) {
      localStorage.setItem(`analysis_${messageId}`, JSON.stringify(analysisData.responseData));
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

  const callAgentRoute = async (message: string): Promise<AgentRouteResponse> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const userId = user?.id || (user as any)?._id || 'user123';
      
      const response = await fetch(`${apiUrl}/api/agent/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                body: JSON.stringify({
          message,
          userId,
          agentId: 'master-agent',
          execute: true // Enable full processing for comprehensive analysis
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
      const agentResponse = await callAgentRoute(newMessage);
      
      if (agentResponse.success && agentResponse.data) {
        const { classification, processing } = agentResponse.data;
        
        // Create classification object compatible with our UI
        const demandClassification = {
          category: classification?.type === 'actions' ? 'action' : classification?.type || 'information',
          reason: classification?.reasoning || 'Processing your request'
        };
        
        // Generate response content based on processing results
        let responseContent = '';
        if (processing?.result) {
          if (processing.type === 'actions') {
            responseContent = `🎯 **Action Request Processed**\n\nI've analyzed your request and prepared the following action plan.`;
          } else if (processing.type === 'strategy') {
            responseContent = `📊 **Strategy Analysis**\n\nI've analyzed your strategy requirements and prepared recommendations.`;
          } else if (processing.type === 'information') {
            responseContent = `ℹ️ **Information Response**\n\nHere's the information you requested.`;
          } else if (processing.type === 'feedbacks') {
            responseContent = `💬 **Feedback Analysis**\n\nI've analyzed your feedback and prepared insights.`;
          } else {
            responseContent = processing.result.response || 'Processing your request...';
          }
        } else {
          responseContent = 'Processing your request...';
        }
        
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'agent',
          timestamp: new Date(),
          classification: demandClassification,
          responseData: agentResponse.data
        };
        
        setMessages(prev => [...prev, agentMessage]);
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

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getClassificationIcon = (category: string) => {
    switch (category) {
      case 'information': return <Info className="w-5 h-5 text-blue-600" />;
      case 'action': 
      case 'actions': return <Zap className="w-5 h-5 text-green-600" />;
      case 'strategy': return <Target className="w-5 h-5 text-purple-600" />;
      case 'feedback': return <MessageSquare className="w-5 h-5 text-orange-600" />;
      default: return <Bot className="w-5 h-5 text-gray-600" />;
    }
  };

  const getClassificationColor = (category: string) => {
    switch (category) {
      case 'information': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'action': 
      case 'actions': return 'bg-green-100 text-green-800 border-green-200';
      case 'strategy': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'feedback': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderInformationResponse = (data: any) => {
    const { processing, classification, metadata } = data;
    const info = processing?.result || {};
    
    // Only render enhanced cards for token-specific information
    if (info.requestType !== 'token_specific') {
      // Fallback to simple display for general information
      return (
        <div className="mt-4 space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Info className="w-5 h-5" />
                <span>Information Response</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {(classification?.confidence * 100)?.toFixed(0)}% confident
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">{classification?.reasoning}</p>
              {info.answer && <p className="text-sm leading-relaxed mt-3">{info.answer}</p>}
            </CardContent>
          </Card>
        </div>
      );
    }
    
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
                const messageId = metadata?.timestamp || Date.now().toString();
                if (savedAnalyses.has(messageId)) {
                  unsaveAnalysis(messageId);
                } else {
                  saveAnalysis(messageId);
                }
              }}
              className="flex items-center space-x-1"
            >
              {savedAnalyses.has(metadata?.timestamp || '') ? (
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span>{savedAnalyses.has(metadata?.timestamp || '') ? 'Saved' : 'Save'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const reportText = `Investment Analysis Report for ${classification.keywords.join(', ')}
Generated: ${new Date(metadata?.timestamp || '').toLocaleString()}

Market Summary: ${info.analysis?.marketOverview?.summary}

Recommendation: ${info.recommendations?.[0]?.action} with ${info.recommendations?.[0]?.confidence}% confidence
Current Price: $${info.recommendations?.[0]?.currentPrice}
Target Price: $${info.recommendations?.[0]?.targetPrice}
Potential Return: ${info.recommendations?.[0] ? ((info.recommendations[0].targetPrice - info.recommendations[0].currentPrice) / info.recommendations[0].currentPrice * 100).toFixed(2) : '0'}%

Risk Score: ${info.recommendations?.[0]?.riskScore}/100
Timeline: ${info.recommendations?.[0]?.timeframe}

Technical Analysis:
- Trend: ${info.analysis?.technicalSignals?.trend}
- Support: $${info.analysis?.technicalSignals?.support}
- Resistance: $${info.analysis?.technicalSignals?.resistance}
- RSI: ${info.analysis?.technicalSignals?.rsi}

Investment Rationale: ${info.recommendations?.[0]?.reasoning}`;
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
                <p className="text-gray-600 mt-1">{info.analysis?.marketOverview?.summary}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Price</p>
                  <p className="font-medium text-sm">${info.analysis?.keyMetrics?.avgPrice}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">24h Change</p>
                  <p className={`font-medium text-sm ${info.analysis?.keyMetrics?.avgChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {info.analysis?.keyMetrics?.avgChange24h >= 0 ? '+' : ''}{info.analysis?.keyMetrics?.avgChange24h}%
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Sentiment</p>
                  <p className="font-medium text-sm capitalize">{info.analysis?.marketOverview?.sentiment}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Volatility</p>
                  <p className="font-medium text-sm">{info.analysis?.keyMetrics?.volatilityIndex}/100</p>
                </div>
              </div>
              
              {/* Enhanced Market Metrics */}
              {info.analysis?.marketOverview && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BarChart3 className="w-4 h-4 text-blue-600 mr-1" />
                      <p className="text-xs text-blue-600 font-medium">Market Cap</p>
                    </div>
                    <p className="font-bold text-sm text-blue-800">
                      ${((info.analysis.marketOverview.totalMarketCap || 0) / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-4 h-4 text-green-600 mr-1" />
                      <p className="text-xs text-green-600 font-medium">24h Volume</p>
                    </div>
                    <p className="font-bold text-sm text-green-800">
                      ${((info.analysis.marketOverview.volume24h || 0) / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <PieChart className="w-4 h-4 text-purple-600 mr-1" />
                      <p className="text-xs text-purple-600 font-medium">Liquidity Score</p>
                    </div>
                    <p className="font-bold text-sm text-purple-800">{info.analysis?.keyMetrics?.liquidityScore}/100</p>
                  </div>
                </div>
              )}
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
                          <Calculator className="w-4 h-4 mr-2" />
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

        {/* Processing Metadata */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Activity className="w-5 h-5" />
              <span>Analysis Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Processing Time:</strong> {metadata?.processingTime}</div>
              <div><strong>AI Model:</strong> {info.marketContext?.aiModel}</div>
              <div><strong>Data Source:</strong> {info.marketContext?.dataSource}</div>
              <div><strong>Last Updated:</strong> {new Date(info.marketContext?.lastUpdated || '').toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderActionResponse = (data: any) => {
    const { processing, classification, metadata } = data;
    const result = processing?.result || {};
    
    return (
      <div className="grid gap-4 mt-4 max-w-4xl">
        {/* Action Header with Save/Export */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">⚡ Blockchain Action Executed</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const messageId = metadata?.timestamp || Date.now().toString();
                if (savedAnalyses.has(messageId)) {
                  unsaveAnalysis(messageId);
                } else {
                  saveAnalysis(messageId);
                }
              }}
              className="flex items-center space-x-1"
            >
              {savedAnalyses.has(metadata?.timestamp || '') ? (
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span>Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const reportText = `Blockchain Action Report
Generated: ${new Date(metadata?.timestamp || '').toLocaleString()}

Action: ${classification?.actionSubtype || result.actionType}
Status: ${result.executionStatus}

${result.execution?.transactionDetails ? `
Transaction Details:
- Transaction ID: ${result.execution.transactionDetails.transactionId}
- From: ${result.execution.transactionDetails.fromAccount}
- To: ${result.execution.transactionDetails.toAccount}
- Amount: ${result.execution.transactionDetails.amount} ${result.execution.transactionDetails.tokenId || 'HBAR'}
- Status: ${result.execution.transactionDetails.status}
- Timestamp: ${result.execution.transactionDetails.timestamp}
` : ''}

Original Message: ${metadata?.originalMessage}`;
                navigator.clipboard.writeText(reportText);
              }}
              className="flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Classification & Status Header */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-800">
                <Zap className="w-5 h-5" />
                <span>Action: {classification?.actionSubtype || result.actionType}</span>
              </div>
              <Badge className={`${
                result.executionStatus === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                result.executionStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-300' :
                result.executionStatus === 'guidance_only' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                'bg-gray-100 text-gray-800 border-gray-300'
              }`}>
                {result.executionStatus === 'completed' ? '✅ EXECUTED' : 
                 result.executionStatus === 'failed' ? '❌ FAILED' :
                 result.executionStatus === 'guidance_only' ? '💡 GUIDANCE' : 'PENDING'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">{classification?.reasoning}</p>
            {result.userMessage && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">{result.userMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details */}
        {result.transaction && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <ArrowUpDown className="w-5 h-5" />
                <span>Transaction Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">Currency</p>
                  <p className="font-bold text-blue-800">{result.transaction.fromToken || 'HBAR'}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">Amount</p>
                  <p className="font-bold text-blue-800">{result.transaction.amount}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">Recipient</p>
                  <p className="font-bold text-blue-800 text-xs">{result.transaction.recipient}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">Gas Fee</p>
                  <p className="font-bold text-blue-800">{result.transaction.estimatedGasFee} HBAR</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">Est. Time</p>
                  <p className="font-bold text-blue-800">{result.transaction.estimatedTime}s</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 font-medium">Confidence</p>
                  <p className="font-bold text-green-600">{result.transaction.confidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Status */}
        {result.validation && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <CheckCircle className="w-5 h-5" />
                <span>Validation Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${result.validation.balanceCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Balance Check</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${result.validation.addressValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Address Valid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${result.validation.networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">Network Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Success Rate: {result.validation.estimatedSuccess}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Execution Results */}
        {result.execution && (
          <Card className={result.execution.success ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : "bg-gradient-to-br from-red-50 to-pink-50 border-red-200"}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center space-x-2 ${result.execution.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.execution.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>Execution Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.execution.success ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-700">Transaction executed successfully!</p>
                  </div>
                  
                  {result.execution.transactionDetails && (
                    <div className="grid gap-3">
                      <div className="p-4 bg-white rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Transaction Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <code className="bg-green-100 px-2 py-1 rounded text-green-800">{result.execution.transactionDetails.transactionId}</code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">From Account:</span>
                            <span className="font-mono">{result.execution.transactionDetails.fromAccount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To Account:</span>
                            <span className="font-mono">{result.execution.transactionDetails.toAccount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">{result.execution.transactionDetails.amount} {result.execution.transactionDetails.tokenId || 'HBAR'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge className="bg-green-100 text-green-800">{result.execution.transactionDetails.status}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Timestamp:</span>
                            <span>{new Date(result.execution.transactionDetails.timestamp).toLocaleString()}</span>
                          </div>
                          {result.execution.transactionDetails.memo && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Memo:</span>
                              <span className="italic">{result.execution.transactionDetails.memo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-red-700">❌ Execution failed: {result.execution.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {result.alerts && result.alerts.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Important Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.alerts.map((alert: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-100 rounded">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-700">{alert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Metadata */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-gray-700">
              <Activity className="w-5 h-5" />
              <span>Processing Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Processing Time:</strong> {metadata?.processingTime}</div>
              <div><strong>Processing Method:</strong> {processing?.processingMethod}</div>
              <div><strong>Router Version:</strong> {metadata?.routerVersion}</div>
              <div><strong>Agent ID:</strong> {metadata?.agentId}</div>
              <div><strong>Original Message:</strong> "{metadata?.originalMessage}"</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStrategyResponse = (data: any) => {
    const { processing, classification } = data;
    const result = processing?.result || {};
    
    return (
      <div className="mt-4 space-y-4">
        {/* Classification Header */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Target className="w-5 h-5" />
              <span>Strategy Analysis</span>
              {result.strategyType && (
                <Badge className="bg-purple-100 text-purple-800">
                  {result.strategyType}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">{classification?.reasoning}</p>
          </CardContent>
        </Card>

        {/* Strategy Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeframe */}
        {result.timeframe && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Timeframe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.timeframe}</p>
            </CardContent>
          </Card>
        )}

        {/* Risk Assessment */}
        {result.riskAssessment && (
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">{result.riskAssessment}</p>
            </CardContent>
          </Card>
        )}

        {/* General Response */}
        {result.response && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span>Strategy Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.response}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderFeedbackResponse = (data: any) => {
    const { processing, classification } = data;
    const result = processing?.result || {};
    
    return (
      <div className="mt-4 space-y-4">
        {/* Classification Header */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <MessageSquare className="w-5 h-5" />
              <span>Feedback Analysis</span>
              {result.sentiment && (
                <Badge className={`${
                  result.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  result.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.sentiment.toUpperCase()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">{classification?.reasoning}</p>
          </CardContent>
        </Card>

        {/* Analysis */}
        {result.analysis && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.analysis}</p>
            </CardContent>
          </Card>
        )}

        {/* Key Insights */}
        {result.keyInsights && result.keyInsights.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.keyInsights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        {result.suggestions && result.suggestions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Response */}
        {result.response && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span>Feedback Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.response}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderResponseData = (message: Message) => {
    if (!message.responseData || !message.classification) return null;

    switch (message.classification.category) {
      case 'information':
        return renderInformationResponse(message.responseData);
      case 'action':
        return renderActionResponse(message.responseData);
      case 'strategy':
        return renderStrategyResponse(message.responseData);
      case 'feedback':
        return renderFeedbackResponse(message.responseData);
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 ring-2 ring-yellow-300 ring-offset-2">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Master Agent</h1>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none text-xs">
                    ⭐ AI Assistant
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-gray-600">Online • Ready to Help</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[95%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 sm:space-x-3`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500'
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
                        
                        {/* Classification Badge */}
                        {message.classification && message.sender === 'agent' && (
                          <div className="mt-3 flex items-center space-x-2">
                            {getClassificationIcon(message.classification.category)}
                            <Badge className={getClassificationColor(message.classification.category)}>
                              {message.classification.category.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Detailed Response Data */}
                      {renderResponseData(message)}
                      
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
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm">
                      <div className="flex space-x-1 items-center">
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm text-gray-600 ml-2">Analyzing and processing your request...</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about crypto, trading strategies, market analysis..."
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