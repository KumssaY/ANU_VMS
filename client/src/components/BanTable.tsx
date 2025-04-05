//src/components/BanTable.tsx
'use client';

import Link from 'next/link';

interface Ban {
  ban_id: number;
  visitor_id?: string;
  reason: string;
  issued_at: string;
  lifted_at: string | null;
  issued_by: {
    id: number;
    name: string;
  } | null;
  lifted_by: {
    id: number;
    name: string;
  } | null;
  visitor?: {
    id: string;
    name: string;
    is_banned: boolean;
    national_id: string;
    phone_number: string;
    uuid: string;
  };
}

interface BanTableProps {
  bans: Ban[];
  showVisitorInfo?: boolean;
}

export default function BanTable({ bans, showVisitorInfo = false }: BanTableProps) {
  console.log('BanTable received bans:', bans);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const banData = Array.isArray(bans) ? bans : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#222]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ban ID</th>
            {showVisitorInfo && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Visitor ID
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reason</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Banned By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Banned At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Unbanned By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Unbanned At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[#222] divide-y divide-gray-700">
          {banData.length > 0 ? (
            banData.map((ban) => (
              <tr key={ban.ban_id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{ban.ban_id}</td>
                {showVisitorInfo && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {ban.visitor?.id ? ban.visitor.id.slice(0, 8) + '...' : 'Unknown'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-white">{ban.reason || 'No reason provided'}</td>
                <td className="px-6 py-4 text-sm text-white">{ban.issued_by?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatDate(ban.issued_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ban.lifted_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ban.lifted_at ? 'Unbanned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white">{ban.lifted_by?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatDate(ban.lifted_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/bans/${ban.ban_id}`} 
                    className="text-[#f0b100] hover:text-[#e0a000] transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showVisitorInfo ? 9 : 8} className="px-6 py-4 text-center text-sm text-gray-400">
                No bans found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}