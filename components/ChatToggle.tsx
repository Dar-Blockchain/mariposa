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
    <div className="h-screen flex flex-col bg-white">
      {/* Minimalist Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/mariposa-logo.png" 
              alt="Mariposa" 
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent">Mariposa</h1>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                AI Assistant
              </div>
            </div>
          </div>
          
          {/* Clean Toggle */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseEnhanced(false)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                !useEnhanced ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bot className="w-3 h-3 mr-1.5" />
              Classic
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseEnhanced(true)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                useEnhanced ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-sm text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Enhanced
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Component */}
      <div className="flex-1">
        {useEnhanced ? <EnhancedMasterAgentChat /> : <MasterAgentChat />}
      </div>
    </div>
  );
}