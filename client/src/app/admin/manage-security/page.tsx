// src/app/admin/manage-security/page.tsx
"use client";
import { useState, useEffect } from "react";
import { deactivateSecurityPersonnel } from "@/app/actions/auth";

// Mock data for security personnel (in a real app, this would come from an API)
interface SecurityPersonnel {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  national_id: string;
  status: "active" | "inactive";
}

// In a real application, you would fetch this data from your API
const mockSecurityPersonnel: SecurityPersonnel[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone_number: "1234567890",
    national_id: "ID12345",
    status: "active",
  },
  {
    id: "2",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    phone_number: "0987654321",
    national_id: "ID67890",
    status: "active",
  },
];

export default function ManageSecurityPage() {
  const [securityPersonnel, setSecurityPersonnel] = useState<SecurityPersonnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deactivatingEmail, setDeactivatingEmail] = useState<string | null>(null);

  // In a real app, you would fetch data from your API here
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setSecurityPersonnel(mockSecurityPersonnel);
      setLoading(false);
    }, 500);
  }, []);

  const handleDeactivate = async (email: string) => {
    setError("");
    setSuccess("");
    setDeactivatingEmail(email);

    try {
      const result = await deactivateSecurityPersonnel(email);

      if (result.success) {
        setSuccess(result.message);
        // Update local state to reflect the change
        setSecurityPersonnel(prev =>
          prev.map(person =>
            person.email === email ? { ...person, status: "inactive" as const } : person
          )
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setDeactivatingEmail(null);
    }
  };

  return (
    <div className="ml-64 p-8 bg-gray-500">
      <h1 className="mb-6 text-3xl font-bold">Manage Security Personnel</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-500 bg-opacity-20 p-3 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-500 bg-opacity-20 p-3 text-green-300">
          {success}
        </div>
      )}

      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
      {loading ? (
          <div className="py-4 text-center">Loading security personnel data...</div>
        ) : securityPersonnel.length === 0 ? (
          <div className="py-4 text-center">No security personnel found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">National ID</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {securityPersonnel.map((person) => (
                  <tr key={person.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">
                      {person.first_name} {person.last_name}
                    </td>
                    <td className="px-4 py-2">{person.email}</td>
                    <td className="px-4 py-2">{person.phone_number}</td>
                    <td className="px-4 py-2">{person.national_id}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          person.status === "active"
                            ? "bg-green-500 bg-opacity-20 text-green-300"
                            : "bg-red-500 bg-opacity-20 text-red-300"
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {person.status === "active" && (
                        <button
                          onClick={() => handleDeactivate(person.email)}
                          disabled={deactivatingEmail === person.email}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deactivatingEmail === person.email 
                            ? 'Deactivating...' 
                            : 'Deactivate'}
                        </button>
                      )}
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
}