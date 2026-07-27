"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";
import { SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

type Props = { children: ReactNode };

export default function AdminPage({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (!response.success) router.push("/");
    };
    verify();
  }, [router]);

  return (
    <PageTransition className="flex min-h-screen bg-surface-warm" style={{ backgroundImage: "var(--bg-interior)" }}>
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </PageTransition>
  );
}
