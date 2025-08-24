'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthWrapper';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wallet, 
  TrendingUp, 
  Bot, 
  Settings, 
  Mail,
  Zap,
  CheckCircle,
  Circle,
  Coins,
  Shield,
  Target,
  Edit,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Copy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GitMerge,
  GitBranch,
  Activity,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  DollarSign,
  BarChart3,
  Filter,
  Eye,
  Maximize,
  CreditCard,
  Lock
} from 'lucide-react';

interface PipelineStep {
  id: string;
  type: 'event' | 'action';
  category: string;
  name: string;
  icon: any;
  description: string;
  config?: any;
  position: { x: number; y: number };
}

interface ActionType {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  configFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    label: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
}

const EVENTS: ActionType[] = [
  {
    id: 'price_change',
    name: 'Price Change',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Trigger when token price changes by specified amount',
    configFields: [
      { name: 'token', type: 'select', label: 'Token', options: ['SEI', 'USDC', 'WSEI'], required: true },
      { name: 'change_type', type: 'select', label: 'Change Type', options: ['Increase', 'Decrease', 'Any'], required: true },
      { name: 'percentage', type: 'number', label: 'Percentage (%)', placeholder: '5', required: true }
    ]
  },
  {
    id: 'wallet_balance',
    name: 'Balance Threshold',
    icon: Wallet,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Trigger when wallet balance reaches threshold',
    configFields: [
      { name: 'token', type: 'select', label: 'Token', options: ['SEI', 'USDC', 'WSEI'], required: true },
      { name: 'threshold_type', type: 'select', label: 'Condition', options: ['Above', 'Below'], required: true },
      { name: 'amount', type: 'number', label: 'Amount', placeholder: '100', required: true }
    ]
  },
  {
    id: 'time_schedule',
    name: 'Time Schedule',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Trigger at scheduled time intervals',
    configFields: [
      { name: 'frequency', type: 'select', label: 'Frequency', options: ['Daily', 'Weekly', 'Monthly'], required: true },
      { name: 'time', type: 'text', label: 'Time (HH:MM)', placeholder: '09:00', required: true }
    ]
  },
  {
    id: 'market_condition',
    name: 'Market Condition',
    icon: BarChart3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Trigger based on market conditions',
    configFields: [
      { name: 'condition', type: 'select', label: 'Condition', options: ['Bull Market', 'Bear Market', 'High Volatility'], required: true },
      { name: 'duration', type: 'select', label: 'Duration', options: ['1 hour', '6 hours', '24 hours'], required: true }
    ]
  }
];

const ACTIONS: ActionType[] = [
  {
    id: 'transfer',
    name: 'Transfer Tokens',
    icon: ArrowUpRight,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Send tokens to another address',
    configFields: [
      { name: 'token', type: 'select', label: 'Token', options: ['SEI', 'USDC', 'WSEI'], required: true },
      { name: 'amount', type: 'number', label: 'Amount', placeholder: '100', required: true },
      { name: 'recipient', type: 'text', label: 'Recipient Address', placeholder: '0x...', required: true }
    ]
  },
  {
    id: 'swap',
    name: 'Swap Tokens',
    icon: ArrowRight,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Exchange one token for another',
    configFields: [
      { name: 'from_token', type: 'select', label: 'From Token', options: ['SEI', 'USDC', 'WSEI'], required: true },
      { name: 'to_token', type: 'select', label: 'To Token', options: ['SEI', 'USDC', 'WSEI'], required: true },
      { name: 'amount', type: 'number', label: 'Amount', placeholder: '100', required: true }
    ]
  },
  {
    id: 'stake',
    name: 'Stake Tokens',
    icon: Coins,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Stake tokens for rewards',
    configFields: [
      { name: 'token', type: 'select', label: 'Token', options: ['SEI'], required: true },
      { name: 'amount', type: 'number', label: 'Amount', placeholder: '1000', required: true },
      { name: 'validator', type: 'text', label: 'Validator (optional)', placeholder: 'Auto-select best validator' }
    ]
  },
  {
    id: 'notification',
    name: 'Send Notification',
    icon: MessageSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Send email or push notification',
    configFields: [
      { name: 'type', type: 'select', label: 'Type', options: ['Email', 'Push', 'Both'], required: true },
      { name: 'message', type: 'textarea', label: 'Message', placeholder: 'Your custom message...', required: true }
    ]
  },
  {
    id: 'strategy',
    name: 'Trading Strategy',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Execute complex trading strategy',
    configFields: [
      { name: 'strategy_type', type: 'select', label: 'Strategy', options: ['DCA', 'Grid Trading', 'Momentum'], required: true },
      { name: 'budget', type: 'number', label: 'Budget (SEI)', placeholder: '1000', required: true },
      { name: 'duration', type: 'select', label: 'Duration', options: ['1 week', '1 month', '3 months'], required: true }
    ]
  }
];

