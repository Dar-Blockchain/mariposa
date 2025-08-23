'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Eye, 
  Settings,
  Brain,
  TrendingUp,
  Shield,
  Star,
  BarChart3,
  DollarSign,
  Activity,
  Info,
  Zap,
  Target,
  Coins,
  ArrowUpDown,
  Globe,
  RefreshCw
} from 'lucide-react';
import ChatToggle from '@/components/ChatToggle';

export default function MasterAgentPage() {
  const [showQuickStart, setShowQuickStart] = useState(true);

  if (!showQuickStart) {
    return <ChatToggle />;
  }

  const quickPrompts = [
    {
      category: "Risk Management",
      color: "bg-green-50 border-green-200 text-green-800",
      icon: <Shield className="w-5 h-5" />,
      prompts: [
        { text: "Show me tokens without risk on sei-evm", icon: "🛡️" },
        { text: "Safe investment options with low risk", icon: "💰" },
        { text: "Conservative portfolio for sei-evm", icon: "🏦" }
      ]
    },
    {
      category: "High Growth",
      color: "bg-red-50 border-red-200 text-red-800",
      icon: <TrendingUp className="w-5 h-5" />,
      prompts: [
        { text: "High risk high reward tokens on sei-evm", icon: "🚀" },
        { text: "New tokens with high potential", icon: "⭐" },
        { text: "Aggressive growth strategy sei-evm", icon: "📈" }
      ]
    },
    {
      category: "Market Analysis",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <BarChart3 className="w-5 h-5" />,
      prompts: [
        { text: "sei-evm market analysis and trends", icon: "📊" },
        { text: "Overall sei network performance", icon: "🌐" },
        { text: "Market sentiment for sei ecosystem", icon: "🎯" }
      ]
    },
    {
      category: "Token Types",
      color: "bg-purple-50 border-purple-200 text-purple-800",
      icon: <Coins className="w-5 h-5" />,
      prompts: [
        { text: "DeFi tokens on sei-evm network", icon: "🔄" },
        { text: "Stablecoins available on sei-evm", icon: "💵" },
        { text: "Meme tokens and wrapped assets", icon: "🎭" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Master Agent</h1>
                <p className="text-gray-600">AI-Powered Crypto Intelligence Platform</p>
              </div>
            </div>
            <Button
              onClick={() => setShowQuickStart(false)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enhanced Intelligence
            </h2>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Get comprehensive market analysis, risk-scored token recommendations, 
            and real-time insights for the SEI-EVM ecosystem with beautiful visualizations.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">AI Analysis</h3>
              <p className="text-sm text-gray-600">Advanced token scoring with risk & profit analysis</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Real-Time Data</h3>
              <p className="text-sm text-gray-600">Live market data from SEI-EVM network</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Visual Insights</h3>
              <p className="text-sm text-gray-600">Beautiful charts and detailed breakdowns</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Risk Management</h3>
              <p className="text-sm text-gray-600">Smart filtering by risk preferences</p>
            </div>
          </div>
        </div>

        {/* Quick Start Prompts */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Start</h3>
            <p className="text-gray-600">Choose a category to get started with expert analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickPrompts.map((category, categoryIndex) => (
              <Card key={categoryIndex} className={`${category.color} border-2 hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.prompts.map((prompt, promptIndex) => (
                      <Button
                        key={promptIndex}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 bg-white/50 hover:bg-white/80 border border-white/30"
                        onClick={() => {
                          setShowQuickStart(false);
                          // We'll pass the selected prompt to the chat component
                          setTimeout(() => {
                            const event = new CustomEvent('quickPromptSelected', { 
                              detail: { prompt: prompt.text } 
                            });
                            window.dispatchEvent(event);
                          }, 100);
                        }}
                      >
                        <span className="text-lg mr-3">{prompt.icon}</span>
                        <span className="text-sm font-medium">{prompt.text}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center py-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Explore?</h3>
              <p className="text-gray-600 mb-6">
                Or start with a custom question about SEI-EVM tokens, market analysis, or trading strategies.
              </p>
              <Button
                onClick={() => setShowQuickStart(false)}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-lg px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Custom Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
