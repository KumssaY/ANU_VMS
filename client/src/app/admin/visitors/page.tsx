//src/admin/visitors/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllVisitors, Visitor, PaginatedResponse } from "@/app/actions/admin";

export default function VisitorManagementPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchVisitors = async (page: number) => {
      try {
        setLoading(true);
        // Using the updated getAllVisitors function that handles auth internally
        const response = await getAllVisitors(page);
        setVisitors(response.items);
        setTotalPages(response.pages);
        setCurrentPage(response.current_page);
      } catch (err) {
        console.error("Failed to fetch visitors:", err);
        setError("Failed to load visitors data. Please ensure you're logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (visitorId: string) => {
    router.push(`/admin/visitors/${visitorId}`);
  };

  return (
    <div className="ml-64 p-8 bg-gray-500 h-175">
      <h1 className="mb-6 text-3xl font-bold">Visitor Management</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-500 bg-opacity-20 p-3 text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">All Visitors</h2>

        {loading ? (
          <div className="py-4 text-center">Loading visitors data...</div>
        ) : visitors.length === 0 ? (
          <div className="py-4 text-center">No visitors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">
                      {visitor.first_name} {visitor.last_name}
                      {visitor.other_names && ` ${visitor.other_names}`}
                    </td>
                    <td className="px-4 py-2">{visitor.phone_number || 'N/A'}</td>
                    <td className="px-4 py-2">{visitor.role}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          visitor.is_banned
                            ? "bg-red-500 bg-opacity-20 text-red-300"
                            : "bg-green-500 bg-opacity-20 text-green-300"
                        }`}
                      >
                        {visitor.is_banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(visitor.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleViewDetails(visitor.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}