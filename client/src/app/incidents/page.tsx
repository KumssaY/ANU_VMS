// src/app/incidents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import IncidentsTable from '@/components/IncidentsTable';

export default function IncidentsListPage() {
  const searchParams = useSearchParams();
  const [nationalId, setNationalId] = useState('');
  const [searchedNationalId, setSearchedNationalId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Check for national_id query parameter on load
  useEffect(() => {
    const queryNationalId = searchParams.get('national_id');
    if (queryNationalId) {
      setNationalId(queryNationalId);
      setSearchedNationalId(queryNationalId);
      setIsSearching(true);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchedNationalId(nationalId);
  };

  return (
    <div className="min-h-screen bg-[#3E3E3E] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Incidents Management</h1>
        
        <div className="bg-[#222] p-6 rounded-lg shadow-md mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-[#f0b100]">Search Incidents</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full p-3 bg-black text-white border border-gray-600 rounded-md
                          focus:ring-[#f0b100] focus:border-[#f0b100] placeholder-gray-500"
                placeholder="Enter National ID"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#f0b100] text-black font-bold py-3 px-6 rounded-md
                       hover:bg-[#e0a000] transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {isSearching && searchedNationalId && <IncidentsTable nationalId={searchedNationalId} />}
        
        {!isSearching && (
          <div className="bg-[#222] p-8 rounded-lg shadow-md border border-gray-700 flex flex-col items-center justify-center text-center min-h-[300px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">Enter a National ID to view incident records</p>
          </div>
        )}
      </div>
    </div>
  );
}