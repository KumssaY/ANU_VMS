//src/app/bans/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BanTable from '@/components/BanTable';
import Link from 'next/link';
import { getVisitorBanHistory } from '@/app/actions/visitor';

// Function to get all bans or visitor bans
async function fetchBans(visitorId?: string) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api';
    
    if (visitorId) {
      const result = await getVisitorBanHistory(visitorId);
      return {
        success: result.success,
        bans: result.banHistory || [],
        error: result.error
      };
    } else {
      const response = await fetch(`${API_BASE_URL}/visitors/bans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return { success: true, bans: data.bans || [] };
    }
  } catch (error) {
    console.error('Error fetching bans:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      bans: [] 
    };
  }
}

export default function BansPage() {
  const [bans, setBans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const visitorId = searchParams.get('visitorId');

  useEffect(() => {
    async function loadBanData() {
      setIsLoading(true);
      try {
        const result = await fetchBans(visitorId || undefined);
        if (result.success) {
          setBans(result.bans);
        } else {
          setError(result.error || 'Failed to load bans');
        }
      } catch (error: any) {
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadBanData();
  }, [visitorId]);

  const title = visitorId 
    ? 'Visitor Ban History' 
    : 'All Bans';

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <Link 
            href="/identify" 
            className="bg-[#f0b100] text-black font-bold px-4 py-2 rounded-md hover:bg-[#e0a000] transition-colors"
          >
            Back to Identify
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-[#222] p-8 rounded-lg shadow-md border border-gray-700 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#f0b100] rounded-full mb-4"></div>
            <p className="text-gray-400 text-lg">Loading ban information...</p>
          </div>
        ) : (
          <div className="bg-[#222] rounded-lg shadow-md border border-gray-700 overflow-hidden">
            <div className="p-4">
              <BanTable bans={bans} showVisitorInfo={!visitorId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}