// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password });
      if (result.success) {
        // Redirect based on role
        if (result.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/security/dashboard");
        }
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Login</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-500 bg-opacity-20 p-3 text-red-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}