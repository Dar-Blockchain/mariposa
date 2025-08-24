'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  Bot, 
  Settings, 
  LogOut, 
  Copy,
  ExternalLink,
  DollarSign,
  Activity,
  Users,
  BarChart3,
  CreditCard,
  User,
  Home,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  RefreshCw,
  Layers,
  Zap,
  Globe
} from 'lucide-react';

export default function MainDashboard() {
  const { user, logout } = useAuth();
  const wallet = useSelector((state: any) => state.auth.wallet);
  const router = useRouter();
  
  // Mock data state
  const [seiPrice] = useState(0.3088); // Mock SEI price
  const [priceChange24h] = useState(2.5); // Mock 24h change
  const [isLoadingPrice] = useState(false); // No loading with mock data
  const [isLoadingBalance] = useState(false); // No loading with mock data
  const [lastUpdated] = useState(new Date()); // Current time
  const [seiBalance] = useState(0.959772); // Mock balance
  const [tokenBalances] = useState<any[]>([]); // Mock empty token balances
  const [masterAgentWallet] = useState('sei1abc123def456ghi789jkl012mno345pqr678stu'); // Mock wallet
  const [masterAgentName] = useState('SEI Master Agent'); // Mock agent name
  
  const portfolioValueUSD = seiBalance * seiPrice;
  
  // Mock data is now loaded statically - no API calls needed

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col shadow-2xl overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-center p-8 border-b border-orange-700/30">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-orange-500 flex items-center justify-center shadow-lg p-3">
            <Image 
              src="/mariposa-logo-transparent.png" 
              alt="Mariposa Logo" 
              width={110} 
              height={110}
              className="object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg transition-all hover:shadow-xl">
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            
            <Link href="/wallet" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <Wallet className="w-5 h-5 mr-3" />
              SEI Wallet
            </Link>
            
            <Link href="/trading" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <TrendingUp className="w-5 h-5 mr-3" />
              Trading
            </Link>
            
            <button 
              onClick={() => {
                console.log('🚀 Navigating to Pipeline...');
                router.push('/pipeline');
              }}
              className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md w-full text-left"
            >
              <Layers className="w-5 h-5 mr-3" />
              Pipeline
            </button>
            
            <Link href="/cards" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <CreditCard className="w-5 h-5 mr-3" />
              Cards
            </Link>
            
            <Link href="/analytics" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </Link>
            
            <Link href="/activity" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <Activity className="w-5 h-5 mr-3" />
              Activity
            </Link>
            
            <Link href="/agents" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <Bot className="w-5 h-5 mr-3" />
              SEI Agents
              <span className="ml-auto bg-purple-600 text-xs px-2 py-1 rounded-full">1</span>
            </Link>
            
            <Link href="/profile" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <User className="w-5 h-5 mr-3" />
              Profile
            </Link>
            
            <Link href="/settings" className="flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all hover:shadow-md">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-purple-700/30">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-md">
              <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-purple-300 truncate">{user?.email || 'user@mariposa.trade'}</p>
            </div>
            <button 
              onClick={logout}
              className="text-purple-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-purple-800/50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-purple-200/30 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-700 bg-clip-text text-transparent truncate">SEI Portfolio Dashboard</h1>
              <p className="text-slate-600 text-sm">Track your SEI network investments and manage your crypto portfolio</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button 
                onClick={() => {
                  console.log('🔄 Refreshing SEI data...');
                  // Trigger refresh
                  window.location.reload();
                }}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => {
                  console.log('🚀 Navigating to Master Agent...');
                  router.push('/agent/master');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="max-w-full">
            <div className="grid grid-cols-12 gap-6">
              {/* Portfolio Value Card */}
              <div className="col-span-12 xl:col-span-8">
              <Card className="bg-gradient-to-br from-orange-500 via-purple-600 to-pink-500 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-white/90" />
                      <h3 className="text-lg font-medium text-white/90">SEI Portfolio Value</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white/70">Live</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-baseline space-x-3">
                      <p className="text-4xl font-bold">
                        {isLoadingBalance || isLoadingPrice ? (
                          <span className="animate-pulse">$---.--</span>
                        ) : (
                          `$${portfolioValueUSD.toFixed(2)}`
                        )}
                      </p>
                      <span className="text-lg text-white/80">
                        {isLoadingBalance ? '-.--' : seiBalance.toFixed(3)} SEI
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-300">
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        <span className="text-sm">SEI Network • Connected</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/80">
                          SEI: ${seiPrice.toFixed(4)}
                        </div>
                        <div className={`text-xs flex items-center ${
                          priceChange24h >= 0 ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {priceChange24h >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3 mr-1" />
                          )}
                          {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% 24h
                        </div>
                      </div>
                    </div>
                    {lastUpdated && (
                      <div className="text-xs text-white/60">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

              {/* Quick Actions */}
              <div className="col-span-12 xl:col-span-4">
              <Card className="shadow-lg border-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Buy SEI
                  </Button>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send SEI
                  </Button>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                  <Button 
                    onClick={() => router.push('/pipeline')}
                    className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white shadow-md"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Create Strategy
                  </Button>
                </CardContent>
              </Card>
              </div>

              {/* Holdings */}
              <div className="col-span-12">
              <Card className="shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-purple-600" />
                    SEI Network Holdings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* SEI Holding */}
                    <div className="flex items-center justify-between py-4 border-b border-purple-100">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                          <span className="text-white font-bold text-sm">SEI</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">SEI Network</h4>
                          <p className="text-gray-500 text-sm">Native Token</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">
                              {isLoadingBalance ? (
                                <span className="animate-pulse">-.--- SEI</span>
                              ) : (
                                `${seiBalance.toFixed(3)} SEI`
                              )}
                            </p>
                            <p className="text-sm text-green-600 flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Connected
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {isLoadingBalance || isLoadingPrice ? (
                                <span className="animate-pulse">$---.--</span>
                              ) : (
                                `$${portfolioValueUSD.toFixed(2)}`
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${seiPrice.toFixed(4)} per SEI
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Token Holdings */}
                    {tokenBalances.length > 0 && tokenBalances.map((token, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-purple-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-xs">{token.symbol?.slice(0,3) || 'T'}</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{token.name || token.symbol || 'Token'}</h5>
                            <p className="text-gray-500 text-sm">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{parseFloat(token.balance || 0).toFixed(4)}</p>
                          <p className="text-sm text-gray-500">{token.type || 'Token'}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Master Agent Wallet Information */}
                    <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 border border-orange-100">
                      <h5 className="font-medium text-orange-900 mb-3 flex items-center">
                        <Bot className="w-4 h-4 mr-2" />
                        {masterAgentName || 'Master SEI Agent'}
                      </h5>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {masterAgentWallet && (
                          <div className="bg-white/50 rounded-lg p-3 border border-orange-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-orange-600 font-medium">Wallet Address:</span>
                              <button 
                                onClick={() => navigator.clipboard.writeText(masterAgentWallet)}
                                className="text-orange-500 hover:text-orange-700 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="font-mono text-xs text-gray-700 break-all bg-gray-50 p-2 rounded overflow-hidden">
                              {masterAgentWallet}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-orange-600">Network:</span>
                              <span className="text-orange-900 font-medium">SEI Mainnet</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-600">Status:</span>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                                Active
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-orange-600">Agent Type:</span>
                              <span className="text-orange-900 font-medium">Master Bot</span>
                            </div>
                            {lastUpdated && (
                              <div className="flex justify-between">
                                <span className="text-orange-600">Last Update:</span>
                                <span className="text-orange-900">{lastUpdated.toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Token count or empty state */}
                    {tokenBalances.length === 0 && !isLoadingBalance && (
                      <div className="text-center py-6 text-gray-500">
                        <Globe className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Additional SEI network tokens will appear here as you acquire them.</p>
                        <p className="text-sm mt-1">Start trading to build your portfolio!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}