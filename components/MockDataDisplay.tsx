'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  Coins,
  Star,
  Target,
  Shield,
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Mock data for demonstration
export const mockInformationResponses = {
  marketData: {
    classification: {
      category: 'information',
      confidence: 0.95,
      keywords: ['price', 'market', 'analysis', 'bitcoin'],
      reasoning: 'User is requesting current market information and price analysis'
    },
    processing: {
      result: 'Current Bitcoin market analysis shows strong bullish momentum with increased institutional adoption and favorable regulatory developments.',
      status: 'completed'
    },
    marketData: {
      price: 45250.00,
      change24h: 5.2,
      volume24h: 28500000000,
      marketCap: 890000000000,
      dominance: 42.3,
      fear_greed_index: 75
    },
    recommendations: [
      'Consider dollar-cost averaging for long-term positions',
      'Monitor key resistance levels at $46,000 and $48,000',
      'Keep an eye on institutional buying patterns',
      'Set stop-losses below $43,000 for risk management'
    ],
    processingSteps: [
      { step: 'Data Collection', status: 'completed', description: 'Fetched real-time market data' },
      { step: 'Technical Analysis', status: 'completed', description: 'Analyzed price patterns and indicators' },
      { step: 'Sentiment Analysis', status: 'completed', description: 'Evaluated market sentiment' },
      { step: 'Report Generation', status: 'completed', description: 'Compiled comprehensive analysis' }
    ]
  },
  
  defiExplanation: {
    classification: {
      category: 'information',
      confidence: 0.88,
      keywords: ['defi', 'explanation', 'guide', 'education'],
      reasoning: 'User is seeking educational information about DeFi concepts'
    },
    processing: {
      result: 'DeFi (Decentralized Finance) represents a paradigm shift in financial services, leveraging blockchain technology to create open, permissionless financial systems.',
      status: 'completed'
    },
    educationalContent: {
      overview: 'DeFi eliminates intermediaries in financial transactions',
      keyFeatures: [
        'Permissionless access',
        'Programmable money',
        'Transparent protocols',
        'Global accessibility'
      ],
      popularProtocols: [
        { name: 'Uniswap', type: 'DEX', tvl: '$4.2B' },
        { name: 'Compound', type: 'Lending', tvl: '$2.8B' },
        { name: 'AAVE', type: 'Lending', tvl: '$6.1B' },
        { name: 'MakerDAO', type: 'Stablecoin', tvl: '$8.9B' }
      ]
    },
    riskAssessment: {
      overallRisk: 'medium',
      riskDescription: 'DeFi protocols carry smart contract risks and regulatory uncertainty',
      factors: [
        { name: 'Smart Contract Risk', level: 'medium', description: 'Potential bugs in protocol code' },
        { name: 'Impermanent Loss', level: 'medium', description: 'Risk for liquidity providers' },
        { name: 'Regulatory Risk', level: 'high', description: 'Uncertain regulatory landscape' }
      ]
    },
    recommendations: [
      'Start with small amounts to learn the ecosystem',
      'Research protocols thoroughly before investing',
      'Diversify across multiple protocols',
      'Stay updated on security audits',
      'Understand gas fees and transaction costs'
    ]
  },

  tradingStrategy: {
    classification: {
      category: 'information',
      confidence: 0.92,
      keywords: ['trading', 'strategy', 'analysis', 'recommendations'],
      reasoning: 'User is requesting trading strategy advice and market analysis'
    },
    processing: {
      result: 'Based on current market conditions, a balanced approach combining momentum and value strategies is recommended.',
      status: 'completed'
    },
    tradingInsights: {
      signals: [
        {
          type: 'bullish',
          description: 'Strong upward momentum with volume confirmation',
          confidence: 0.82
        },
        {
          type: 'neutral',
          description: 'RSI approaching overbought levels - caution advised',
          confidence: 0.75
        },
        {
          type: 'bullish',
          description: 'Institutional buying pressure continues',
          confidence: 0.88
        }
      ],
      timeframes: {
        short_term: 'Bullish bias, watch for pullbacks to $44k support',
        medium_term: 'Consolidation expected in $43k-$48k range',
        long_term: 'Structurally bullish with potential for new highs'
      }
    },
    riskAssessment: {
      overallRisk: 'medium',
      riskDescription: 'Current market shows moderate volatility with manageable risk levels',
      factors: [
        { name: 'Market Volatility', level: 'medium', description: 'Standard crypto market volatility' },
        { name: 'Liquidity Risk', level: 'low', description: 'Strong liquidity in major pairs' },
        { name: 'Sentiment Risk', level: 'low', description: 'Positive overall market sentiment' }
      ]
    },
    recommendations: [
      'Use 2-3% position sizing for active trades',
      'Set stop-losses at 8-10% below entry',
      'Take partial profits at resistance levels',
      'Maintain 70% cash position for opportunities',
      'Focus on high-volume, established assets'
    ]
  }
};

export function MockDataButtons({ onSelectMock }: { onSelectMock: (data: any) => void }) {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Try These Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => onSelectMock(mockInformationResponses.marketData)}
            className="h-auto p-4 flex flex-col items-start gap-2 border-blue-200 hover:bg-blue-50"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Market Analysis</span>
            </div>
            <p className="text-xs text-gray-600 text-left">
              Comprehensive Bitcoin market data with price analysis and trading recommendations
            </p>
          </Button>

          <Button
            variant="outline"
            onClick={() => onSelectMock(mockInformationResponses.defiExplanation)}
            className="h-auto p-4 flex flex-col items-start gap-2 border-green-200 hover:bg-green-50"
          >
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-green-600" />
              <span className="font-semibold">DeFi Guide</span>
            </div>
            <p className="text-xs text-gray-600 text-left">
              Educational content about DeFi protocols, risks, and best practices
            </p>
          </Button>

          <Button
            variant="outline"
            onClick={() => onSelectMock(mockInformationResponses.tradingStrategy)}
            className="h-auto p-4 flex flex-col items-start gap-2 border-purple-200 hover:bg-purple-50"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Trading Strategy</span>
            </div>
            <p className="text-xs text-gray-600 text-left">
              Professional trading insights with risk assessment and actionable recommendations
            </p>
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Demo Mode</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            These are sample responses to showcase the enhanced UI. Try sending real queries to see live data from the APIs!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MockDataButtons;