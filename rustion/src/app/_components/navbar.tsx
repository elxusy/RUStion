"use client";
import { PowerIcon } from "lucide-react";
import { signOut } from "next-auth/react";

export function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
      <span className="font-bold text-blue-400">DocsApp</span>
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition"
      >
        <PowerIcon className="w-5 h-5" />
        Sign Out
      </button>
    </nav>
  );
}