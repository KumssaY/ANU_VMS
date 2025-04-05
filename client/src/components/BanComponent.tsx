//src/components/BanComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { banVisitor, unbanVisitor, getVisitorCurrentBan, getVisitorBanHistory } from '@/app/actions/visitor';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import BanTable from '@/components/BanTable';

interface BanComponentProps {
  visitor: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    is_banned: boolean;
    ban_reason?: string | null;
    image_path?: string | null;
  };
}

export default function BanComponent({ visitor }: BanComponentProps) {
  const [reason, setReason] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [currentBan, setCurrentBan] = useState<any>(null);
  const [banHistory, setBanHistory] = useState<any[]>([]);
  const [isLoadingBanData, setIsLoadingBanData] = useState(true);

  // Load ban data when component mounts or visitor changes
  useEffect(() => {
    async function fetchBanData() {
      if (!visitor || !visitor.id) return;
  
      setIsLoadingBanData(true);
      try {
        const banHistoryResult = await getVisitorBanHistory(visitor.id);
        console.log('Fetched Ban History:', banHistoryResult);
  
        if (banHistoryResult.success && Array.isArray(banHistoryResult.banHistory)) {
          setBanHistory(banHistoryResult.banHistory);
        } else {
          setBanHistory([]);
        }
      } catch (error) {
        console.error('Error fetching ban data:', error);
        toast.error('Failed to load ban information');
      } finally {
        setIsLoadingBanData(false);
      }
    }
  
    fetchBanData();
  }, [visitor?.id]);
  
  

  const handleBanVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setActionStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('visitor_id', visitor.id);
      formData.append('reason', reason);
      formData.append('secret_code', secretCode);

      const result = await banVisitor(formData);

      if (result.success) {
        setActionStatus({ type: 'success', message: 'Visitor banned successfully' });
        toast.success('Visitor banned successfully');
        setReason('');
        setSecretCode('');
        
        // Refresh the ban data after successful action
        const currentBanResult = await getVisitorCurrentBan(visitor.id);
        if (currentBanResult.success && currentBanResult.currentBan) {
          setCurrentBan(currentBanResult.currentBan);
        }
        
        const banHistoryResult = await getVisitorBanHistory(visitor.id);
        if (banHistoryResult.success) {
          setBanHistory(banHistoryResult.banHistory || []);
        }
        
        // Force page refresh after a short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed to ban visitor' });
        toast.error(result.error || 'Failed to ban visitor');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setActionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setActionStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('visitor_id', visitor.id);
      formData.append('secret_code', secretCode);

      const result = await unbanVisitor(formData);

      if (result.success) {
        setActionStatus({ type: 'success', message: 'Visitor unbanned successfully' });
        toast.success('Visitor unbanned successfully');
        setSecretCode('');
        
        // Update the current ban and ban history
        setCurrentBan(null);
        
        const banHistoryResult = await getVisitorBanHistory(visitor.id);
        if (banHistoryResult.success) {
          setBanHistory(banHistoryResult.banHistory || []);
        }
        
        // Force page refresh after a short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setActionStatus({ type: 'error', message: result.error || 'Failed to unban visitor' });
        toast.error(result.error || 'Failed to unban visitor');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setActionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#222] rounded-lg shadow-md overflow-hidden">
      {/* Visitor Ban Status Header */}
      <div className="bg-[#222] text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Ban Management: {visitor.first_name} {visitor.last_name}
          </h2>
          <span 
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              visitor.is_banned ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {visitor.is_banned ? 'Banned' : 'Active'}
          </span>
        </div>
      </div>

      {/* Current Ban Information (if exists) */}
      {isLoadingBanData ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2"></div>
          <p className="text-gray-400">Loading ban information...</p>
        </div>
      ) : (
        <>
          {currentBan && (
            <div className="p-4 bg-red-900/30 border-l-4 border-red-500 m-4 rounded">
              <h3 className="text-lg font-semibold text-red-400">Current Ban</h3>
              <p className="text-gray-300">
                <span className="font-semibold">Reason:</span> {currentBan.reason}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Date:</span> {new Date(currentBan.banned_at).toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Ban ID:</span> #{currentBan.id}
              </p>
              {currentBan.id && (
                <Link 
                  href={`/bans/${currentBan.id}`}
                  className="mt-2 inline-block text-yellow-400 hover:text-yellow-300 underline"
                >
                  View Ban Details
                </Link>
              )}
            </div>
          )}

          {/* Ban History Table */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Ban History</h3>
              <Link 
                href={`/bans?visitorId=${visitor.id}`}
                className="text-yellow-400 hover:text-yellow-300"
              >
                View All Bans
              </Link>
            </div>
            
            {banHistory && banHistory.length > 0 ? (
              <BanTable bans={banHistory.slice(0, 3)} /> // Only show 3 most recent bans
            ) : (
              <p className="text-gray-400 text-center py-4">No ban history found</p>
            )}
          </div>
        </>
      )}

      {/* Status message */}
      {actionStatus.type && (
        <div className={`mx-4 mb-4 p-3 rounded ${
          actionStatus.type === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
        }`}>
          {actionStatus.message}
        </div>
      )}

      {/* Ban/Unban Form */}
      <div className="p-4">
        {visitor.is_banned ? (
          <form onSubmit={handleUnbanVisitor} className="space-y-4">
            <div>
              <label htmlFor="secret_code" className="block text-sm font-medium text-gray-300">
                Secret Code:
              </label>
              <input
                type="password"
                id="secret_code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-500 bg-gray-800 text-gray-300 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 placeholder-gray-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Unban Visitor'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBanVisitor} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-300">
                Ban Reason:
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] text-gray-200 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 focus:ring-1 placeholder-gray-500 py-2 px-3 h-20"
                placeholder="Describe the Ban reason in detail"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label htmlFor="secret_code" className="block text-sm font-medium text-gray-300">
                Secret Code:
              </label>
              <input
                type="password"
                id="secret_code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] text-gray-200 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 focus:ring-1 placeholder-gray-500 py-2 px-3"
                placeholder="Enter your secret code"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Ban Visitor'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}