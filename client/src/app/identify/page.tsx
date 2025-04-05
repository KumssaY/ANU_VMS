//src/app/identify/page.tsx
'use client';

import { useState } from 'react';
import { identifyVisitor } from '@/app/actions/visitor';
import { getLastVisitByNationalId } from '@/app/actions/visitor';
import BanComponent from '@/components/BanComponent';
import IncidentComponent from '@/components/IncidentComponent';
import VisitorProfileComponent from '@/components/VisitorProfileComponent';
import VisitLeaveForm from '@/components/VisitLeaveForm';
import VisitListComponent from '@/components/VisitListComponent';
import { toast } from 'react-hot-toast';

export default function IdentifyPage() {
  const [nationalId, setNationalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [identifiedVisitor, setIdentifiedVisitor] = useState<any>(null);
  const [lastVisit, setLastVisit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'incidents' | 'visit'>('profile');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('national_id', nationalId);

      // Identify the visitor
      const result = await identifyVisitor(formData);

      if (result.success && result.visitor) {
        setIdentifiedVisitor(result.visitor);
        toast.success(`Identified: ${result.visitor.first_name} ${result.visitor.last_name}`);
        
        // Fetch the last visit for this visitor
        const visitResult = await getLastVisitByNationalId(nationalId);
        if (visitResult.success && visitResult.visit) {
          setLastVisit(visitResult.visit);
        } else {
          setLastVisit(null);
        }
        
        setActiveTab('profile');
      } else {
        setError(result.error || 'Failed to identify visitor');
        toast.error(result.error || 'Failed to identify visitor');
        setIdentifiedVisitor(null);
        setLastVisit(null);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
      toast.error('Search failed. Please try again.');
      console.error('Error identifying visitor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisitActionComplete = async () => {
    if (!nationalId) return;
    
    try {
      const visitResult = await getLastVisitByNationalId(nationalId);
      if (visitResult.success && visitResult.visit) {
        setLastVisit(visitResult.visit);
      } else {
        setLastVisit(null);
      }
      setActiveTab('profile');
    } catch (error) {
      console.error('Error refreshing visit data:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-200">Visitor Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Search form */}
        <div className="lg:col-span-1">
          <div className="bg-[#222] p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Search Visitor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="national_id" className="block text-sm font-medium text-gray-300">
                  National ID:
                </label>
                <input
                  type="text"
                  id="national_id"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] text-gray-200 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 focus:ring-1 placeholder-gray-500 py-2 px-3"
                  placeholder="Enter ID number"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Identify Visitor'
                )}
              </button>
            </form>
          </div>

          {identifiedVisitor && (
            <div className="mt-6">
              <VisitorProfileComponent 
                visitor={identifiedVisitor} 
                nationalId={nationalId}
              />
            </div>
          )}
        </div>

        {/* Right column - Results */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {identifiedVisitor ? (
            <div className="space-y-6">
              {/* Tabs Section */}
              <div className="bg-[#222] rounded-lg shadow-lg border border-gray-700">
                <div className="border-b border-gray-700">
                  <nav className="flex" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`px-4 py-4 text-center border-b-2 font-medium ${
                        activeTab === 'profile'
                          ? 'border-[#f0b100] text-[#f0b100]'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                      } transition-colors flex-1`}
                    >
                      Ban Management
                    </button>
                    <button
                      onClick={() => setActiveTab('incidents')}
                      className={`px-4 py-4 text-center border-b-2 font-medium ${
                        activeTab === 'incidents'
                          ? 'border-[#f0b100] text-[#f0b100]'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                      } transition-colors flex-1`}
                    >
                      Incidents
                    </button>
                    <button
                      onClick={() => setActiveTab('visit')}
                      className={`px-4 py-4 text-center border-b-2 font-medium ${
                        activeTab === 'visit'
                          ? 'border-[#f0b100] text-[#f0b100]'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                      } transition-colors flex-1`}
                    >
                      Visit Management
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'profile' && <BanComponent visitor={identifiedVisitor} />}
                  {activeTab === 'incidents' && <IncidentComponent visitor={identifiedVisitor} nationalId={nationalId} />}
                  {activeTab === 'visit' && (
                    <VisitLeaveForm 
                      visitor={identifiedVisitor} 
                      lastVisit={lastVisit} 
                      onComplete={handleVisitActionComplete}
                    />
                  )}
                </div>
              </div>

              {/* Visit History Section */}
              <VisitListComponent 
                visitor={{ id: identifiedVisitor.id }}
                limit={5}
              />
            </div>
          ) : (
            <div className="bg-[#222] p-8 rounded-lg shadow-lg border border-gray-700 flex flex-col items-center justify-center text-center h-80">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-12 w-12 text-[#f0b100] mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-300 text-xl font-medium mb-2">Searching...</p>
                  <p className="text-gray-500">Looking for visitor information</p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-300 text-xl font-medium mb-2">No Visitor Selected</p>
                  <p className="text-gray-500">Enter a National ID to search for a visitor</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}