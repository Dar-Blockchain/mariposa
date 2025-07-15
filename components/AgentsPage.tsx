"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  Plus, 
  Search, 
  Calendar,
  Activity,
  Trash2,
  Settings,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  MoreVertical,
  Sparkles,
  Clock,
  Users,
  Filter,
  SortDesc,
  Grid3X3,
  List,
  Star,
  Cpu,
  Rocket,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Real agent interface based on API response
interface Agent {
  _id: string;
  name: string;
  description: string;
  userId: string;
  primaryStrategy: string;
  isActive: boolean;
  totalInteractions: number;
  totalBudgetManaged: number;
  lastInteraction: string;
  createdAt: string;
  updatedAt: string;
  configuration: {
    defaultBudget: number;
    frequency: string;
    riskTolerance: string;
    preferredTokens: string[];
    maxPositionSize?: number;
    stopLossPercentage?: number;
    takeProfitPercentage?: number;
    customPrompt?: string;
  };
  memoryStats: {
    totalInteractions: number;
    totalBudget: number;
    avgBudget: number;
    strategiesUsed: string[];
    pendingActions: number;
    executedActions: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    agents: Agent[];
    count: number;
    timestamp: string;
  };
}

// Utility function to format time ago
function getTimeAgo(date: string): string {
  const now = new Date();
  const agentDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - agentDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
  
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
}

// Strategy to icon mapping
const strategyIcons: { [key: string]: any } = {
  'DCA': TrendingUp,
  'SWING_TRADING': Bot,
  'SECURITY_MONITORING': Shield,
  'YIELD_FARMING': Zap,
  'ANALYTICS': Brain,
  'PORTFOLIO_REBALANCING': Target,
};

// Strategy to color mapping
const strategyColors: { [key: string]: string } = {
  'DCA': 'from-green-400 to-emerald-500',
  'SWING_TRADING': 'from-blue-400 to-indigo-500',
  'SECURITY_MONITORING': 'from-red-400 to-orange-500',
  'YIELD_FARMING': 'from-yellow-400 to-orange-500',
  'ANALYTICS': 'from-purple-400 to-pink-500',
  'PORTFOLIO_REBALANCING': 'from-indigo-400 to-purple-500',
};

import AgentCreationModal from './AgentCreationModal';

interface AgentsPageProps {
  className?: string;
}

export default function AgentsPage({ className }: AgentsPageProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'interactions' | 'budget'>('created');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agents/user/user123?active=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse = await response.json();
      
      if (apiResponse.success) {
        setAgents(apiResponse.data.agents);
      } else {
        throw new Error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError(error instanceof Error ? error.message : 'Failed to load agents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Refresh agents
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAgents();
  };

  // Filter and sort agents
  const filteredAndSortedAgents = agents
    .filter(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.primaryStrategy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'interactions':
          return b.totalInteractions - a.totalInteractions;
        case 'budget':
          return b.totalBudgetManaged - a.totalBudgetManaged;
        default:
          return 0;
      }
    });

  const totalBudget = agents.reduce((sum, agent) => sum + agent.totalBudgetManaged, 0);
  const totalInteractions = agents.reduce((sum, agent) => sum + agent.totalInteractions, 0);
  const activeAgents = agents.filter(agent => agent.isActive).length;

  const handleSelectAgent = (agentType: string, agentName: string) => {
    // Refresh agents list when a new agent is created
    fetchAgents();
  };

  const handleAgentClick = (agent: Agent) => {
    router.push(`/agent/${agent._id}`);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading your agents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-700">Failed to Load Agents</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Your AI Agents</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and monitor your crypto trading agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Agent</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Managed across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {agents.length > 0 ? Math.round(totalInteractions / agents.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg interactions/agent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-background"
          >
            <option value="created">Sort by Created</option>
            <option value="name">Sort by Name</option>
            <option value="interactions">Sort by Interactions</option>
            <option value="budget">Sort by Budget</option>
          </select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none border-l"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Agents Grid/List */}
      {filteredAndSortedAgents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'No agents found' : 'No agents yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first AI agent to get started'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredAndSortedAgents.map((agent) => {
            const StrategyIcon = strategyIcons[agent.primaryStrategy] || Bot;
            const strategyColor = strategyColors[agent.primaryStrategy] || 'from-gray-400 to-gray-500';

            return (
              <Card 
                key={agent._id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                onClick={() => handleAgentClick(agent)}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${strategyColor} flex items-center justify-center`}>
                      <StrategyIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.isActive && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Active
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Strategy Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {agent.primaryStrategy.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Budget Managed</div>
                      <div className="font-semibold">${agent.totalBudgetManaged.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Interactions</div>
                      <div className="font-semibold">{agent.totalInteractions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Frequency</div>
                      <div className="font-semibold capitalize">{agent.configuration.frequency}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Risk Level</div>
                      <div className="font-semibold capitalize">{agent.configuration.riskTolerance}</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Created {getTimeAgo(agent.createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last: {getTimeAgo(agent.lastInteraction)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Agent Modal */}
      <AgentCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSelectAgent={handleSelectAgent}
      />
    </div>
  );
}