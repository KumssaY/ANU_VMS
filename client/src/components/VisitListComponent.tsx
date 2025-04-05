//src/components/VisitListComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { getVisitorVisits } from '@/app/actions/visits';
import Link from 'next/link';
import { format } from 'date-fns';
import { LucideArrowRight, LucideCalendar, LucideUsers } from 'lucide-react';

interface Visit {
  id: number;
  visit_time: string;
  leave_time?: string;
  reason: string;
  status: string;
  duration?: string;
  incidents?: any[];
}

interface VisitListComponentProps {
  visitor: {
    id: string;
  };
  limit?: number;
}

export default function VisitListComponent({ visitor, limit = 5 }: VisitListComponentProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVisits = async () => {
      if (!visitor || !visitor.id) return;
      
      setIsLoading(true);
      try {
        const result = await getVisitorVisits(visitor.id, 1, limit);
        if (result.success) {
          setVisits(result.visits || []);
        } else {
          setError(result.error || 'Failed to load visits');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadVisits();
  }, [visitor, limit]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Active
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#222] p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f0b100]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#222] p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#222] rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-200 flex items-center">
          <LucideCalendar className="mr-2 h-5 w-5 text-[#f0b100]" />
          Recent Visits
        </h2>
        <Link 
          href={`/visits?visitor=${visitor.id}`} 
          className="text-[#f0b100] hover:text-[#e0a000] flex items-center text-sm font-medium"
        >
          View all
          <LucideArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {visits.length === 0 ? (
        <div className="p-8 text-center">
          <LucideUsers className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No visit history found for this visitor</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {visits.map((visit) => (
            <Link 
              key={visit.id} 
              href={`/visits/${visit.id}`} 
              className="block hover:bg-gray-800/50 transition-colors"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-200">
                      Visit #{visit.id}: <span className="text-gray-400">{visit.reason}</span>
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatDateTime(visit.visit_time)}
                      {visit.leave_time && ` - ${formatDateTime(visit.leave_time)}`}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(visit.status)}
                    {visit.incidents && visit.incidents.length > 0 && (
                      <span className="ml-2 bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                        {visit.incidents.length} {visit.incidents.length === 1 ? 'incident' : 'incidents'}
                      </span>
                    )}
                  </div>
                </div>
                {visit.duration && (
                  <p className="text-sm text-gray-500">
                    Duration: {visit.duration.split('.')[0]} {/* Truncate microseconds */}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}