//src/app/page.tsx
"use client"; // Mark the component as client-side to use hooks like useRouter

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#3E3E3E] text-white">
      <h1 className="text-4xl mb-6 font-bold">Visitor Management System</h1>
      <button
        id="register-button"
        className="w-52 py-3 text-lg font-bold bg-yellow-500 text-black rounded-md mb-4 transition-all duration-300 ease-in-out hover:bg-yellow-400"
        onClick={() => router.push('/register')}
      >
        Register
      </button>
      <button
        className="w-52 py-3 text-lg font-bold bg-red-600 text-white rounded-md transition-all duration-300 ease-in-out hover:bg-red-500"
        onClick={() => router.push('/identify')}
      >
        Identify
      </button>
    </div>
  );
}
