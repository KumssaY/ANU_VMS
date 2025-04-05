//src/components/VisitTable.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

interface Visit {
  id: number;
  visit_time: string;
  leave_time?: string;
  reason: string;
  status: string;
  duration?: string;
  approved_by?: {
    first_name: string;
    last_name: string;
  };
  left_approved_by?: {
    first_name: string;
    last_name: string;
  };
  incidents?: any[];
}

interface VisitTableProps {
  visits: Visit[];
  isLoading?: boolean;
  showVisitor?: boolean;
  visitor?: {
    first_name?: string;
    last_name?: string;
    name?: string;
  };
}

export default function VisitTable({ visits, isLoading = false, showVisitor = false, visitor }: VisitTableProps) {
  const [sortField, setSortField] = useState<keyof Visit>('visit_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Visit) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedVisits = [...visits].sort((a, b) => {
    if (sortField === 'visit_time' || sortField === 'leave_time') {
      const dateA = new Date(a[sortField] || '');
      const dateB = new Date(b[sortField] || '');
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    const valueA = a[sortField] || '';
    const valueB = b[sortField] || '';
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return 0;
  });

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const renderSortArrow = (field: keyof Visit) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'visit':
        return 'bg-blue-500 text-white';
      case 'leave':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getVisitorName = () => {
    if (!visitor) return '';
    if (visitor.name) return visitor.name;
    if (visitor.first_name && visitor.last_name) return `${visitor.first_name} ${visitor.last_name}`;
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg className="animate-spin h-8 w-8 text-[#f0b100]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-2 text-gray-300">Loading visits...</span>
      </div>
    );
  }

  if (!visits || visits.length === 0) {
    return (
      <div className="bg-[#222] border border-gray-700 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-gray-400">No visits found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#222] border border-gray-700 rounded-lg shadow overflow-hidden">
      {showVisitor && visitor && (
        <div className="p-4 border-b border-gray-700 bg-[#2a2a2a]">
          <h3 className="font-medium text-white">Visitor: <span className="text-[#f0b100]">{getVisitorName()}</span></h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#222]">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID {renderSortArrow('id')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('visit_time')}
              >
                Visit Time {renderSortArrow('visit_time')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('leave_time')}
              >
                Leave Time {renderSortArrow('leave_time')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('reason')}
              >
                Reason {renderSortArrow('reason')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {renderSortArrow('status')}
              </th>
          
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#222] divide-y divide-gray-700">
            {sortedVisits.map((visit) => (
              <tr key={visit.id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {visit.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatDateTime(visit.visit_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {visit.leave_time ? formatDateTime(visit.leave_time) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {visit.reason || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visit.status)}`}>
                    {visit.status}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/visits/${visit.id}`} 
                    className="text-[#f0b100] hover:text-[#e0a000] transition-colors"
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}