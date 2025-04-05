//src/components/VisitorProfileComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { getLastVisitByNationalId } from '@/app/actions/visitor';
import { toast } from 'react-hot-toast';

interface VisitorProfileProps {
  visitor: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    national_id: string;
    image_url?: string;
    is_banned: boolean;
    ban_reason?: string;
  };
  nationalId: string;
}

interface VisitData {
  id: number;
  visit_time: string;
  leave_time: string | null;
  reason: string;
  status: string;
  approved_by: {
    id: number;
    name: string;
  };
  left_approved_by?: {
    id: number;
    name: string;
  };
  duration: string | null;
  incidents: Array<{
    id: number;
    description: string;
    recorded_at: string;
    recorded_by_id: number;
    visit_id: number;
    visitor_id: number;
  }>;
}

export default function VisitorProfileComponent({ visitor, nationalId }: VisitorProfileProps) {
  const [lastVisit, setLastVisit] = useState<VisitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLastVisit() {
      setIsLoading(true);
      try {
        const result = await getLastVisitByNationalId(nationalId);
        if (result.success && result.visit) {
          setLastVisit(result.visit);
        } else {
          setError(result.error || 'No visit records found');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to fetch last visit');
        toast.error('Failed to load visit history');
      } finally {
        setIsLoading(false);
      }
    }

    if (nationalId) {
      fetchLastVisit();
    }
  }, [nationalId]);

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const calculateDuration = (entryTime: string, exitTime: string | null) => {
    if (!exitTime) return null;
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diff = exit.getTime() - entry.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  const formatDuration = (durationString: string) => {
    if (!durationString) return 'N/A';
    
    const parts = durationString.split(':');
    if (parts.length !== 3) return durationString;
    
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    return `${hours} hours, ${minutes} minutes`;
  };

  return (
    <div className="bg-[#222] p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Visitor Profile</h2>
      
      <div className="flex flex-col gap-6">
        {/* Visitor Image */}
        <div className="flex justify-center">
          {visitor.image_url ? (
            <img 
              src={visitor.image_url} 
              alt={`${visitor.first_name} ${visitor.last_name}`} 
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-700"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl text-gray-300">
                {visitor.first_name && visitor.last_name ? 
                  `${visitor.first_name[0]}${visitor.last_name[0]}` : 'NA'}
              </span>
            </div>
          )}
        </div>

        {/* Visitor Details */}
        <div className="space-y-3">
          <div className="bg-[#2a2a2a] rounded-lg p-3">
            <p className="text-sm text-gray-400">Full Name</p>
            <p className="text-base text-gray-200 font-medium">{visitor.first_name} {visitor.last_name}</p>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-3">
            <p className="text-sm text-gray-400">Phone Number</p>
            <p className="text-base text-gray-200 font-medium">{visitor.phone_number}</p>
          </div>
          
          <div className={`rounded-lg p-3 ${visitor.is_banned ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
            <p className="text-sm text-gray-400">Status</p>
            <div className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${visitor.is_banned ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <p className={`text-base font-medium ${visitor.is_banned ? 'text-red-400' : 'text-green-400'}`}>
                {visitor.is_banned ? 'BANNED' : 'ALLOWED'}
              </p>
            </div>
            {visitor.is_banned && visitor.ban_reason && (
              <p className="text-sm text-red-400 mt-2">Reason: {visitor.ban_reason}</p>
            )}
          </div>
        </div>
      </div>

      {/* Last Visit Section */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-300">Last Visit</h3>
        
        {isLoading && (
          <div className="flex justify-center py-6">
            <svg className="animate-spin h-6 w-6 text-[#f0b100]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-4 text-gray-400 bg-[#2a2a2a] rounded-lg p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {!isLoading && lastVisit && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Entry Time</p>
                <p className="text-base text-gray-200">{formatDateTime(lastVisit.visit_time)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-base text-gray-200">
                  {lastVisit.status === "visit" ? (
                    <span className="inline-flex items-center bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                      Currently on premises
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Visit completed
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Approved Entry By</p>
                <p className="text-base text-gray-200">{lastVisit.approved_by?.name || 'N/A'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Exit Time</p>
                <p className="text-base text-gray-200">
                  {lastVisit.leave_time ? (
                    formatDateTime(lastVisit.leave_time)
                  ) : (
                    <span className="text-gray-500">Not yet left</span>
                  )}
                </p>
              </div>
            </div>

            {lastVisit.status === "leave" && lastVisit.left_approved_by && (
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Approved Exit By</p>
                <p className="text-base text-gray-200">{lastVisit.left_approved_by.name}</p>
              </div>
            )}

            {lastVisit.reason && (
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Purpose of Visit</p>
                <p className="text-base text-gray-200">{lastVisit.reason}</p>
              </div>
            )}

            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Visit Duration</p>
              {lastVisit.status === "leave" ? (
                <p className="text-base text-gray-200">
                  {lastVisit.duration && typeof lastVisit.duration === 'string' && lastVisit.duration.includes(':') 
                    ? formatDuration(lastVisit.duration)
                    : lastVisit.duration 
                      ? `${lastVisit.duration} minutes` 
                      : (() => {
                          const duration = calculateDuration(lastVisit.visit_time, lastVisit.leave_time);
                          return duration 
                            ? `${duration.hours} hours, ${duration.minutes} minutes`
                            : 'N/A';
                        })()
                  }
                </p>
              ) : (
                <p className="text-gray-500">
                  {(() => {
                    const currentTime = new Date();
                    const startTime = new Date(lastVisit.visit_time);
                    const diff = currentTime.getTime() - startTime.getTime();
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return `Ongoing (${hours}h ${minutes}m so far)`;
                  })()}
                </p>
              )}
            </div>

            {lastVisit.incidents && lastVisit.incidents.length > 0 && (
              <div className="bg-gray-700/50 p-3 rounded">
                <p className="text-sm text-gray-400">Incidents</p>
                <div className="mt-2 space-y-2">
                  <p className="text-yellow-400 text-sm font-medium">
                    {lastVisit.incidents.length} incident{lastVisit.incidents.length > 1 ? 's' : ''} reported
                  </p>
                  {lastVisit.incidents.slice(0, 2).map((incident) => (
                    <div key={incident.id} className="bg-gray-800/70 p-2 rounded text-sm">
                      <p className="text-gray-300">{incident.description}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Recorded: {formatDateTime(incident.recorded_at)}
                      </p>
                    </div>
                  ))}
                  {lastVisit.incidents.length > 2 && (
                    <p className="text-gray-400 text-xs italic">
                      + {lastVisit.incidents.length - 2} more incidents (view in Incidents tab)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}