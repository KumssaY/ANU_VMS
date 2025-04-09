'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVisitorVisits, getAllVisits } from '@/app/actions/visits';
import VisitTable from '@/components/VisitTable';
import Link from 'next/link';
import { LucideArrowLeft } from 'lucide-react';

export default function VisitsPage() {
  const searchParams = useSearchParams();
  const visitorId = searchParams.get('visitor');

  const [visits, setVisits] = useState<any[]>([]);
  const [visitor, setVisitor] = useState<any>(null);
  const [pagination, setPagination] = useState<any>({
    current_page: 1,
    per_page: 50,
    total_pages: 1,
    total_items: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadData(currentPage);
  }, [visitorId, currentPage]);

  const loadData = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (visitorId) {
        const result = await getVisitorVisits(visitorId, page, 50, true);
        if (result.success) {
          setVisits(result.visits || []);
          setVisitor(result.visitor || null);
          setPagination(result.pagination || {});
        } else {
          setError(result.error || 'Failed to fetch visitor visits');
        }
      } else {
        setVisits([]);
        setVisitor(null);
        setPagination({});
        setError('Please select a visitor to view their visits');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.total_pages) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            href="/identify"
            className="mr-4 text-[#f0b100] hover:text-[#e0a000] transition-colors"
          >
            <LucideArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Visit History
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <VisitTable
          visits={visits}
          isLoading={isLoading}
          showVisitor={!visitorId}
          visitor={visitor || undefined}
        />

        {pagination.total_pages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#222] text-gray-300 rounded-md hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {pagination.total_pages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.total_pages}
              className="px-4 py-2 bg-[#222] text-gray-300 rounded-md hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
