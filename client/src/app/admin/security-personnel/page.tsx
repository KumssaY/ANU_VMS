// src/app/admin/security-personnel/page.tsx
import { getAllSecurityPersonnel } from "@/app/actions/admin";
import { requireAdmin } from "@/app/actions/auth";
import Link from "next/link";
import { Suspense } from "react";

export default async function SecurityPersonnelPage({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string; };
}) {
  // Server component to check if user is admin
  await requireAdmin();

  // Get current page from query params or default to 1
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;
  
  // Format date function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="ml-64 p-8 bg-gray-500 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Security Personnel</h1>
        <Link 
          href="/admin/register-security" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add New Personnel
        </Link>
      </div>
      
      <Suspense fallback={<div className="text-white text-center py-8">Loading personnel data...</div>}>
        <SecurityPersonnelTable currentPage={currentPage} searchQuery={searchParams?.query} />
      </Suspense>
    </div>
  );
}

async function SecurityPersonnelTable({ 
  currentPage, 
  searchQuery 
}: { 
  currentPage: number; 
  searchQuery?: string;
}) {
  const perPage = 10;
  let personnelData;

  try {
    personnelData = await getAllSecurityPersonnel(currentPage, perPage);
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
        <strong className="font-bold">Error loading security personnel data.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Phone</th>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Role</th>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Joined</th>
              <th className="px-6 py-3 text-gray-300 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {personnelData.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                  No security personnel found.
                </td>
              </tr>
            ) : (
              personnelData.items.map((personnel) => (
                <tr key={personnel.id} className="hover:bg-gray-700 text-gray-300">
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/security-personnel/${personnel.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {`${personnel.first_name} ${personnel.last_name}`}
                      {personnel.other_names ? ` ${personnel.other_names}` : ''}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{personnel.email}</td>
                  <td className="px-6 py-4">{personnel.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4">{personnel.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      personnel.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {personnel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(personnel.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/security-personnel/${personnel.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Link>
                      {personnel.is_active && (
                        <Link 
                          href={`/admin/security-personnel/${personnel.id}/deactivate`}
                          className="text-red-400 hover:text-red-300"
                        >
                          Deactivate
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {personnelData.pages > 1 && (
        <div className="px-6 py-4 bg-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, personnelData.total)} of {personnelData.total} results
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/security-personnel?page=${currentPage - 1}${searchQuery ? `&query=${searchQuery}` : ''}`}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Previous
              </Link>
            )}
            {currentPage < personnelData.pages && (
              <Link
                href={`/admin/security-personnel?page=${currentPage + 1}${searchQuery ? `&query=${searchQuery}` : ''}`}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}