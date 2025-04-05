//src/app/incidents/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { getIncidentDetails } from '@/app/actions/visitor';
import { getVisitDetails } from '@/app/actions/visits';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Type definitions for better type safety
interface Visitor {
  first_name: string;
  last_name: string;
  phone_number: string;
  is_banned: boolean;
}

interface Staff {
  first_name: string;
  last_name: string;
  role: string;
}

interface Incident {
  id: number;
  visitor_id: number;
  visit_id: number;
  visitor_name: string;
  recorded_by_name: string;
  recorded_by_id: number;
  description: string;
  recorded_at: string;
}

interface Visit {
  id: number;
  visitor_id: number;
  visitor: Visitor;
  approved_by: Staff;
  left_approved_by: Staff | null;
  status: string;
  visit_time: string;
  leave_time: string | null;
  duration: string | null;
  reason: string;
  incidents: Incident[];
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the params promise
  const resolvedParams = use(params);
  const incidentId = parseInt(resolvedParams.id);
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [associatedVisit, setAssociatedVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisitLoading, setIsVisitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitError, setVisitError] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidentDetails();
  }, [incidentId]);

  const fetchIncidentDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getIncidentDetails(incidentId);
      
      if (result.success && result.incident) {
        setIncident(result.incident);
        
        // Now fetch the associated visit details if we have a visit_id
        if (result.incident.visit_id) {
          fetchVisitDetails(result.incident.visit_id);
        }
      } else {
        const errorMessage = result.error || 'Failed to load incident details';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVisitDetails = async (visitId: number) => {
    setIsVisitLoading(true);
    setVisitError(null);
    
    try {
      const result = await getVisitDetails(visitId);
      if (result.success && result.visit) {
        setAssociatedVisit(result.visit);
      } else {
        const errorMessage = result.error || 'Failed to load visit details';
        setVisitError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setVisitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVisitLoading(false);
    }
  };

  // Format utilities
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (durationString: string | null) => {
    if (!durationString) return 'Still in progress';
    
    const parts = durationString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    return `${hours}h ${minutes}m`;
  };

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'visit': return 'bg-green-100 text-green-800';
      case 'ban': return 'bg-red-100 text-red-800';
      case 'leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <svg className="animate-spin h-8 w-8 text-[#f0b100]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href="/incidents" className="text-[#f0b100] hover:text-[#e0a000] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Incidents
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-white">Incident Details #{incidentId}</h1>

      {isLoading ? (
        <div className="bg-[#222] p-6 rounded-lg shadow-md">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : incident ? (
        <div className="space-y-6">
          {/* Incident Information Card */}
          <div className="bg-[#222] rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#f0b100] text-white p-4">
              <h2 className="text-xl font-bold">Incident #{incident.id}</h2>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Visitor Information</h3>
                  <p className="font-medium text-lg text-white">{incident.visitor_name}</p>
                  <p className="text-sm text-gray-400">Visitor ID: #{incident.visitor_id}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Recorded By</h3>
                  <p className="font-medium text-white">{incident.recorded_by_name}</p>
                  <p className="text-sm text-gray-400">Staff ID: #{incident.recorded_by_id}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 mb-1">Date & Time</h3>
                <p className="font-medium text-white">{formatDate(incident.recorded_at)}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 mb-1">Incident Description</h3>
                <div className="mt-2 bg-[#2a2a2a] p-4 rounded-md border border-gray-700">
                  <p className="whitespace-pre-wrap text-white">{incident.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Associated Visit Card */}
          <div className="bg-[#222] rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#f0b100] text-white p-4">
              <h2 className="text-xl font-bold">Associated Visit #{incident.visit_id}</h2>
            </div>
            
            <div className="p-4 md:p-6">
              {isVisitLoading ? (
                <LoadingSpinner />
              ) : visitError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="font-bold">Error Loading Visit Details</p>
                  <p>{visitError}</p>
                </div>
              ) : associatedVisit ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Visitor Information</h3>
                      <p className="font-medium text-lg text-white">
                        {associatedVisit.visitor?.first_name} {associatedVisit.visitor?.last_name}
                      </p>
                      <p className="text-sm text-gray-400">Phone: {associatedVisit.visitor?.phone_number}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Visit Status</h3>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(associatedVisit.status)}`}>
                          {associatedVisit.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Visit Time</h3>
                      <p className="font-medium text-white">{formatDate(associatedVisit.visit_time)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Leave Time</h3>
                      <p className="font-medium text-white">
                        {associatedVisit.leave_time ? formatDate(associatedVisit.leave_time) : 'Not left yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Duration</h3>
                      <p className="font-medium text-white">
                        {formatDuration(associatedVisit.duration)}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">Approved By</h3>
                      <p className="font-medium text-white">
                        {associatedVisit.approved_by?.first_name} {associatedVisit.approved_by?.last_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Role: {associatedVisit.approved_by?.role?.charAt(0).toUpperCase() + associatedVisit.approved_by?.role?.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  {associatedVisit.left_approved_by && (
                    <div className="mb-6">
                      <h3 className="text-sm text-gray-400 mb-1">Leave Approved By</h3>
                      <p className="font-medium text-white">
                        {associatedVisit.left_approved_by?.first_name} {associatedVisit.left_approved_by?.last_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Role: {associatedVisit.left_approved_by?.role?.charAt(0).toUpperCase() + associatedVisit.left_approved_by?.role?.slice(1)}
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-400 mb-1">Visit Reason</h3>
                    <div className="mt-2 bg-[#2a2a2a] p-4 rounded-md border border-gray-700">
                      <p className="whitespace-pre-wrap text-white">{associatedVisit.reason}</p>
                    </div>
                  </div>
                  
                  {associatedVisit.incidents && associatedVisit.incidents.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <h3 className="text-sm text-gray-400 mb-3">All Incidents During This Visit</h3>
                      <div className="space-y-3">
                        {associatedVisit.incidents.map((inc: any) => (
                          <div key={inc.id} className="bg-[#2a2a2a] p-3 rounded-md border border-gray-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <Link href={`/incidents/${inc.id}`} className="font-medium text-[#f0b100] hover:text-[#e0a000]">
                                  Incident #{inc.id}
                                </Link>
                                <p className="text-xs text-gray-400 mt-1">{formatDate(inc.recorded_at)}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                inc.id === incident.id ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {inc.id === incident.id ? 'Current' : 'Related'}
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-300">
                              {inc.description.length > 100 ? 
                                `${inc.description.substring(0, 100)}...` : 
                                inc.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400">No visit information found for this incident</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#222] p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center h-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-lg">Incident not found</p>
        </div>
      )}
    </div>
  );
}