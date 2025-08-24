'use client';

import { useState, useEffect } from 'react';
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
  RefreshCw,
  ChevronRight,
  Layers,
  Rocket,
  TrendingDown
} from 'lucide-react';
import ChatToggle from '@/components/ChatToggle';

export default function MasterAgentPage() {
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!showQuickStart) {
    return <ChatToggle />;
  }

  const quickPrompts = [
    {
      category: "Risk Management",
      description: "Conservative strategies for stable growth",
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 via-green-50 to-teal-50",
      borderColor: "border-emerald-200",
      icon: <Shield className="w-6 h-6" />,
      prompts: [
        { text: "Show me tokens without risk on sei-evm", icon: "🛡️", description: "Find the safest investment options" },
        { text: "Safe investment options with low risk", icon: "💰", description: "Conservative portfolio recommendations" },
        { text: "Conservative portfolio for sei-evm", icon: "🏦", description: "Balanced risk-reward strategies" }
      ]
    },
    {
      category: "High Growth",
      description: "Aggressive strategies for maximum returns",
      gradient: "from-red-500 via-pink-500 to-rose-500",
      bgGradient: "from-red-50 via-pink-50 to-rose-50",
      borderColor: "border-red-200",
      icon: <TrendingUp className="w-6 h-6" />,
      prompts: [
        { text: "High risk high reward tokens on sei-evm", icon: "🚀", description: "Discover explosive growth potential" },
        { text: "New tokens with high potential", icon: "⭐", description: "Early-stage investment opportunities" },
        { text: "Aggressive growth strategy sei-evm", icon: "📈", description: "Maximum profit optimization" }
      ]
    },
    {
      category: "Market Analysis",
      description: "Deep insights into market trends",
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
      borderColor: "border-blue-200",
      icon: <BarChart3 className="w-6 h-6" />,
      prompts: [
        { text: "sei-evm market analysis and trends", icon: "📊", description: "Comprehensive market overview" },
        { text: "Overall sei network performance", icon: "🌐", description: "Network health and metrics" },
        { text: "Market sentiment for sei ecosystem", icon: "🎯", description: "Community and investor sentiment" }
      ]
    },
    {
      category: "Token Discovery",
      description: "Explore diverse token categories",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      bgGradient: "from-purple-50 via-violet-50 to-indigo-50",
      borderColor: "border-purple-200",
      icon: <Coins className="w-6 h-6" />,
      prompts: [
        { text: "DeFi tokens on sei-evm network", icon: "🔄", description: "Decentralized finance opportunities" },
        { text: "Stablecoins available on sei-evm", icon: "💵", description: "Stable value preservation options" },
        { text: "Meme tokens and wrapped assets", icon: "🎭", description: "Community-driven investments" }
      ]
    }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze thousands of data points",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      delay: "delay-0"
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Real-Time Intelligence",
      description: "Live market data updated every second",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      delay: "delay-100"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Visual Insights",
      description: "Beautiful charts and interactive visualizations",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      delay: "delay-200"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk Assessment",
      description: "Comprehensive risk scoring and management",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      delay: "delay-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 165, 0, 0.2) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
                                 radial-gradient(circle at 40% 80%, rgba(255, 140, 0, 0.15) 0%, transparent 50%)`
             }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <img 
                  src="/mariposa-logo.png" 
                  alt="Mariposa" 
                  className="w-16 h-16 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                  Mariposa Agent
                </h1>
                <p className="text-gray-600 font-medium">AI-Powered Crypto Intelligence</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-600 text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowQuickStart(false)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 px-6 py-2.5 text-sm font-semibold rounded-lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Start Chat
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Sparkles className={`w-8 h-8 text-orange-500 transition-all duration-1000 ${animationPhase === 0 ? 'scale-110 rotate-12' : animationPhase === 1 ? 'scale-100 rotate-0' : 'scale-105 -rotate-6'}`} />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Enhanced Intelligence
            </h2>
            <div className="relative">
              <Zap className={`w-8 h-8 text-red-500 transition-all duration-1000 ${animationPhase === 1 ? 'scale-110 rotate-12' : animationPhase === 2 ? 'scale-100 rotate-0' : 'scale-105 -rotate-6'}`} />
            </div>
          </div>
          
          <p className="text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Experience the future of crypto analysis with our advanced AI that delivers 
            <span className="text-orange-600 font-semibold"> real-time insights</span>, 
            <span className="text-red-600 font-semibold"> risk-scored recommendations</span>, and 
            <span className="text-orange-500 font-semibold"> beautiful visualizations</span> for the SEI-EVM ecosystem.
          </p>
          
          {/* Enhanced Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${feature.delay}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 ${hoveredCard === index ? 'scale-110' : ''}`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base group-hover:text-blue-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-4 h-4 text-orange-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Quick Start Prompts */}
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Your Journey</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your path and let our AI guide you through the SEI-EVM ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {quickPrompts.map((category, categoryIndex) => (
              <Card 
                key={categoryIndex} 
                className={`group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="pb-6 relative z-10">
                  <CardTitle className="flex items-center gap-4 text-xl">
                    <div className={`p-2.5 bg-gradient-to-r ${category.gradient} rounded-lg text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold">{category.category}</div>
                      <div className="text-sm text-gray-500 font-normal mt-1">{category.description}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {category.prompts.map((prompt, promptIndex) => (
                      <Button
                        key={promptIndex}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3.5 bg-white/60 hover:bg-white/90 border border-gray-200/50 hover:border-gray-300/60 rounded-lg group/button transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                        onClick={() => {
                          setShowQuickStart(false);
                          setTimeout(() => {
                            const event = new CustomEvent('quickPromptSelected', { 
                              detail: { prompt: prompt.text } 
                            });
                            window.dispatchEvent(event);
                          }, 100);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-lg group-hover/button:scale-105 transition-transform duration-200">
                            {prompt.icon}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 group-hover/button:text-gray-800 text-sm">
                              {prompt.text}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {prompt.description}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover/button:text-gray-600 group-hover/button:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Call to Action */}
          <div className="text-center py-16">
            <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-10 border border-gray-200/50 shadow-lg max-w-4xl mx-auto overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-4 left-4 w-16 h-16 bg-orange-200 rounded-full opacity-40"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-red-200 rounded-full opacity-40"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-orange-100 rounded-full opacity-30"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-orange-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Ready to Unlock Alpha?</h3>
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Start with a custom question about SEI-EVM tokens, market analysis, or trading strategies. 
                  Our AI is ready to provide <span className="text-orange-600 font-semibold">instant insights</span> and 
                  <span className="text-red-600 font-semibold">actionable recommendations</span>.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => setShowQuickStart(false)}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 text-base px-8 py-3 rounded-lg font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Custom Chat
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium">AI Agent Online</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-6 border-t border-gray-200/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">10K+</div>
                    <div className="text-gray-600 text-sm">Tokens Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">99.9%</div>
                    <div className="text-gray-600 text-sm">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">&lt;1s</div>
                    <div className="text-gray-600 text-sm">Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
