"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ApplyButtonProps = {
  href: string;
  programName: string;
  label?: string;
};

export default function ApplyButton({ href, programName, label = "Apply Now" }: ApplyButtonProps) {
  const router = useRouter();
  const { email, loading: authLoading, applicant_status } = useAuth();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!email) {
      setHasActiveApplication(false);
      setCheckingApplication(false);
      return;
    }

    const normalizedStatus = String(applicant_status || "").trim().toLowerCase();
    const blockedStatuses = ["submitted", "under review", "accepted", "approved", "pending", "in progress"];

    setHasActiveApplication(blockedStatuses.includes(normalizedStatus));
    setCheckingApplication(false);
  }, [authLoading, email, applicant_status]);

  return (
    <button
      type="button"
      className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform bg-white text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:scale-100 disabled:hover:bg-gray-300"
      disabled={checkingApplication || hasActiveApplication}
      title={
        hasActiveApplication
          ? `You already applied for ${programName}. You can apply again only after your application is rejected.`
          : undefined
      }
      onClick={() => {
        if (!email) {
          router.push(`/auth/signin?next=${encodeURIComponent(href)}`);
          return;
        }

        router.push(href);
      }}
    >
      {checkingApplication ? "Checking..." : hasActiveApplication ? "Applied" : label}
    </button>
  );
}