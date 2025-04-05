import { requireAdmin } from "@/app/actions/auth";
import { getAllIncidents } from "@/app/actions/admin";
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

export default async function AdminIncidentsPage() {
  await requireAdmin();

  let incidents = [];
  try {
    const result = await getAllIncidents(1, 100);
    incidents = result.items;
  } catch (err) {
    console.error("Failed to fetch incidents:", err);
  }

  return (
    <div className="ml-64 p-8 bg-gray-500 h-175">
      <h1 className="mb-6 text-3xl font-bold text-white">All Incidents</h1>

      <div className="overflow-x-auto rounded-lg bg-gray-800 p-6 shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-sm text-gray-300">
              <th className="pb-2 min-w-[180px]">Visitor</th>
              <th className="pb-2">Phone</th>
              <th className="pb-2 min-w-[200px]">Description</th>
              <th className="pb-2">Visit Reason</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Recorded By</th>
              <th className="pb-2">Security Role</th>
              <th className="pb-2">Recorded At</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length > 0 ? (
              incidents.map((incident) => (
                <tr key={incident.id} className="border-b border-gray-700 text-gray-300 hover:bg-gray-750 transition-colors">
                  <td className="py-3">
                    <Link
                      href={`/admin/visitors/${incident.visitor.id}`}
                      className="text-blue-400 hover:underline flex items-center gap-2"
                    >
                      
                      {`${incident.visitor.first_name} ${incident.visitor.last_name}`}
                    </Link>
                  </td>
                  <td className="py-3">
                    <a 
                      href={`tel:${incident.visitor.phone_number}`}
                      className="text-blue-400 hover:underline"
                    >
                      {incident.visitor.phone_number}
                    </a>
                  </td>
                  <td className="py-3 max-w-[300px] whitespace-normal">
                    {incident.description}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/visits/${incident.visit.id}`}
                      className="text-blue-400 hover:underline"
                      title={incident.visit.reason}
                    >
                      {incident.visit.reason.substring(0, 30)}{incident.visit.reason.length > 30 && '...'}
                    </Link>
                  </td>
                  <td className="py-3">
                    {formatDuration(incident.visit.duration)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      incident.visit.status === 'active' ? 'bg-green-500' :
                      incident.visit.status === 'leave' ? 'bg-gray-500' :
                      'bg-yellow-500'
                    }`}>
                      {incident.visit.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/security-personnel/${incident.recorded_by.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {`${incident.recorded_by.first_name} ${incident.recorded_by.last_name}`}
                    </Link>
                  </td>
                  <td className="py-3">
                    <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                      {incident.recorded_by.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-400 text-sm">
                      {formatDate(incident.recorded_at)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-6 text-center text-gray-400">
                  No incidents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}