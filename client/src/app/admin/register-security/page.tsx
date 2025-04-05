// src/app/admin/register-security/page.tsx
"use client";
import { useState } from "react";
import { registerSecurityPersonnel } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function RegisterSecurityPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    national_id: "",
    secret_code: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Password match validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Omit confirm_password from the data sent to API
      const { confirm_password, ...securityData } = formData;
      const result = await registerSecurityPersonnel(securityData);

      if (result.success) {
        setSuccess(result.message);
        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          password: "",
          confirm_password: "",
          national_id: "",
          secret_code: "",
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 p-8 bg-gray-500 h-175">
      <h1 className="mb-6 text-3xl font-bold">Register Security Personnel</h1>

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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-2 block text-sm font-medium">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="last_name" className="mb-2 block text-sm font-medium">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="national_id" className="mb-2 block text-sm font-medium">
                National ID
              </label>
              <input
                id="national_id"
                name="national_id"
                type="text"
                value={formData.national_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="secret_code" className="mb-2 block text-sm font-medium">
                Secret Code
              </label>
              <input
                id="secret_code"
                name="secret_code"
                type="text"
                value={formData.secret_code}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Security Personnel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}