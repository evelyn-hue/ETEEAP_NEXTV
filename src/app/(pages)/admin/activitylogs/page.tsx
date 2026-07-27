"use client";
import { ActivityLog } from "@/components/admin";
import AdminPage from "@/components/shared/AdminPage";

export default function ApplicationPage() {
  return (
    <AdminPage>
      <ActivityLog />
    </AdminPage>
  );
}