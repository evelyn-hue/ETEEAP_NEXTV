"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";

type ApplyButtonProps = {
  href: string;
  programName: string;
  label?: string;
};

export default function ApplyButton({ href, programName, label = "Apply Now" }: ApplyButtonProps) {
  const router = useRouter();
  const { email, loading: authLoading, applicant_status } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [isAlumni, setIsAlumni] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!email) {
      setHasActiveApplication(false);
      setIsAlumni(false);
      setChecking(false);
      return;
    }

    const normalizedStatus = String(applicant_status || "").trim().toLowerCase();
    const blockedStatuses = ["submitted", "under review", "accepted", "approved", "pending", "in progress"];
    setHasActiveApplication(blockedStatuses.includes(normalizedStatus));

    fetch("/services/supabase/alumni_profiles/retrieve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((data) => {
        const profiles = Array.isArray(data) ? data : (data.data || []);
        const hasActive = profiles.some(
          (p: { verification_status?: string }) => String(p.verification_status ?? "").toLowerCase() !== "rejected",
        );
        setIsAlumni(hasActive);
      })
      .catch(() => setIsAlumni(false))
      .finally(() => setChecking(false));
  }, [authLoading, email, applicant_status]);

  const isDisabled = checking || hasActiveApplication || isAlumni;

  return (
    <button
      type="button"
      className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform bg-white text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:scale-100 disabled:hover:bg-gray-300"
      disabled={isDisabled}
      title={
        hasActiveApplication
          ? `You already applied for ${programName}. You can apply again only after your application is rejected.`
          : isAlumni
            ? "You are already an alumni member."
            : undefined
      }
      onClick={() => {
        if (!verifiedEmail) {
          router.push(`/auth/signin?next=${encodeURIComponent(href)}`);
          return;
        }

        router.push(href);
      }}
    >
      {checking ? "Checking..." : hasActiveApplication ? "Applied" : isAlumni ? "Alumni" : label}
    </button>
  );
}
