import { requireAdmin } from "@/app/actions/auth";
import { getAllBans } from "@/app/actions/admin";
import { Ban, SecurityPersonnel, Visitor } from "@/app/actions/admin";
import Link from "next/link";

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleString("en-US", { 
    dateStyle: "medium", 
    timeStyle: "short" 
  }) : "N/A";

const UserCard = ({ 
  user, 
  type 
}: { 
  user: SecurityPersonnel | Visitor | null; 
  type: 'security' | 'visitor' 
}) => (
  <div className="flex items-center space-x-3 p-2  rounded-lg">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">
        {user ? `${user.first_name} ${user.last_name}` : 'Unknown'}
      </p>
      <p className="text-xs text-gray-400 truncate">
        {type === 'security' ? (user as SecurityPersonnel)?.email : (user as Visitor)?.phone_number}
      </p>
    </div>
  </div>
);

export default async function AdminBansPage() {
  await requireAdmin();

  let bans: Ban[] = [];
  let total = 0;
  try {
    const result = await getAllBans(1, 100);
    bans = result.items;
    total = result.total;
  } catch (err) {
    console.error("Failed to fetch bans:", err);
  }

  return (
    <div className="ml-64 p-8 bg-gray-500 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          Bans Management <span className="text-gray-300">({total} total)</span>
        </h1>
      </div>

      <div className="rounded-lg bg-gray-800 p-6 shadow-xl overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-gray-300 border-b border-gray-700">
              <th className="pb-4 w-24 text-left">ID</th>
              <th className="pb-4 w-48 text-left">Visitor</th>
              <th className="pb-4  text-left">Reason</th>
              <th className="pb-4 w-48 text-left">Issued By</th>
              <th className="pb-4 w-48 text-left">Lifted By</th>
              <th className="pb-4 w-40 text-left">Issued At</th>
              <th className="pb-4 w-40 text-left">Lifted At</th>
              <th className="pb-4 w-28 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bans.length > 0 ? bans.map((ban) => (
              <tr 
                key={ban.id} 
                className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
              >
                <td className="py-4 text-gray-300">#{ban.id}</td>
                
                <td className="py-4">
                  <UserCard user={ban.visitor} type="visitor" />
                </td>
                
                <td className="py-4 text-gray-300 pr-4">
                  <div className="max-w-md">
                    {ban.reason}
                    {ban.visit && (
                      <div className="text-xs mt-1 text-gray-400">
                        Related to visit: #{ban.visit.id}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="py-4">
                  <UserCard user={ban.issued_by} type="security" />
                </td>
                
                <td className="py-4">
                  {ban.lifted_by ? (
                    <UserCard user={ban.lifted_by} type="security" />
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>
                
                <td className="py-4 text-gray-300">{formatDate(ban.issued_at)}</td>
                
                <td className="py-4 text-gray-300">
                  {ban.lifted_at ? formatDate(ban.lifted_at) : 'N/A'}
                </td>
                
                <td className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      ban.is_active 
                        ? 'bg-red-600/30 text-red-400'
                        : 'bg-green-600/30 text-green-400'
                    }`}>
                      {ban.is_active ? 'Active' : 'Lifted'}
                    </span>
                    {!ban.is_active && ban.lifted_at && (
                      <span className="text-xs text-gray-400">
                        {formatDate(ban.lifted_at)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">
                  No bans found in the system
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {bans.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-gray-400 text-sm">
            <div>Showing {bans.length} of {total} bans</div>
            <div className="space-x-4">
              <button className="hover:text-gray-300 disabled:text-gray-600">
                Previous
              </button>
              <button className="hover:text-gray-300 disabled:text-gray-600">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}