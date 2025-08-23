'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Clock,
  Database,
  Zap,
  Star,
  Shield,
  Activity,
  Eye,
  ExternalLink,
  Copy,
  DollarSign,
  PieChart,
  Coins,
  Percent,
  Globe,
  ArrowUpDown
} from 'lucide-react';

interface EnhancedIntentVisualizationProps {
  data: any;
}

export function IntentClassificationCard({ intentData }: { intentData: any }) {
  if (!intentData?.classification) return null;

  const classification = intentData.classification;
  const confidence = classification.confidence;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'information': return <Info className="w-5 h-5 text-blue-600" />;
      case 'action': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'strategy': return <Target className="w-5 h-5 text-green-600" />;
      default: return <Brain className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(classification.type)}
            <div>
              <CardTitle className="text-lg text-blue-800">
                Intent Classification
              </CardTitle>
              <p className="text-sm text-blue-600 mt-1">
                {classification.reasoning}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={`${getConfidenceColor(confidence)} border`}>
              {Math.round(confidence * 100)}% Confident
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {classification.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export function AIAnalysisCard({ analysisData }: { analysisData: any }) {
  if (!analysisData) return null;

  const copyAnalysis = () => {
    const text = typeof analysisData === 'string' ? analysisData : JSON.stringify(analysisData, null, 2);
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Market Analysis
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={copyAnalysis}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {typeof analysisData === 'string' ? (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysisData}</p>
            </div>
          ) : (
            <>
              {/* Market Overview */}
              {analysisData.marketOverview && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Market Overview
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">{analysisData.marketOverview.summary}</p>
                  
                  {/* Market Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {analysisData.marketOverview.totalMarketCap !== undefined && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">Market Cap</span>
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          ${analysisData.marketOverview.totalMarketCap?.toLocaleString() || '0'}
                        </div>
                      </div>
                    )}
                    
                    {analysisData.marketOverview.volume24h !== undefined && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-purple-700 font-medium">24h Volume</span>
                        </div>
                        <div className="text-lg font-bold text-purple-900">
                          ${analysisData.marketOverview.volume24h?.toLocaleString() || '0'}
                        </div>
                      </div>
                    )}
                    
                    {analysisData.marketOverview.activeTokens !== undefined && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-700 font-medium">Active Tokens</span>
                        </div>
                        <div className="text-lg font-bold text-orange-900">
                          {analysisData.marketOverview.activeTokens || 0}
                        </div>
                      </div>
                    )}
                    
                    {analysisData.marketOverview.marketChange24h !== undefined && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          {analysisData.marketOverview.marketChange24h >= 0 ? 
                            <TrendingUp className="w-4 h-4 text-green-600" /> : 
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          }
                          <span className="text-xs text-green-700 font-medium">24h Change</span>
                        </div>
                        <div className={`text-lg font-bold ${analysisData.marketOverview.marketChange24h >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {analysisData.marketOverview.marketChange24h >= 0 ? '+' : ''}{analysisData.marketOverview.marketChange24h?.toFixed(2) || 0}%
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Market Sentiment */}
                  {analysisData.marketOverview.sentiment && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-600">Market Sentiment:</span>
                      <Badge variant="outline" className={`
                        ${analysisData.marketOverview.sentiment === 'bullish' ? 'bg-green-100 text-green-800' : ''}
                        ${analysisData.marketOverview.sentiment === 'bearish' ? 'bg-red-100 text-red-800' : ''}
                        ${analysisData.marketOverview.sentiment === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
                        ${analysisData.marketOverview.sentiment === 'mixed' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {analysisData.marketOverview.sentiment.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Risk Distribution */}
              {analysisData.riskDistribution && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Risk Distribution Analysis
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-900">{analysisData.riskDistribution.lowRisk || 0}</div>
                      <div className="text-xs text-green-700">Low Risk</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-lg font-bold text-yellow-900">{analysisData.riskDistribution.mediumRisk || 0}</div>
                      <div className="text-xs text-yellow-700">Medium Risk</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-lg font-bold text-red-900">{analysisData.riskDistribution.highRisk || 0}</div>
                      <div className="text-xs text-red-700">High Risk</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-blue-900">{analysisData.riskDistribution.totalAnalyzed || 0}</div>
                      <div className="text-xs text-blue-700">Total Analyzed</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profit Opportunities */}
              {analysisData.profitOpportunities && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Profit Opportunities
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-lg font-bold text-emerald-900">{analysisData.profitOpportunities.highScore || 0}</div>
                      <div className="text-xs text-emerald-700">High Score</div>
                    </div>
                    <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="text-lg font-bold text-teal-900">{analysisData.profitOpportunities.mediumScore || 0}</div>
                      <div className="text-xs text-teal-700">Medium Score</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <div className="text-lg font-bold text-cyan-900">{analysisData.profitOpportunities.emergingOpportunities || 0}</div>
                      <div className="text-xs text-cyan-700">Emerging</div>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="text-lg font-bold text-indigo-900">{analysisData.profitOpportunities.establishedTokens || 0}</div>
                      <div className="text-xs text-indigo-700">Established</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Legacy Key Metrics Support */}
              {analysisData.keyMetrics && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(analysisData.keyMetrics).map(([key, value]) => (
                      <div key={key} className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-xs text-green-700 font-medium capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="text-lg font-bold text-green-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TokenRecommendationsCard({ recommendations }: { recommendations: any[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  // Check if these are detailed token recommendations or simple text recommendations
  const hasDetailedTokenData = recommendations.length > 0 && recommendations[0].token && recommendations[0].currentPrice !== undefined;

  if (!hasDetailedTokenData) {
    // Fallback to simple recommendations display
    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const recommendation = typeof rec === 'string' ? rec : rec.recommendation || rec.text;
              const priority = typeof rec === 'object' ? rec.priority : null;
              
              return (
                <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-orange-200">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{recommendation}</p>
                    {priority && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Priority: {priority}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enhanced token recommendations display
  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Token Recommendations ({recommendations.length})
          </CardTitle>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            AI-Powered Analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((rec, index) => {
            const getRiskColor = (riskScore: number) => {
              if (riskScore <= 30) return 'bg-green-100 text-green-800 border-green-300';
              if (riskScore <= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
              return 'bg-red-100 text-red-800 border-red-300';
            };

            const getActionColor = (action: string) => {
              switch (action?.toUpperCase()) {
                case 'BUY': return 'bg-green-500 text-white';
                case 'SELL': return 'bg-red-500 text-white';
                case 'HOLD': return 'bg-blue-500 text-white';
                case 'WATCH': return 'bg-gray-500 text-white';
                default: return 'bg-orange-500 text-white';
              }
            };

            const formatPrice = (price: number) => {
              if (price < 0.01) return `$${price.toFixed(8)}`;
              if (price < 1) return `$${price.toFixed(6)}`;
              return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };

            const formatLargeNumber = (num: number) => {
              if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
              return `$${num.toFixed(0)}`;
            };

            return (
              <div key={index} className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{rec.token}</h4>
                      <p className="text-sm text-gray-600">{rec.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(rec.action)}>
                      {rec.action}
                    </Badge>
                    <Badge variant="outline" className={getRiskColor(rec.riskScore || 0)}>
                      Risk: {rec.riskScore || 0}/100
                    </Badge>
                  </div>
                </div>

                {/* Price and Performance Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">Current Price</div>
                    <div className="text-lg font-bold text-blue-900">{formatPrice(rec.currentPrice || 0)}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs text-green-700 font-medium mb-1">Target Price</div>
                    <div className="text-lg font-bold text-green-900">{formatPrice(rec.targetPrice || 0)}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-xs text-purple-700 font-medium mb-1">Upside Potential</div>
                    <div className="text-lg font-bold text-purple-900">+{rec.upside?.toFixed(1) || 0}%</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="text-xs text-amber-700 font-medium mb-1">Confidence</div>
                    <div className="text-lg font-bold text-amber-900">{rec.confidence || 0}%</div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Liquidity</div>
                    <div className="text-sm font-semibold text-gray-900">{formatLargeNumber(rec.liquidity || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">24h Volume</div>
                    <div className="text-sm font-semibold text-gray-900">{formatLargeNumber(rec.volume24h || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Market Cap</div>
                    <div className="text-sm font-semibold text-gray-900">{formatLargeNumber(rec.marketCap || 0)}</div>
                  </div>
                </div>

                {/* Scoring Row */}
                {(rec.riskScore !== undefined || rec.profitScore !== undefined || rec.overallScore !== undefined) && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                      <div className="text-xs text-red-700 font-medium mb-1">Risk Score</div>
                      <div className="text-lg font-bold text-red-900">{rec.riskScore || 0}/100</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <div className="text-xs text-green-700 font-medium mb-1">Profit Score</div>
                      <div className="text-lg font-bold text-green-900">{rec.profitScore || 0}/100</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                      <div className="text-xs text-indigo-700 font-medium mb-1">Overall Score</div>
                      <div className="text-lg font-bold text-indigo-900">{rec.overallScore?.toFixed(1) || 0}/100</div>
                    </div>
                  </div>
                )}

                {/* Category and Timeframe */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {rec.category?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {rec.timeframe?.replace('-', ' ').toUpperCase() || 'MEDIUM-TERM'}
                  </Badge>
                </div>

                {/* Reasoning */}
                {rec.reasoning && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-700 font-medium mb-1">AI Analysis</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{rec.reasoning}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionableInsightsCard({ insights }: { insights: string[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Actionable Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-purple-200">
              <ArrowRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskWarningsCard({ warnings }: { warnings: string[] }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Warnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{warning}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function NextStepsCard({ steps }: { steps: string[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-teal-200">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-teal-600">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketContextCard({ context }: { context: any }) {
  if (!context) return null;

  const getDataSourceBadge = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'mcp_client':
      case 'mcp_general':
        return <Badge className="bg-green-100 text-green-800">Real-time MCP Data</Badge>;
      case 'sei_pipeline':
        return <Badge className="bg-blue-100 text-blue-800">SEI Network Pipeline</Badge>;
      case 'fallback_api':
        return <Badge className="bg-yellow-100 text-yellow-800">Fallback API</Badge>;
      case 'static_fallback':
        return <Badge className="bg-gray-100 text-gray-800">Static Data</Badge>;
      default:
        return <Badge variant="outline">Unknown Source</Badge>;
    }
  };

  return (
    <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Market Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Data Source</span>
            </div>
            {getDataSourceBadge(context.dataSource)}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Last Updated</span>
            </div>
            <p className="text-sm text-gray-600">
              {new Date(context.lastUpdated).toLocaleString()}
            </p>
          </div>
          
          {context.tokensAnalyzed && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Analysis Scope</span>
              </div>
              <p className="text-sm text-gray-600">{context.tokensAnalyzed}</p>
            </div>
          )}
          
          {context.aiModel && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">AI Model</span>
              </div>
              <p className="text-sm text-gray-600 font-mono">{context.aiModel}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnhancedIntentVisualization({ data }: EnhancedIntentVisualizationProps) {
  if (!data) return null;

  const informationData = data.information || data;
  const intentData = data.intent;
  const result = informationData.result;

  return (
    <div className="space-y-4">
      {/* Intent Classification */}
      {intentData && <IntentClassificationCard intentData={intentData} />}
      
      {/* AI Analysis */}
      {result?.analysis && <AIAnalysisCard analysisData={result.analysis} />}
      
      {/* Token Recommendations */}
      {result?.recommendations && <TokenRecommendationsCard recommendations={result.recommendations} />}
      
      {/* Actionable Insights */}
      {result?.actionableInsights && <ActionableInsightsCard insights={result.actionableInsights} />}
      
      {/* Risk Warnings */}
      {result?.riskWarnings && <RiskWarningsCard warnings={result.riskWarnings} />}
      
      {/* Next Steps */}
      {result?.nextSteps && <NextStepsCard steps={result.nextSteps} />}
      
      {/* Market Context */}
      {result?.marketContext && <MarketContextCard context={result.marketContext} />}
    </div>
  );
}