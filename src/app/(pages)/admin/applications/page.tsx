"use client";

import AdminApplications from "@/components/admin/applications";
import { SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

export default function AdminApplicationsPage() {
  return (
    <PageTransition className="flex min-h-screen bg-gray-100">
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>
      <div className="flex-1 overflow-hidden">
        <AdminApplications />
      </div>
    </PageTransition>
  );
}
