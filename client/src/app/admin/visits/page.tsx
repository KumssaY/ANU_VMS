import { requireAdmin } from "@/app/actions/auth";
import { getAllVisits, type Visit } from "@/app/actions/admin";
import Link from "next/link";

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleString("en-US", { 
    dateStyle: "medium", 
    timeStyle: "short" 
  }) : "N/A";

const formatDuration = (duration?: string) => {
  if (!duration) return 'N/A';
  const [days, time] = duration.includes('day') 
    ? duration.split(', ') 
    : ['0', duration];
  
  const daysText = days !== '0' ? `${days.replace(' day', 'd')} ` : '';
  return `${daysText}${time.split('.')[0]}`;
};

export default async function AdminVisitsPage() {
  await requireAdmin();

  let visits: Visit[] = [];
  try {
    const result = await getAllVisits(1);
    visits = result.items || [];
  } catch (err) {
    console.error("Failed to fetch visits:", err);
  }

  return (
    <div className="ml-64 p-8 bg-gray-500 h-175">
      <h1 className="mb-6 text-3xl font-bold text-white">All Visits</h1>

      <div className="rounded-lg bg-gray-800 p-6 shadow-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-300 text-left border-b border-gray-700">
              <th className="pb-2">Visitor</th>
              <th className="pb-2">Reason</th>
              <th className="pb-2">Visit Time</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Approved By</th>
              <th className="pb-2">Incidents</th>
              <th className="pb-2">Bans</th>
            </tr>
          </thead>
          <tbody>
            {visits.length > 0 ? (
              visits.map((visit) => (
                <tr key={visit.id} className="border-b border-gray-700 text-gray-300">
                  <td className="py-3">
                    <Link
                      href={`/admin/visitors/${visit.visitor.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {`${visit.visitor.first_name} ${visit.visitor.last_name}`}
                    </Link>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/visits/${visit.id}`}
                      className="text-blue-400 hover:underline"
                      title={visit.reason}
                    >
                      {visit.reason.substring(0, 30)}{visit.reason.length > 30 && '...'}
                    </Link>
                  </td>
                  <td className="py-3">{formatDate(visit.visit_time)}</td>
                  <td className="py-3">{formatDuration(visit.duration)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded ${
                      visit.status === 'active' ? 'bg-green-500' : 
                      visit.status === 'leave' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {`${visit.approved_by.first_name} ${visit.approved_by.last_name}`}
                  </td>
                  <td className="py-3">
                    {visit.incidents.length > 0 ? (
                      <Link 
                        href={`/admin/incidents?visit_id=${visit.id}`}
                        className="text-red-400 hover:text-red-300"
                      >
                        {visit.incidents.length} incident(s)
                      </Link>
                    ) : 'None'}
                  </td>
                  <td className="py-3">
                    {visit.bans.length > 0 ? (
                      <Link
                        href={`/admin/bans?visitor_id=${visit.visitor.id}`}
                        className="text-orange-400 hover:text-orange-300"
                      >
                        {visit.bans.length} ban(s)
                      </Link>
                    ) : 'None'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-400">
                  No visits found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}