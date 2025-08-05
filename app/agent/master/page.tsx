'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterAgentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default master agent with a fixed ID
    // This ensures every user gets the same default agent experience
    router.replace('/agent/default');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Master Agent...</p>
      </div>
    </div>
  );
} 