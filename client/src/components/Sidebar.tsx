// src/components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUserRole, logout } from "@/app/actions/auth";
import { X, Menu } from "lucide-react";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get user role from cookies
        const userRole = await getUserRole();
        
        // Update state
        setRole(userRole);
        setIsAuthenticated(userRole !== null);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  // Add this useEffect to toggle the body class when sidebar opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function already handles redirect
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Determine if we're in the admin or security section
  const isAdminOrSecurity = pathname.startsWith('/admin') || pathname.startsWith('/security');

  // For admin/security pages, use the authenticated sidebar
  if (isAdminOrSecurity) {
    // Don't show sidebar on login page or when loading
    if (pathname === "/login" || isLoading || !isAuthenticated) {
      return null;
    }

    return (
      <aside className="fixed left-0 top-0 z-20 h-full w-64 bg-gray-900 text-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-bold">Security System</h1>
        </div>
        
        <nav className="mt-6 px-4">
          {/* Common links for all authenticated users */}
          <div className="mb-6">
            <Link href={role === "admin" ? "/admin/dashboard" : "/security/dashboard"} 
                  className={`mb-2 flex items-center rounded-md px-4 py-2 ${pathname.includes('/dashboard') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
              <span>Dashboard</span>
            </Link>
          </div>
          
          {/* Admin-specific links */}
          {role === "admin" && (
            <div className="mb-6 space-y-1">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase text-gray-400">User Management</h2>
              <Link href="/admin/register-admin" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/register-admin' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Register Admin</span>
              </Link>
              <Link href="/admin/security-personnel" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/security-personnel' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Security Personnel</span>
              </Link>
              
              <h2 className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-gray-400">Visitor Management</h2>
              <Link href="/admin/visitors" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/visitors' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>All Visitors</span>
              </Link>
              <Link href="/admin/visits" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/visits' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Visit Records</span>
              </Link>
              
              <h2 className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-gray-400">Security Management</h2>
              <Link href="/admin/incidents" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/incidents' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Incidents</span>
              </Link>
              <Link href="/admin/bans" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/bans' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Visitor Bans</span>
              </Link>
              
              <h2 className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-gray-400">Reports</h2>
              <Link href="/admin/reports" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/admin/reports' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Generate Reports</span>
              </Link>
            </div>
          )}
          
          {/* Security-specific links */}
          {role === "security" && (
            <div className="mb-6 space-y-1 ">
              {/* Security navigation links would go here */}
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase text-gray-400">Security code managment</h2>
              <Link href="/security/update-code" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/security/update-code' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Update Security Code</span>
              </Link>
              {/* <Link href="/security/visits" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/security/visits' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Visit Records</span>
              </Link>
              
              <h2 className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-gray-400">Security Tasks</h2>
              <Link href="/security/incidents" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/security/incidents' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Report Incident</span>
              </Link>
              <Link href="/security/bans" 
                    className={`flex items-center rounded-md px-4 py-2 ${pathname === '/security/bans' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <span>Check Ban Status</span>
              </Link> */}
            </div>
          )}
        </nav>
        
        <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
    );
  }

  // For public pages, use the normal sidebar with hamburger menu
  return (
    <>
      {/* Hamburger Icon */}
      <button
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-[#222] text-yellow-400"
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm sidebar-overlay z-15"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#222] shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-md text-yellow-400"
          onClick={() => setIsOpen(false)}
        >
          <X />
        </button>

        {/* Navigation Links */}
        <nav className="mt-16 px-4">
          <ul className="space-y-4">
            {[
              { label: "Home", path: "/" },
              { label: "Register", path: "/register" },
              { label: "Identify", path: "/identify" },
              { label: "Incidents", path: "/incidents" },
            ].map((item, index) => (
              <li key={index}>
                <button
                  className="w-full text-left py-2 px-4 rounded-md hover:bg-[#2a2a2a] text-gray-200"
                  onClick={() => {
                    router.push(item.path);
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Login Button */}
        <div className="absolute bottom-0 w-full p-4">
          <button
            className="w-full rounded-md bg-yellow-500 px-4 py-2 font-medium text-black transition hover:bg-yellow-600"
            onClick={() => {
              router.push("/login");
              setIsOpen(false);
            }}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}