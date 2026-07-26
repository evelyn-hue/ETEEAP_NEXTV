"use client";
import { SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

export default function SideNavPage() {
  return (
    <PageTransition className="flex min-h-screen bg-surface-warm" style={{ backgroundImage: "var(--bg-interior)" } as React.CSSProperties}>
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>
    </PageTransition>
  );
}