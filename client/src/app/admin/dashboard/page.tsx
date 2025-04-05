//src/app/admin/dashboard/page.tsx
import { requireAdmin, getUserRole } from "@/app/actions/auth";
import { getDashboardSummary } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminDashboard() {
  // Server component to check if user is admin
  await requireAdmin();
  
  // Fetch dashboard summary data with error handling
  let dashboardData;
  let error = null;
  
  try {
    dashboardData = await getDashboardSummary();
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    error = err instanceof Error ? err.message : "Failed to load dashboard data";
    
    // Provide default values when data fetch fails
    dashboardData = {
      total_visitors: 0,
      active_visits: 0,
      visits_today: 0,
      incidents_today: 0,
      active_bans: 0,
      security_personnel_count: 0,
      total_visits: 0,
      total_incidents: 0,
      total_bans: 0,
      recent_visits: [],
      recent_incidents: [],
      recent_bans: [],
      frequent_visitors: []
    };
  }
  
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

  return (
    <div className="ml-64 p-8 bg-gray-500">
      <h1 className="mb-6 text-3xl font-bold text-white">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">Error loading dashboard data</h2>
          <p>{error}</p>
        </div>
      )}
      
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-white">Visitors</h2>
          <p className="text-3xl font-bold text-white">{dashboardData.total_visitors}</p>
          <p className="text-gray-300">Total registered visitors</p>
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-white">Active Visits</h2>
          <p className="text-3xl font-bold text-white">{dashboardData.active_visits}</p>
          <p className="text-gray-300">Currently on campus</p>
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-white">Today's Visits</h2>
          <p className="text-3xl font-bold text-white">{dashboardData.visits_today}</p>
          <p className="text-gray-300">Visits recorded today</p>
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-white">Incidents Today</h2>
          <p className="text-3xl font-bold text-white">{dashboardData.incidents_today}</p>
          <p className="text-gray-300">Incidents recorded today</p>
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-white">Active Bans</h2>
          <p className="text-3xl font-bold text-white">{dashboardData.active_bans}</p>
          <p className="text-gray-300">Currently banned visitors</p>
        </div>
        
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-white">Security Personnel</h2>
          <p className="text-3xl font-bold text-white">{dashboardData.security_personnel_count}</p>
          <p className="text-gray-300">Active security staff</p>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Visits */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Visits</h2>
            <Link href="/admin/visits" className="text-blue-400 hover:text-blue-300 text-sm">
              View All ({dashboardData.total_visits})
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-300 text-left border-b border-gray-700">
                  <th className="pb-2">Visitor</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">Visit Time</th>
                  <th className="pb-2">Leave Time</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_visits && dashboardData.recent_visits.length > 0 ? (
                  dashboardData.recent_visits.map((visit) => (
                    <tr key={visit.id} className="border-b border-gray-700 text-gray-300">
                      <td className="py-3">
                        <Link href={`/admin/visitors/${visit.visitor_id}`} className="text-blue-400 hover:text-blue-300">
                          {visit.visitor_name}
                        </Link>
                      </td>
                      <td className="py-3">{visit.reason}</td>
                      <td className="py-3">{formatDate(visit.visit_time)}</td>
                      <td className="py-3">{visit.leave_time ? formatDate(visit.leave_time) : 'Active'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-400 text-center">No recent visits</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Incidents */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Incidents</h2>
            <Link href="/admin/incidents" className="text-blue-400 hover:text-blue-300 text-sm">
              View All ({dashboardData.total_incidents})
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-300 text-left border-b border-gray-700">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Visit ID</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_incidents && dashboardData.recent_incidents.length > 0 ? (
                  dashboardData.recent_incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-700 text-gray-300">
                      <td className="py-3">{incident.id}</td>
                      <td className="py-3">
                        <Link href={`/admin/visits/${incident.visit_id}`} className="text-blue-400 hover:text-blue-300">
                          {incident.visit_id}
                        </Link>
                      </td>
                      <td className="py-3">{incident.description.length > 30 ? `${incident.description.substring(0, 30)}...` : incident.description}</td>
                      <td className="py-3">{formatDate(incident.recorded_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-400 text-center">No recent incidents</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Bans */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Bans</h2>
            <Link href="/admin/bans" className="text-blue-400 hover:text-blue-300 text-sm">
              View All ({dashboardData.total_bans})
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-300 text-left border-b border-gray-700">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">Issued At</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_bans && dashboardData.recent_bans.length > 0 ? (
                  dashboardData.recent_bans.map((ban) => (
                    <tr key={ban.id} className="border-b border-gray-700 text-gray-300">
                      <td className="py-3">{ban.id}</td>
                      <td className="py-3">{ban.reason.length > 30 ? `${ban.reason.substring(0, 30)}...` : ban.reason}</td>
                      <td className="py-3">{formatDate(ban.issued_at)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${ban.is_active ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                          {ban.is_active ? 'Active' : 'Lifted'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-400 text-center">No recent bans</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Frequent Visitors */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Frequent Visitors</h2>
            <Link href="/admin/visitors" className="text-blue-400 hover:text-blue-300 text-sm">
              View All Visitors
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-300 text-left border-b border-gray-700">
                  <th className="pb-2">Visitor</th>
                  <th className="pb-2">Visit Count</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.frequent_visitors && dashboardData.frequent_visitors.length > 0 ? (
                  dashboardData.frequent_visitors.map((visitor) => (
                    <tr key={visitor.id} className="border-b border-gray-700 text-gray-300">
                      <td className="py-3">
                        <Link href={`/admin/visitors/${visitor.id}`} className="text-blue-400 hover:text-blue-300">
                          {visitor.full_name}
                        </Link>
                      </td>
                      <td className="py-3">{visitor.visit_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-4 text-gray-400 text-center">No frequent visitors data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}