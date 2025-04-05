// src/app/admin/security-personnel/[id]/deactivate-button.tsx
'use client';

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deactivateSecurityPersonnel } from "@/app/actions/auth";

export function DeactivateButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this security personnel?")) return;
    
    startTransition(async () => {
      try {
        const result = await deactivateSecurityPersonnel(id);
        
        if (result.success) {
          // Redirect to personnel list after successful deactivation
          router.push("/admin/security-personnel");
          router.refresh();
        } else {
          alert(`Deactivation failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Deactivation error:", error);
        alert("An unexpected error occurred. Please check the console.");
      }
    });
  };

  return (
    <button
      onClick={handleDeactivate}
      disabled={isPending}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {isPending ? 'Deactivating...' : 'Deactivate'}
    </button>
  );
}