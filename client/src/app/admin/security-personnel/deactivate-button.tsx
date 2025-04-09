// src/app/admin/security-personnel/deactivate-button.tsx
'use client';

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deactivateSecurityPersonnel, activateSecurityPersonnel } from "@/app/actions/auth";

export function DeactivateButton({ email, isActive }: { email: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const action = isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this security personnel?`)) return;
    
    startTransition(async () => {
      try {
        const result = isActive 
          ? await deactivateSecurityPersonnel(email)
          : await activateSecurityPersonnel(email);
        
        if (result.success) {
          router.refresh(); // Refresh the page to update status
        } else {
          alert(`${action} failed: ${result.message}`);
        }
      } catch (error) {
        console.error(`${action} error:`, error);
        alert("An unexpected error occurred. Please check the console.");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-4 py-2 rounded disabled:opacity-50 ${
        isActive 
          ? "bg-red-600 hover:bg-red-700 text-white" 
          : "bg-green-600 hover:bg-green-700 text-white"
      }`}
    >
      {isPending ? (
        `${isActive ? 'Deactivating...' : 'Activating...'}`
      ) : (
        isActive ? 'Deactivate' : 'Activate'
      )}
    </button>
  );
}