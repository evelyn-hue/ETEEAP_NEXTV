"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";
import { SideNav } from "@/components/admin";
import PageTransition from "@/components/shared/PageTransition";

type Props = { children: ReactNode };

export default function AdminPage({ children }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (!response.success) {
        router.push("/auth/signin?next=/admin");
        return;
      }
      const user = response.data?.message?.final_data?.data?.[0];
      const isAdmin =
        user?.role === "admin" ||
        String(user?.email ?? "").toLowerCase() === "admin@admin.com";

      if (!isAdmin) {
        router.push("/");
        return;
      }
      setAuthorized(true);
    };
    void verify();
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-warm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
