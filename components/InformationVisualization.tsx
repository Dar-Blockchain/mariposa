'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  Globe,
  Star,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Shield,
  Coins,
  ArrowUpDown,
  Percent
} from 'lucide-react';

interface InformationVisualizationProps {
  data: any;
  category: string;
  confidence?: number;
}

export function MarketDataCard({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Market Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, value]) => {
            const isPrice = key.toLowerCase().includes('price') || key.toLowerCase().includes('usd');
            const isChange = key.toLowerCase().includes('change') || key.toLowerCase().includes('24h');
            const isVolume = key.toLowerCase().includes('volume');
            
            return (
              <div key={key} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  {isPrice && <DollarSign className="w-4 h-4 text-green-600" />}
                  {isChange && <TrendingUp className="w-4 h-4 text-orange-600" />}
                  {isVolume && <Activity className="w-4 h-4 text-purple-600" />}
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                  </span>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatValue(value, key)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function TokenAnalysisCard({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Token Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.summary && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Summary</h4>
              <p className="text-sm text-gray-700">{data.summary}</p>
            </div>
          )}
          
          {data.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(data.metrics).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs font-medium text-green-700 capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-lg font-bold text-green-900">
                    {formatValue(value, key)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TradingInsightsCard({ data }: { data: any }) {
  if (!data) return null;

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Trading Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.signals && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.signals.map((signal: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    {signal.type === 'bullish' && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {signal.type === 'bearish' && <TrendingDown className="w-4 h-4 text-red-600" />}
                    {signal.type === 'neutral' && <ArrowUpDown className="w-4 h-4 text-gray-600" />}
                    <Badge variant={signal.type === 'bullish' ? 'default' : signal.type === 'bearish' ? 'destructive' : 'secondary'}>
                      {signal.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{signal.description}</p>
                  {signal.confidence && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Confidence: {Math.round(signal.confidence * 100)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${signal.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecommendationsCard({ recommendations }: { recommendations: string[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-orange-200">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-600">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-700 flex-1">{rec}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskAssessmentCard({ data }: { data: any }) {
  if (!data) return null;

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-red-800 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.overallRisk && (
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                {getRiskIcon(data.overallRisk)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.overallRisk)}`}>
                  {data.overallRisk} Risk
                </span>
              </div>
              {data.riskDescription && (
                <p className="text-sm text-gray-700">{data.riskDescription}</p>
              )}
            </div>
          )}

          {data.factors && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.factors.map((factor: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    {getRiskIcon(factor.level)}
                    <span className="text-sm font-medium text-gray-800">{factor.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getRiskColor(factor.level)}`}>
                    {factor.level}
                  </span>
                  {factor.description && (
                    <p className="text-xs text-gray-600 mt-2">{factor.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProcessingTimelineCard({ steps }: { steps: any[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Processing Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'processing' ? 'bg-blue-500' :
                step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 capitalize">
                    {step.step.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                  </span>
                  {step.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: any, key: string): string {
  if (value === null || value === undefined) return 'N/A';
  
  const keyLower = key.toLowerCase();
  
  // Format as currency
  if (keyLower.includes('price') || keyLower.includes('usd') || keyLower.includes('value')) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: num < 1 ? 6 : 2,
        maximumFractionDigits: num < 1 ? 6 : 2
      }).format(num);
    }
  }
  
  // Format as percentage
  if (keyLower.includes('change') || keyLower.includes('percent')) {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
    }
  }
  
  // Format large numbers
  if (typeof value === 'number' && value > 1000000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  }
  
  // Default string conversion
  return String(value);
}

export default function InformationVisualization({ data, category, confidence }: InformationVisualizationProps) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Market Data */}
      {data.marketData && <MarketDataCard data={data.marketData} />}
      
      {/* Token Analysis */}
      {data.tokenAnalysis && <TokenAnalysisCard data={data.tokenAnalysis} />}
      
      {/* Trading Insights */}
      {data.tradingInsights && <TradingInsightsCard data={data.tradingInsights} />}
      
      {/* Recommendations */}
      {data.recommendations && <RecommendationsCard recommendations={data.recommendations} />}
      
      {/* Risk Assessment */}
      {data.riskAssessment && <RiskAssessmentCard data={data.riskAssessment} />}
      
      {/* Processing Timeline */}
      {data.processingSteps && <ProcessingTimelineCard steps={data.processingSteps} />}
    </div>
  );
}