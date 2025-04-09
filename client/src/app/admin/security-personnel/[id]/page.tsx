// src/app/admin/security-personnel/[id]/page.tsx
import { requireAdmin } from "@/app/actions/auth";
import { 
  getSecurityPersonnel,
} from "@/app/actions/admin";
import {
  getActivitiesByType,
  type IncidentActivity,
  type ApprovedVisitActivity,
  type ApprovedLeaveActivity,
  type BanActivity
} from "@/app/actions/activities";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeactivateButton } from "../deactivate-button";
import { UpdateCodeForm } from "./update-code";

interface ActivityTabsProps {
  id: string;
  activeTab: string;
}

function ActivityTabs({ id, activeTab }: ActivityTabsProps) {
  const tabs = [
    { name: "Overview", href: `/admin/security-personnel/${id}` },
    { name: "Approved Visits", href: `/admin/security-personnel/${id}?tab=approved_visits` },
    { name: "Approved Leaves", href: `/admin/security-personnel/${id}?tab=approved_leaves` },
    { name: "Recorded Incidents", href: `/admin/security-personnel/${id}?tab=incidents` },
    { name: "Issued Bans", href: `/admin/security-personnel/${id}?tab=issued_bans` },
    { name: "Lifted Bans", href: `/admin/security-personnel/${id}?tab=lifted_bans` },
  ];

  return (
    <div className="border-b border-gray-700 mb-6">
      <nav className="flex -mb-px">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.name.toLowerCase().replace(' ', '_') || 
              (activeTab === '' && tab.name === 'Overview')
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default async function SecurityPersonnelDetailPage({
  params,
  searchParams,
}: {
  params: { id: string, email: string };
  searchParams?: { tab?: string; page?: string };
}) {
  // Server component to check if user is admin
  await requireAdmin();
  
  const id = params.id;
  const email = params.email;
  const activeTab = searchParams?.tab || '';
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;
  
  // Format date function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  try {
    const personnel = await getSecurityPersonnel(id);

    return (
      <div className="ml-64 p-8 bg-gray-500 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin/security-personnel" className="text-white hover:text-blue-300 mb-2 inline-block">
              ← Back to Security Personnel
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {personnel.first_name} {personnel.last_name}
              {personnel.other_names ? ` ${personnel.other_names}` : ''}
            </h1>
          </div>
          
          <div className="flex space-x-3">
            <DeactivateButton 
              email={personnel.email} 
              isActive={personnel.is_active} 
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Personnel Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Full Name:</span>
                  <p className="text-white">
                    {personnel.first_name} {personnel.last_name}
                    {personnel.other_names ? ` ${personnel.other_names}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white">{personnel.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">Phone Number:</span>
                  <p className="text-white">{personnel.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Role:</span>
                  <p className="text-white">{personnel.role}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
            {personnel.is_active && (
              <UpdateCodeForm email={personnel.email} />
            )}
          </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Account Status</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Status:</span>
                  <p className="text-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      personnel.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {personnel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Account Created:</span>
                  <p className="text-white">{formatDate(personnel.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ActivityTabs id={id} activeTab={activeTab} />
          
          <div className="p-6">
            <Suspense fallback={<div className="text-white text-center py-8">Loading activity data...</div>}>
              {activeTab === 'approved_visits' && (
                <ApprovedVisitsTable id={id} page={currentPage} />
              )}
              {activeTab === 'approved_leaves' && (
                <ApprovedLeavesTable id={id} page={currentPage} />
              )}
              {activeTab === 'incidents' && (
                <RecordedIncidentsTable id={id} page={currentPage} />
              )}
              {activeTab === 'issued_bans' && (
                <IssuedBansTable id={id} page={currentPage} />
              )}
              {activeTab === 'lifted_bans' && (
                <LiftedBansTable id={id} page={currentPage} />
              )}
              {(activeTab === '' || !activeTab) && (
                <ActivitySummary id={id} formatDate={formatDate} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching security personnel:", error);
    notFound();
  }
}

interface ActivitySummaryProps {
  id: string;
  formatDate: (dateString: string | null | undefined) => string;
}

async function ActivitySummary({ id, formatDate }: ActivitySummaryProps) {
  try {
    // Fetch a small sample of each activity type to display in the overview
    const [approvedVisits, approvedLeaves, incidents, issuedBans, liftedBans] = await Promise.all([
      getActivitiesByType(id, 'approved_visits', 1, 5),
      getActivitiesByType(id, 'approved_leaves', 1, 5),
      getActivitiesByType(id, 'incidents', 1, 5),
      getActivitiesByType(id, 'issued_bans', 1, 5),
      getActivitiesByType(id, 'lifted_bans', 1, 5)
    ]);

    return (
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Approved Visits</h2>
            <Link href={`/admin/security-personnel/${id}?tab=approved_visits`} className="text-blue-400 hover:text-blue-300 text-sm">
              View All ({approvedVisits.total})
            </Link>
          </div>

          {approvedVisits.items.length === 0 ? (
            <p className="text-gray-400">No approved visits found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">Visitor ID</th>
                    <th className="pb-2 text-gray-300">Reason</th>
                    <th className="pb-2 text-gray-300">Visit Time</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedVisits.items.map((visit) => (
                    <tr key={visit.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visitors/${visit.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {visit.visitor_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">{visit.reason}</td>
                      <td className="py-3 text-gray-300">{formatDate(visit.visit_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Recorded Incidents</h2>
            <Link href={`/admin/security-personnel/${id}?tab=incidents`} className="text-blue-400 hover:text-blue-300 text-sm">
              View All ({incidents.total})
            </Link>
          </div>

          {incidents.items.length === 0 ? (
            <p className="text-gray-400">No recorded incidents found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">ID</th>
                    <th className="pb-2 text-gray-300">Description</th>
                    <th className="pb-2 text-gray-300">Recorded At</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.items.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">{incident.id}</td>
                      <td className="py-3 text-gray-300">
                        {incident.description.length > 50 
                          ? `${incident.description.substring(0, 50)}...` 
                          : incident.description}
                      </td>
                      <td className="py-3 text-gray-300">{formatDate(incident.recorded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Issued Bans</h2>
            <Link href={`/admin/security-personnel/${id}?tab=issued_bans`} className="text-blue-400 hover:text-blue-300 text-sm">
              View All ({issuedBans.total})
            </Link>
          </div>

          {issuedBans.items.length === 0 ? (
            <p className="text-gray-400">No issued bans found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">Visitor ID</th>
                    <th className="pb-2 text-gray-300">Reason</th>
                    <th className="pb-2 text-gray-300">Issued At</th>
                    <th className="pb-2 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBans.items.map((ban) => (
                    <tr key={ban.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visitors/${ban.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {ban.visitor_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">
                        {ban.reason.length > 30 ? `${ban.reason.substring(0, 30)}...` : ban.reason}
                      </td>
                      <td className="py-3 text-gray-300">{formatDate(ban.issued_at)}</td>
                      <td className="py-3 text-gray-300">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ban.is_active ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {ban.is_active ? 'Active' : 'Lifted'}
                        </span>
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
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error loading activity data.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }
}

// Component for showing the approved visits table
async function ApprovedVisitsTable({ id, page }: { id: string; page: number }) {
  try {
    const perPage = 10;
    const approvedVisits = await getActivitiesByType(id, 'approved_visits', page, perPage);

    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Approved Visits</h2>
        
        {approvedVisits.items.length === 0 ? (
          <p className="text-gray-400">No approved visits found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">ID</th>
                    <th className="pb-2 text-gray-300">Visitor ID</th>
                    <th className="pb-2 text-gray-300">Reason</th>
                    <th className="pb-2 text-gray-300">Visit Time</th>
                    <th className="pb-2 text-gray-300">Leave Time</th>
                    <th className="pb-2 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedVisits.items.map((visit) => (
                    <tr key={visit.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">{visit.id}</td>
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visitors/${visit.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {visit.visitor_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">{visit.reason}</td>
                      <td className="py-3 text-gray-300">{formatDate(visit.visit_time)}</td>
                      <td className="py-3 text-gray-300">{visit.leave_time ? formatDate(visit.leave_time) : 'Active'}</td>
                      <td className="py-3 text-gray-300">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          visit.status === 'ACTIVE' ? 'bg-green-600 text-white' : 
                          visit.status === 'COMPLETED' ? 'bg-blue-600 text-white' : 
                          'bg-gray-600 text-gray-300'
                        }`}>
                          {visit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {approvedVisits.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, approvedVisits.total)} of {approvedVisits.total} results
                </div>
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=approved_visits&page=${page - 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Previous
                    </Link>
                  )}
                  {page < approvedVisits.pages && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=approved_visits&page=${page + 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error loading approved visits.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }
}

async function ApprovedLeavesTable({ id, page }: { id: string; page: number }) {
  try {
    const perPage = 10;
    const approvedLeaves = await getActivitiesByType(id, 'approved_leaves', page, perPage);

    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Approved Leaves</h2>
        
        {approvedLeaves.items.length === 0 ? (
          <p className="text-gray-400">No approved leaves found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">ID</th>
                    <th className="pb-2 text-gray-300">Visitor ID</th>
                    <th className="pb-2 text-gray-300">Reason</th>
                    <th className="pb-2 text-gray-300">Visit Time</th>
                    <th className="pb-2 text-gray-300">Leave Time</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedLeaves.items.map((visit) => (
                    <tr key={visit.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">{visit.id}</td>
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visitors/${visit.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {visit.visitor_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">{visit.reason}</td>
                      <td className="py-3 text-gray-300">{formatDate(visit.visit_time)}</td>
                      <td className="py-3 text-gray-300">{formatDate(visit.leave_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {approvedLeaves.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, approvedLeaves.total)} of {approvedLeaves.total} results
                </div>
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=approved_leaves&page=${page - 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Previous
                    </Link>
                  )}
                  {page < approvedLeaves.pages && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=approved_leaves&page=${page + 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error loading approved leaves.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }
}

async function RecordedIncidentsTable({ id, page }: { id: string; page: number }) {
  try {
    const perPage = 10;
    const incidents = await getActivitiesByType(id, 'incidents', page, perPage);

    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recorded Incidents</h2>
        
        {incidents.items.length === 0 ? (
          <p className="text-gray-400">No recorded incidents found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">ID</th>
                    <th className="pb-2 text-gray-300">Visit ID</th>
                    <th className="pb-2 text-gray-300">Description</th>
                    <th className="pb-2 text-gray-300">Recorded At</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.items.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">{incident.id}</td>
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visits/${incident.visit_id}`} className="text-blue-400 hover:text-blue-300">
                          {incident.visit_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">
                        {incident.description.length > 50 
                          ? `${incident.description.substring(0, 50)}...` 
                          : incident.description}
                      </td>
                      <td className="py-3 text-gray-300">{formatDate(incident.recorded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {incidents.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, incidents.total)} of {incidents.total} results
                </div>
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=incidents&page=${page - 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Previous
                    </Link>
                  )}
                  {page < incidents.pages && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=incidents&page=${page + 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error loading incidents.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }
}

async function IssuedBansTable({ id, page }: { id: string; page: number }) {
  try {
    const perPage = 10;
    const issuedBans = await getActivitiesByType(id, 'issued_bans', page, perPage);

    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Issued Bans</h2>
        
        {issuedBans.items.length === 0 ? (
          <p className="text-gray-400">No issued bans found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">ID</th>
                    <th className="pb-2 text-gray-300">Visitor ID</th>
                    <th className="pb-2 text-gray-300">Reason</th>
                    <th className="pb-2 text-gray-300">Issued At</th>
                    <th className="pb-2 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBans.items.map((ban) => (
                    <tr key={ban.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">{ban.id}</td>
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visitors/${ban.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {ban.visitor_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">
                        {ban.reason.length > 30 ? `${ban.reason.substring(0, 30)}...` : ban.reason}
                      </td>
                      <td className="py-3 text-gray-300">{formatDate(ban.issued_at)}</td>
                      <td className="py-3 text-gray-300">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ban.is_active ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {ban.is_active ? 'Active' : 'Lifted'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {issuedBans.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage,                    issuedBans.total)} of {issuedBans.total} results
                </div>
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=issued_bans&page=${page - 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Previous
                    </Link>
                  )}
                  {page < issuedBans.pages && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=issued_bans&page=${page + 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error loading issued bans.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }
}

async function LiftedBansTable({ id, page }: { id: string; page: number }) {
  try {
    const perPage = 10;
    const liftedBans = await getActivitiesByType(id, 'lifted_bans', page, perPage);

    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Lifted Bans</h2>
        
        {liftedBans.items.length === 0 ? (
          <p className="text-gray-400">No lifted bans found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-2 text-gray-300">ID</th>
                    <th className="pb-2 text-gray-300">Visitor ID</th>
                    <th className="pb-2 text-gray-300">Reason</th>
                    <th className="pb-2 text-gray-300">Lifted At</th>
                  </tr>
                </thead>
                <tbody>
                  {liftedBans.items.map((ban) => (
                    <tr key={ban.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">{ban.id}</td>
                      <td className="py-3 text-gray-300">
                        <Link href={`/admin/visitors/${ban.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {ban.visitor_id}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-300">
                        {ban.reason.length > 30 ? `${ban.reason.substring(0, 30)}...` : ban.reason}
                      </td>
                      <td className="py-3 text-gray-300">{formatDate(ban.lifted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {liftedBans.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, liftedBans.total)} of {liftedBans.total} results
                </div>
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=lifted_bans&page=${page - 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Previous
                    </Link>
                  )}
                  {page < liftedBans.pages && (
                    <Link
                      href={`/admin/security-personnel/${id}?tab=lifted_bans&page=${page + 1}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error loading lifted bans.</strong>
        <span className="block sm:inline"> {error instanceof Error ? error.message : "Unknown error occurred."}</span>
      </div>
    );
  }
}

// Add formatDate function if not already defined in this scope
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};