"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import PageTransition from "@/components/shared/PageTransition";
import { ApplicationStatus } from "@/components/form";

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PageTransition>
        <ApplicationStatus />
      </PageTransition>
    </Suspense>
  );
}