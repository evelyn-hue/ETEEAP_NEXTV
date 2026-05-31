"use client";

import { Admin, SideNav } from "@/components/admin";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <SideNav />
      </div>

      {/* Dashboard */}
      <div className="flex-1 overflow-hidden">
        <Admin />
      </div>

    </div>
  );
}