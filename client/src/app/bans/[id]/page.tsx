//src/app/bans/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBanDetails } from '@/app/actions/visitor';

export default function BanDetailPage() {
  const params = useParams();
  const [ban, setBan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the ID from params and ensure it's a string
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const banId = parseInt(id);

  useEffect(() => {
    async function fetchBanDetails() {
      setIsLoading(true);
      
      if (isNaN(banId)) {
        setError('Invalid ban ID');
        setIsLoading(false);
        return;
      }

      try {
        const result = await getBanDetails(banId);
        
        if (result.success && result.banDetails) {
          // Map API response fields to component state fields
          const banData = result.banDetails;
          
          // Format the data to match your component's expected structure
          setBan({
            id: banData.ban_id,
            visitor_id: banData.visitor?.uuid,
            reason: banData.reason,
            banned_at: banData.issued_at,
            banned_by: banData.issued_by?.name,
            unbanned_at: banData.lifted_at,
            unbanned_by: banData.lifted_by?.name,
            visitor: {
              first_name: banData.visitor?.name.split(' ')[0] || '',
              last_name: banData.visitor?.name.split(' ').slice(1).join(' ') || '',
              national_id: banData.visitor?.national_id
            }
          });
        } else {
          setError(result.error || 'Failed to load ban details');
        }
      } catch (error: any) {
        console.error('Error fetching ban details:', error);
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBanDetails();
  }, [banId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#3E3E3E] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Ban Details</h1>
          <div className="flex gap-2">
            {/* <Link 
              href="/bans" 
              className="bg-[#f0b100] text-black font-bold px-4 py-2 rounded-md hover:bg-[#e0a000] transition-colors"
            >
              All Bans
            </Link> */}
            <Link 
              href="/identify" 
              className="bg-[#f0b100] text-black font-bold px-4 py-2 rounded-md hover:bg-[#e0a000] transition-colors"
            >
              Identify Visitor
            </Link>
          </div>
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
            <p className="text-gray-400 text-lg">Loading ban details...</p>
          </div>
        ) : ban ? (
          <div className="bg-[#222] rounded-lg shadow-md border border-gray-700 overflow-hidden">
            <div className="bg-[#f0b100] text-black p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">
                Ban #{ban.id}
                <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                  ban.unbanned_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {ban.unbanned_at ? 'Unbanned' : 'Active'}
                </span>
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Visitor Information</h3>
                <div className="bg-[#2a2a2a] p-4 rounded-md border border-gray-700">
                  {ban.visitor ? (
                    <div className="space-y-2 text-white">
                      <p>
                        <span className="font-medium">Name:</span> {ban.visitor.first_name} {ban.visitor.last_name}
                      </p>
                      {/* <p>
                        <span className="font-medium">ID:</span> {ban.visitor_id || 'N/A'}
                      </p> */}
                      {ban.visitor.national_id && (
                        <p>
                          <span className="font-medium">National ID:</span> {ban.visitor.national_id}
                        </p>
                      )}
                      {/* <Link 
                        href={`/visitors/${ban.visitor_id}`}
                        className="text-[#f0b100] hover:text-[#e0a000] transition-colors inline-block mt-2"
                      >
                        View Visitor Profile
                      </Link> */}
                    </div>
                  ) : (
                    <p className="text-gray-400">Visitor information not available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Ban Details</h3>
                <div className="bg-[#2a2a2a] p-4 rounded-md border border-gray-700 space-y-2 text-white">
                  <p><span className="font-medium">Reason:</span> {ban.reason}</p>
                  <p><span className="font-medium">Banned At:</span> {formatDate(ban.banned_at)}</p>
                  <p><span className="font-medium">Banned By:</span> {ban.banned_by || 'N/A'}</p>
                </div>
              </div>
              
              {ban.unbanned_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Unban Information</h3>
                  <div className="bg-[#2a2a2a] p-4 rounded-md border border-gray-700 space-y-2 text-white">
                    <p><span className="font-medium">Unbanned At:</span> {formatDate(ban.unbanned_at)}</p>
                    <p><span className="font-medium">Unbanned By:</span> {ban.unbanned_by || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}