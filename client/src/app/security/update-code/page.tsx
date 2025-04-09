// src/app/security/update-code/page.tsx
"use client";
import { useState, useEffect } from "react";
import { updateSecurityCode, getCurrentUserEmail } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from 'lucide-react';


export default function UpdateSecurityCodePage() {
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const email = await getCurrentUserEmail();
        if (!email) {
          router.push("/login");
          return;
        }
        setUserEmail(email);
      } catch (error) {
        console.error("Error fetching user email:", error);
        router.push("/login");
      }
    };

    fetchEmail();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!userEmail) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    if (newCode !== confirmCode) {
      setError("New codes do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await updateSecurityCode({
        email: userEmail,
        new_code: newCode
      });

      if (result.success) {
        setSuccess(result.message);
        setCurrentCode("");
        setNewCode("");
        setConfirmCode("");
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

  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  return (
    <div className="ml-64 p-8">
      <h1 className="mb-6 text-3xl font-bold">Update Security Code</h1>

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

      <div className="rounded-lg bg-gray-800 p-6 shadow-md max-w-md">
        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="mb-4">
            <label htmlFor="current_code" className="mb-2 block text-sm font-medium">
              Current Security Code
            </label>
            <div className="relative">
            <input
              id="current_code"
              type={showSecret ? "text" : "password"}
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            />
            <button
          type="button"
          onClick={toggleSecretVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
        >
          {showSecret ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
          </div>

          <div className="mb-4">
            <label htmlFor="new_code" className="mb-2 block text-sm font-medium">
              New Security Code
            </label>
            <div className="relative">

            <input
              id="new_code"
              type={showSecret ? "text" : "password"}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            />
            <button
          type="button"
          onClick={toggleSecretVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
        >
          {showSecret ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirm_code" className="mb-2 block text-sm font-medium">
              Confirm New Code
            </label>
            <input
              id="confirm_code"
              type="password"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !userEmail}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Security Code"}
          </button>
        </form>
      </div>
    </div>
  );
}