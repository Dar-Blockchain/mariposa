'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthWrapper';
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
  ArrowDownLeft
} from 'lucide-react';

export default function MainDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 text-white flex flex-col">
        {/* Logo */}
        <div className="flex items-center p-6 border-b border-slate-700">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">CryptoVault</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white transition-colors">
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            
            <Link href="/wallet" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Wallet className="w-5 h-5 mr-3" />
              Wallet
            </Link>
            
            <Link href="/trading" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5 mr-3" />
              Trading
            </Link>
            
            <Link href="/cards" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <CreditCard className="w-5 h-5 mr-3" />
              Cards
            </Link>
            
            <Link href="/analytics" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </Link>
            
            <Link href="/activity" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Activity className="w-5 h-5 mr-3" />
              Activity
            </Link>
            
            <Link href="/agents" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Bot className="w-5 h-5 mr-3" />
              Agents
              <span className="ml-auto bg-slate-600 text-xs px-2 py-1 rounded">0</span>
            </Link>
            
            <Link href="/profile" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <User className="w-5 h-5 mr-3" />
              Profile
            </Link>
            
            <Link href="/settings" className="flex items-center px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium">{user?.name?.charAt(0) || 'J'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'John Doe'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'john@example.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
              <p className="text-gray-600">Track your crypto investments and manage your portfolio</p>
            </div>
                         <Link href="/agent/default">
               <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                 <Plus className="w-4 h-4 mr-2" />
                 Create Agent
               </Button>
             </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Portfolio Value Card */}
            <div className="col-span-8">
              <Card className="bg-gradient-to-br from-purple-500 via-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white/90">Total Portfolio Value</h3>
                    <Eye className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold">$56,752.89</p>
                    <div className="flex items-center text-green-300">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span className="text-sm">+8.5% ($4,234.12) Last 24h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Buy Crypto
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Holdings */}
            <div className="col-span-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Your Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Bitcoin Holding */}
                    <div className="flex items-center justify-between py-4 border-b">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">BTC</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Bitcoin</h4>
                          <p className="text-gray-500 text-sm">BTC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">0.5432</p>
                            <p className="text-sm text-green-600">+5.2%</p>
                          </div>
                          <p className="font-semibold text-gray-900">$27,564.32</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add more holdings here if needed */}
                    <div className="text-center py-8 text-gray-500">
                      <p>More holdings will appear here as you add them to your portfolio.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 