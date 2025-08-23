'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Coins
} from 'lucide-react';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  address: string;
  logoURI: string;
}

interface BalanceInfo {
  address: string;
  seiBalance: string;
  totalTokens: number;
  balances: TokenBalance[];
  timestamp: string;
}

interface BalanceDisplayProps {
  balanceInfo: BalanceInfo;
  onRefreshBalance: () => void;
  isRefreshing?: boolean;
}

export default function BalanceDisplay({
  balanceInfo,
  onRefreshBalance,
  isRefreshing = false
}: BalanceDisplayProps) {
  const [hideBalances, setHideBalances] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBalance = (balance: string, decimals: number = 18) => {
    const num = parseFloat(balance);
    if (hideBalances) return '****';
    
    if (num === 0) return '0.00';
    if (num < 0.000001) return '<0.000001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Filter out zero balances except for SEI
  const nonZeroBalances = balanceInfo.balances.filter(token => 
    token.symbol === 'SEI' || parseFloat(token.balance) > 0
  );

  return (
    <Card className="w-full max-w-4xl mx-auto border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-800">Wallet Balance</CardTitle>
              <p className="text-sm text-green-600 mt-1">
                {balanceInfo.totalTokens} assets • SEI Network
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideBalances(!hideBalances)}
            >
              {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshBalance}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Wallet Address */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
              <code className="text-sm font-mono text-gray-800 break-all">
                {balanceInfo.address}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(balanceInfo.address)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* SEI Balance Highlight */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="https://sei.io/logo.png" 
                  alt="SEI" 
                  className="w-8 h-8 rounded-full bg-white p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiA2VjE4TTE4IDEySDZIMTgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo8L3N2Zz4=';
                  }}
                />
                <span className="font-semibold text-lg">SEI</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Native
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {formatBalance(balanceInfo.seiBalance)}
              </div>
              <div className="text-sm opacity-90">
                Native SEI Balance
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {nonZeroBalances.length - 1}
              </div>
              <div className="text-sm opacity-90">
                Other Tokens
              </div>
            </div>
          </div>
        </div>

        {/* Token Balances Grid */}
        {nonZeroBalances.length > 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Token Balances</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonZeroBalances.filter(token => token.symbol !== 'SEI').map((token) => (
                <div key={token.address} className="bg-white rounded-lg p-4 border border-green-200 hover:border-green-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={token.logoURI} 
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiA2VjE4TTE4IDEySDZIMTgiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo8L3N2Zz4=';
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{token.symbol}</div>
                      <div className="text-sm text-gray-600 truncate">{token.name}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-xl font-bold text-gray-800">
                      {formatBalance(token.balance, token.decimals)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono truncate">
                      {token.address.slice(0, 8)}...{token.address.slice(-6)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {nonZeroBalances.length}
              </div>
              <div className="text-sm text-gray-600">Active Tokens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatBalance(balanceInfo.seiBalance)}
              </div>
              <div className="text-sm text-gray-600">SEI Balance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {nonZeroBalances.filter(token => token.symbol !== 'SEI').length}
              </div>
              <div className="text-sm text-gray-600">ERC20 Tokens</div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last updated: {formatTimestamp(balanceInfo.timestamp)}</span>
          </div>
          {copied && (
            <Badge variant="outline" className="text-green-600 border-green-300">
              Address Copied!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}