// src/app/admin/security-personnel/[id]/update-code.tsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSecurityCode } from "@/app/actions/auth";
import { Eye, EyeOff } from 'lucide-react';

export function UpdateCodeForm({ email }: { email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSecret, setShowSecret] = useState(false);
  const [newCode, setNewCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCode.trim()) {
      alert("Please enter a new secret code");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateSecurityCode({ email, new_code: newCode });
        
        if (result.success) {
          alert("Secret code updated successfully!");
          router.refresh();
        } else {
          alert(`Update failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Update error:", error);
        alert("An unexpected error occurred. Please check the console.");
      }
    });
  };
  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="newCode" className="block text-sm font-medium text-gray-300">
          New Secret Code
        </label>
        <div className="relative">
        <input
          type={showSecret ? "text" : "password"}
          id="newCode"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="w-full rounded-lg border h-8 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isPending}
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
      
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Updating...' : 'Update Secret Code'}
      </button>
    </form>
  );
}