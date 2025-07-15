"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import WalletDashboard from '@/components/WalletDashboard';
import WalletPage from '@/components/WalletPage';
import AgentsPage from '@/components/AgentsPage';
import AgentCreationModal from '@/components/AgentCreationModal';

interface Agent {
  id: string;
  type: string;
  name: string;
  createdAt: Date;
  lastActive: Date;
  description?: string;
  primaryStrategy?: string;
  configuration?: any;
}

interface BackendAgent {
  id: string;
  name: string;
  description: string;
  userId: string;
  primaryStrategy: string;
  configuration: any;
  createdAt: string;
  updatedAt?: string;
}

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Function to convert backend agent to frontend agent format
  const convertBackendAgent = (backendAgent: BackendAgent): Agent => {
    // Map strategy to type for display purposes
    const strategyToTypeMap: { [key: string]: string } = {
      'DCA': 'goal',
      'SWING_TRADING': 'trading',
      'SECURITY_MONITORING': 'security',
      'YIELD_FARMING': 'defi',
      'ANALYTICS': 'analytics',
      'PORTFOLIO_REBALANCING': 'portfolio'
    };

    return {
      id: backendAgent.id,
      type: strategyToTypeMap[backendAgent.primaryStrategy] || 'goal',
      name: backendAgent.name,
      description: backendAgent.description,
      primaryStrategy: backendAgent.primaryStrategy,
      configuration: backendAgent.configuration,
      createdAt: new Date(backendAgent.createdAt),
      lastActive: new Date(backendAgent.updatedAt || backendAgent.createdAt)
    };
  };

  // Function to fetch agents from backend
  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/agents?userId=user123`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const convertedAgents = data.data.map(convertBackendAgent);
          setAgents(convertedAgents);
        }
      } else {
        console.error('Failed to fetch agents:', response.status);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      // If API fails, keep existing agents or use empty array
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Load agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = () => {
    setShowAgentModal(true);
  };

  const handleSelectAgent = (agentType: string, agentName: string) => {
    // This callback is called when an agent is successfully created
    // The modal will handle the API call and navigation
    // Refresh the agents list to show the new agent
    fetchAgents();
    setShowAgentModal(false);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'wallet':
        return <WalletPage />;
      case 'agents':
        return <AgentsPage />;
      default:
        return <WalletDashboard onCreateAgent={handleCreateAgent} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          agentCount={agents.length}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      {/* Agent Creation Modal */}
      <AgentCreationModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onSelectAgent={handleSelectAgent}
      />
    </div>
  );
}