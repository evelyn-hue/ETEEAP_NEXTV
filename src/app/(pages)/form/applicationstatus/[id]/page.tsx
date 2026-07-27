"use client";
import { Suspense } from "react";
import InteriorPage from "@/components/shared/InteriorPage";
import { ApplicationStatus } from "@/components/form";

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InteriorPage>
        <ApplicationStatus />
      </InteriorPage>
    </Suspense>
  );
}
