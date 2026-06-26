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
  const { email, loading: authLoading } = useAuth();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasActiveAlumniApplication, setHasActiveAlumniApplication] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!email) {
        setCheckingApplication(false);
        return;
      }

      try {
        const response = await fetch(
          `/services/supabase/alumni_profiles/retrieve?email=${encodeURIComponent(email)}`
        );
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const activeApplication = result.data.some(
            (profile: { verification_status?: string }) =>
              String(profile.verification_status ?? "").toLowerCase() !== "rejected"
          );

          setHasActiveAlumniApplication(activeApplication);
        }
      } catch {
        setHasActiveAlumniApplication(false);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplicationStatus();
  }, [authLoading, email]);

  return (
    <button
      type="button"
      className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform bg-white text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:scale-100 disabled:hover:bg-gray-300"
      disabled={checkingApplication || hasActiveAlumniApplication}
      title={
        hasActiveAlumniApplication
          ? `You already have an alumni application in progress or approved for ${programName}. You can apply again only after it has been rejected.`
          : undefined
      }
      onClick={() => router.push(href)}
    >
      {hasActiveAlumniApplication ? "Applied" : label}
    </button>
  );
}