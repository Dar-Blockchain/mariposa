'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, ArrowRight, Eye, Settings } from 'lucide-react';
import MasterAgentChat from './MasterAgentChat';
import EnhancedMasterAgentChat from './EnhancedMasterAgentChat';

export default function ChatToggle() {
  const [useEnhanced, setUseEnhanced] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      {/* Toggle Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Master Agent Chat</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={!useEnhanced ? "default" : "outline"}
                size="sm"
                onClick={() => setUseEnhanced(false)}
                className="flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Classic
              </Button>
              <Button
                variant={useEnhanced ? "default" : "outline"}
                size="sm"
                onClick={() => setUseEnhanced(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
              >
                <Sparkles className="w-4 h-4" />
                Enhanced
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 ml-1">
                  New
                </Badge>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {useEnhanced ? (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Beautiful visualizations for information responses</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Classic chat interface</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {useEnhanced && (
          <div className="max-w-4xl mx-auto mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Enhanced Mode Features:</p>
                <p className="text-xs text-blue-600 mt-1">
                  ✨ Beautiful information visualizations • 📊 Rich market data cards • 🎯 Processing pipeline display • 🔍 Enhanced API integration
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Component */}
      <div className="flex-1">
        {useEnhanced ? <EnhancedMasterAgentChat /> : <MasterAgentChat />}
      </div>
    </div>
  );
}