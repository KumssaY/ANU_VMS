// src/app/security/dashboard/page.tsx
import { requireSecurity } from "@/app/actions/auth";
import Link from "next/link";

export default async function SecurityDashboard() {
  await requireSecurity();
  
  return (
    <div className="ml-64 p-8">
      <h1 className="mb-6 text-3xl font-bold">Security Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Security Code</h2>
          <Link href="/security/update-code" 
                className={`flex items-center rounded-md px-4 py-2`}>
            <p className="text-gray-300">Manage your security access code</p>
          </Link>
        </div>
        {/* <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <p className="text-gray-300">View recent security events</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <p className="text-gray-300">Access frequently used functions</p>
        </div> */}
      </div>
    </div>
  );
}