// Custom Node Component with enhanced styling
const PipelineNode = ({ data }: { data: any }) => {
  const isEvent = data.category === 'event';
  const getNodeColor = () => {
    if (isEvent) {
      return 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50';
    }
    return 'border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50';
  };

  return (
    <div className={`w-64 p-4 rounded-xl border-2 ${getNodeColor()} shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 relative`}>
      {!isEvent && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#f97316', width: '16px', height: '16px', border: '2px solid white' }}
        />
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isEvent ? 'bg-orange-100' : 'bg-blue-100'}`}>
          <data.icon className={`w-5 h-5 ${isEvent ? 'text-orange-600' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{data.name}</h3>
          <p className="text-xs text-gray-600 mt-1">{data.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete && data.onDelete();
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <Badge 
        variant="secondary" 
        className={`text-xs ${data.configured ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
      >
        {data.configured ? '✓ Configured' : '⚠ Needs Config'}
      </Badge>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#f97316', width: '16px', height: '16px', border: '2px solid white' }}
      />
    </div>
  );
};

const nodeTypes = {
  pipelineNode: PipelineNode,
};

export default function WalletPipelinePage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEvents, setSelectedEvents] = useState<PipelineStep[]>([]);
  const [selectedActions, setSelectedActions] = useState<PipelineStep[]>([]);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActionType | null>(null);
  const [itemConfig, setItemConfig] = useState<any>({});
  const [editingStep, setEditingStep] = useState<PipelineStep | null>(null);
  const [pipelineName, setPipelineName] = useState('');

  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  const addEvent = (item: ActionType) => {
    // Open configuration dialog for the event
    setSelectedItem(item);
    setEditingStep({
      id: `${item.id}_${Date.now()}`,
      type: 'event',
      category: 'event',
      name: item.name,
      icon: item.icon,
      description: item.description,
      position: { x: Math.random() * 500, y: Math.random() * 300 }
    });
    setItemConfig({});
    setConfigDialogOpen(true);
  };

  const addActionToFlow = (item: ActionType) => {
    // Open configuration dialog for the action
    setSelectedItem(item);
    setEditingStep({
      id: `${item.id}_${Date.now()}`,
      type: 'action',
      category: 'action',
      name: item.name,
      icon: item.icon,
      description: item.description,
      position: { x: Math.random() * 600, y: Math.random() * 400 }
    });
    setItemConfig({});
    setConfigDialogOpen(true);
  };

  const deleteEvent = (id: string) => {
    setSelectedEvents(selectedEvents.filter(item => item.id !== id));
  };

  const deleteAction = (id: string) => {
    setSelectedActions(selectedActions.filter(item => item.id !== id));
    setNodes(nodes.filter(node => node.id !== id));
  };

  const openConfigDialog = (step: PipelineStep) => {
    const itemType = step.type === 'event' ? 
      EVENTS.find(e => e.name === step.name) :
      ACTIONS.find(a => a.name === step.name);
    
    setSelectedItem(itemType || null);
    setEditingStep(step);
    setItemConfig(step.config || {});
    setConfigDialogOpen(true);
  };

  const saveConfig = () => {
    if (!editingStep) return;
    
    if (editingStep.type === 'event') {
      const configuredEvent = { ...editingStep, config: itemConfig };
      // Check if editing existing or adding new
      const existingIndex = selectedEvents.findIndex(item => item.id === editingStep.id);
      if (existingIndex >= 0) {
        // Update existing event
        const updatedEvents = [...selectedEvents];
        updatedEvents[existingIndex] = configuredEvent;
        setSelectedEvents(updatedEvents);
      } else {
        // Add new event
        setSelectedEvents([...selectedEvents, configuredEvent]);
      }
    } else {
      const configuredAction = { ...editingStep, config: itemConfig };
      const existingIndex = selectedActions.findIndex(item => item.id === editingStep.id);
      
      if (existingIndex >= 0) {
        // Update existing action
        const updatedActions = [...selectedActions];
        updatedActions[existingIndex] = configuredAction;
        setSelectedActions(updatedActions);
        
        // Update node in React Flow
        const updatedNodes = nodes.map(node => 
          node.id === editingStep.id ? { 
            ...node, 
            data: { ...node.data, configured: true, config: itemConfig } 
          } : node
        );
        setNodes(updatedNodes);
      } else {
        // Add new action
        setSelectedActions([...selectedActions, configuredAction]);
        
        // Add to React Flow nodes
        const newNode = {
          id: configuredAction.id,
          type: 'pipelineNode',
          position: configuredAction.position,
          data: {
            ...configuredAction,
            configured: true,
            onDelete: () => deleteAction(configuredAction.id),
            onClick: () => openConfigDialog(configuredAction)
          }
        };
        setNodes([...nodes, newNode]);
      }
    }
    
    setConfigDialogOpen(false);
    setEditingStep(null);
    setItemConfig({});
  };

  const goToNextStep = () => {
    setCurrentStep(2);
  };

  const confirmPipeline = async () => {
    const pipeline = {
      id: Date.now(),
      name: pipelineName || 'Untitled Pipeline',
      created: new Date().toISOString(),
      userId: user?.id,
      status: 'active',
      events: selectedEvents.map(item => ({
        id: item.id,
        name: item.name,
        type: item.name.toLowerCase().replace(' ', '_'),
        description: item.description,
        config: item.config || {}
      })),
      actions: selectedActions.map(item => ({
        id: item.id,
        name: item.name,
        type: item.name.toLowerCase().replace(' ', '_'),
        description: item.description,
        config: item.config || {},
        position: item.position
      })),
      connections: edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        type: edge.type || 'default'
      }))
    };
    
    try {
      // For testing: authentication is bypassed
      console.log('Creating pipeline (auth bypassed for testing)');

      // Save pipeline to database
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No auth headers for testing
        },
        body: JSON.stringify(pipeline),
      });

      if (response.ok) {
        const result = await response.json();
        const savedPipeline = result.data;
        console.log('Pipeline saved successfully:', savedPipeline);
        
        // Create agenda job for pipeline execution
        await fetch('/api/pipelines/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // No auth headers for testing
          },
          body: JSON.stringify({
            pipelineId: savedPipeline._id,
            pipeline: savedPipeline
          }),
        });

        alert('Pipeline confirmed and scheduled successfully!');
        
        // Reset form
        setSelectedEvents([]);
        setSelectedActions([]);
        setNodes([]);
        setEdges([]);
        setPipelineName('');
        setCurrentStep(1);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save pipeline');
      }
    } catch (error:any) {
      console.error('Error saving pipeline:', error);
      alert(`Error saving pipeline: ${error.message}`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Events</h2>
              <p className="text-gray-600">Select triggers that will start your pipeline</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {EVENTS.map((event) => (
                <Card 
                  key={event.id} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${event.bgColor} border-2`}
                  onClick={() => addEvent(event)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white">
                        <event.icon className={`w-5 h-5 ${event.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <CardDescription className="text-sm">{event.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {selectedEvents.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Selected Events ({selectedEvents.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEvents.map((item) => (
                    <Card key={item.id} className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${item.config ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {item.config ? '✓ Configured' : '⚠ Needs Config'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => deleteEvent(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {item.config && (
                          <div className="text-xs text-gray-600 mt-2">
                            {Object.entries(item.config).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfigDialog(item)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            {item.config ? 'Edit Config' : 'Configure'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Pipeline</h2>
              <p className="text-gray-600">Drag actions from the menu and connect your workflow</p>
            </div>

            <div className="mb-4">
              <Label htmlFor="pipeline-name" className="text-sm font-medium">Pipeline Name</Label>
              <Input
                id="pipeline-name"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="Enter pipeline name..."
                className="mt-1 max-w-md"
              />
            </div>
            
            <div className="grid grid-cols-5 gap-6">
              {/* React Flow - Takes 4/5 of the width */}
              <div className="col-span-4">
                <div className="h-[700px] border-2 border-gray-200 rounded-xl bg-gray-50 shadow-inner">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="rounded-xl"
                  >
                    <Background variant={BackgroundVariant.Dots} />
                    <Controls />
                    <MiniMap />
                  </ReactFlow>
                </div>
              </div>

              {/* Actions Menu - Takes 1/5 of the width */}
              <div className="col-span-1">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-800">Selected Events</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedEvents.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200 text-xs">
                          <item.icon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="flex-1 font-medium truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">Add Actions</h3>
                    <div className="space-y-2">
                      {ACTIONS.map((action) => (
                        <Card 
                          key={action.id} 
                          className={`cursor-pointer hover:shadow-md transition-all duration-200 ${action.bgColor} border-2 p-3`}
                          onClick={() => addActionToFlow(action)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-white">
                              <action.icon className={`w-4 h-4 ${action.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{action.name}</div>
                              <div className="text-xs text-gray-600 truncate">{action.description}</div>
                            </div>
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {selectedActions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Pipeline Actions</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {selectedActions.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                            <item.icon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span className="flex-1 font-medium truncate">{item.name}</span>
                            <Badge className={`text-xs px-1 ${item.config ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {item.config ? '✓' : '!'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => deleteAction(item.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedEvents.length > 0 && selectedActions.length > 0) && (
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={confirmPipeline}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Pipeline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Click nodes to configure them, drag from handles to connect actions</p>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-orange-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/mariposa-logo.png" 
                alt="Mariposa" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Pipeline Builder
                </h1>
                <p className="text-gray-600">Create automated crypto workflows</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-8">
          {[
            { step: 1, title: 'Events', icon: Zap },
            { step: 2, title: 'Actions & Flow', icon: Settings }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                currentStep >= item.step 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.title}</span>
              </div>
              {index < 1 && (
                <ChevronRight className={`mx-2 w-4 h-4 ${
                  currentStep > item.step ? 'text-orange-500' : 'text-gray-400'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50 shadow-xl">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          )}
          
          {currentStep < 2 && (
            <Button 
              onClick={goToNextStep}
              className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              disabled={selectedEvents.length === 0}
            >
              Build Pipeline
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.icon && <selectedItem.icon className="w-5 h-5 text-orange-600" />}
              Configure {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedItem?.configFields?.map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={itemConfig[field.name] || ''}
                    onValueChange={(value) => setItemConfig({...itemConfig, [field.name]: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={itemConfig[field.name] || ''}
                    onChange={(e) => setItemConfig({...itemConfig, [field.name]: e.target.value})}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={itemConfig[field.name] || ''}
                    onChange={(e) => setItemConfig({...itemConfig, [field.name]: e.target.value})}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveConfig}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}