// src/components/IncidentsTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { getVisitorIncidentsByNationalId } from '@/app/actions/visitor';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Incident {
  incident_id: number;
  description: string;
  recorded_at: string;
  recorded_by: number;
  visit_id: number;
}

interface IncidentsTableProps {
  nationalId: string;
}

export default function IncidentsTable({ nationalId }: IncidentsTableProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (nationalId) {
      fetchIncidents();
    }
  }, [nationalId]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getVisitorIncidentsByNationalId(nationalId);
      
      if (result.success) {
        setIncidents(result.incidents || []);
      } else {
        setError(result.error || 'Failed to load incidents');
        toast.error(result.error || 'Failed to load incidents');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const viewIncidentDetails = (incidentId: number) => {
    router.push(`/incidents/${incidentId}`);
  };

  return (
    <div className="bg-[#222] rounded-lg shadow-md overflow-hidden">
      <div className="bg-[#f0b100] text-white p-4">
        <h2 className="text-xl font-bold">Incidents History</h2>
        <p className="text-sm opacity-75">
          View all incidents for National ID: {nationalId}
        </p>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-[#f0b100]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-8 text-[#d1d5dc]">
            No incidents found for this visitor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#222]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Incident ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Recorded At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#222] divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <tr key={incident.incident_id} className="hover:bg-[#222]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">#{incident.incident_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white line-clamp-2">
                        {incident.description.length > 100 
                          ? `${incident.description.substring(0, 100)}...` 
                          : incident.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{formatDate(incident.recorded_at)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => viewIncidentDetails(incident.incident_id)}
                        className="text-[#f0b100] hover:text-[#e0a000] font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}