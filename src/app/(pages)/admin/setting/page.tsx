"use client";

import { Setting, SideNav } from "@/components/admin";

export default function SettingPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <SideNav />
      </div>

      <div className="flex-1 overflow-hidden">
        <Setting />
      </div>

    </div>
  );
}