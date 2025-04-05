//src/app/visits/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getVisitDetails } from '@/app/actions/visits';
import Link from 'next/link';
import { 
  LucideArrowLeft, 
  LucideUser, 
  LucideCalendar, 
  LucideAlertCircle, 
  LucideCheck, 
  LucideX, 
  LucideClock,
  LucideShield,
  LucidePhone 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function VisitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [visit, setVisit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVisitDetails = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      try {
        const visitId = Number(params.id);
        const result = await getVisitDetails(visitId);
        
        if (result.success) {
          setVisit(result.visit);
        } else {
          setError(result.error || 'Failed to load visit details');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadVisitDetails();
  }, [params.id]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMMM d, yyyy h:mm a');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'h:mm a');
  };

  // Format duration to be more readable
  const formatDuration = (durationString: string) => {
    if (!durationString) return 'N/A';
    // Remove microseconds part
    const parts = durationString.split('.');
    const timeParts = parts[0].split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    
    let result = '';
    if (hours > 0) result += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
    if (seconds > 0 && hours === 0) result += `${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    return result.trim() || 'Less than a second';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            <LucideUser className="w-3 h-3 mr-1" />
            Active Visit
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
            <LucideCheck className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500 text-white">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#3E3E3E] p-6">
        <div className="max-w-6xl mx-auto flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f0b100]"></div>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="min-h-screen bg-gray-500 p-6">
        <div className="max-w-6xl mx-auto bg-gray-500">
          <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Visit not found'}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 bg-[#f0b100] text-black font-bold py-2 px-4 rounded-md flex items-center hover:bg-[#e0a000] transition-colors"
            >
              <LucideArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-500 p-8">
  <div className="max-w-6xl mx-auto">
    <div className="mb-6 flex flex-wrap items-center justify-between">
      <div className="flex items-center mb-2 sm:mb-0">
        <button 
          onClick={() => router.back()} 
          className="mr-4 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <LucideArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Visit Details #{visit.id}</h1>
      </div>
      <div>
        {getStatusBadge(visit.status)}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visitor Information Card */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center mb-4">
            <LucideUser className="h-6 w-6 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold text-white">Visitor Information</h2>
          </div>
          
          {visit.visitor && (
            <div className="space-y-4 text-gray-300">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-medium">
                  {visit.visitor.first_name} {visit.visitor.last_name}
                  {visit.visitor.other_names && ` (${visit.visitor.other_names})`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Visitor ID</p>
                <p className="font-mono text-sm">{visit.visitor.id}</p>
              </div>

              {visit.visitor.phone_number && (
                <div className="flex items-center">
                  <div>
                    <p className="text-sm text-gray-400">Phone Number</p>
                    <p>{visit.visitor.phone_number}</p>
                  </div>
                  <a 
                    href={`tel:${visit.visitor.phone_number}`} 
                    className="ml-auto text-blue-400 hover:text-blue-300"
                  >
                    <LucidePhone className="h-5 w-5" />
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-400">Role</p>
                <p className="capitalize">{visit.visitor.role || 'Visitor'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Registration Date</p>
                <p>{formatDate(visit.visitor.created_at)}</p>
              </div>

              {visit.visitor.is_banned !== undefined && (
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Ban Status</p>
                  {visit.visitor.is_banned ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                      <LucideX className="w-3 h-3 mr-1" />
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                      <LucideCheck className="w-3 h-3 mr-1" />
                      Not Banned
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visit Information Card */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700">
          <div className="border-b border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <LucideCalendar className="h-6 w-6 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Visit Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <p className="text-sm text-gray-400">Reason for Visit</p>
                <p className="bg-gray-700 p-2 rounded mt-1">{visit.reason}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="flex items-center">
                  {visit.status === 'visit' ? (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white mr-2">
                        Active
                      </span>
                      <span className="text-gray-400">Currently on premises</span>
                    </>
                  ) : visit.status === 'leave' ? (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white mr-2">
                        Completed
                      </span>
                      <span className="text-gray-400">Visit ended</span>
                    </>
                  ) : (
                    visit.status
                  )}
                </p>
              </div>

              <div className="flex items-center">
                <LucideClock className="h-4 w-4 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Visit Time</p>
                  <p>{formatDateTime(visit.visit_time)}</p>
                </div>
              </div>

              {visit.leave_time && (
                <div className="flex items-center">
                  <LucideClock className="h-4 w-4 text-blue-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Leave Time</p>
                    <p>{formatDateTime(visit.leave_time)}</p>
                  </div>
                </div>
              )}

              {visit.duration && (
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p>{formatDuration(visit.duration)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Approval Section */}
          <div className="border-b border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <LucideShield className="h-6 w-6 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Security Approval</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              {visit.approved_by && (
                <div>
                  <p className="text-sm text-gray-400">Entry Approved By</p>
                  <div className="flex items-center mt-1">
                    <LucideUser className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p>{visit.approved_by.first_name} {visit.approved_by.last_name}</p>
                      <p className="text-xs text-gray-400">{visit.approved_by.email}</p>
                      <p className="text-xs text-gray-400">Role: {visit.approved_by.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {visit.left_approved_by && (
                <div>
                  <p className="text-sm text-gray-400">Departure Approved By</p>
                  <div className="flex items-center mt-1">
                    <LucideUser className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p>{visit.left_approved_by.first_name} {visit.left_approved_by.last_name}</p>
                      <p className="text-xs text-gray-400">{visit.left_approved_by.email}</p>
                      <p className="text-xs text-gray-400">Role: {visit.left_approved_by.role}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Incidents Section */}
          {visit.incidents && visit.incidents.length > 0 && (
            <div className="p-6">
              <div className="flex items-center mb-4">
                <LucideAlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <h2 className="text-xl font-semibold text-white">Incidents ({visit.incidents.length})</h2>
              </div>

              <div className="divide-y divide-gray-700">
                {visit.incidents.map((incident: any) => (
                  <div key={incident.id} className="py-4 first:pt-0 last:pb-0 text-gray-300">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <LucideAlertCircle className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-sm font-medium">{formatDate(incident.recorded_at)}</span>
                        <span className="text-sm text-gray-400 ml-2">at {formatTime(incident.recorded_at)}</span>
                      </div>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">ID: {incident.id}</span>
                    </div>
                    <p className="bg-gray-700 p-3 rounded">{incident.description}</p>
                    {incident.recorded_by_id && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center">
                        <LucideUser className="h-3 w-3 mr-1" />
                        Recorded by ID: {incident.recorded_by_id}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
  );
}