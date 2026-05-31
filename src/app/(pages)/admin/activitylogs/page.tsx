"use client";

import { ActivityLog, SideNav } from "@/components/admin";

export default function ActivityLogPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <SideNav />
      </div>

      {/* Dashboard */}
      <div className="flex-1 overflow-hidden">
        <ActivityLog />
      </div>

    </div>
  );
}