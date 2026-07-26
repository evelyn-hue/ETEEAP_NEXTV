"use client";

import { Admin, SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

export default function AdminPage() {
  return (
    <PageTransition className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>

      {/* Dashboard */}
      <div className="flex-1 overflow-hidden">
        <Admin />
      </div>

    </PageTransition>
  );
}