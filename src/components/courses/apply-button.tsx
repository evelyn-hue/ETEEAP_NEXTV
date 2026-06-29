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
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkApplicationStatus = async () => {
      if (authLoading) {
        return;
      }

      const blockedStatuses = ["submitted", "under review", "accepted", "approved", "pending", "in progress"];
      let currentEmail = email;
      let currentStatus = applicant_status;

      try {
        let response = await Fetch_to(api_link.jwt.verify);

        if (!response.success && typeof window !== "undefined") {
          const storedToken = localStorage.getItem("authToken");
          if (storedToken) {
            response = await Fetch_to(api_link.jwt.verify, {}, {
              Authorization: `Bearer ${storedToken}`,
            });
          }
        }

        if (response.success) {
          const userData = response.data?.message?.final_data?.data?.[0];
          currentEmail = userData?.email ?? currentEmail;
          currentStatus = userData?.applicant_status ?? currentStatus;
        }
      } catch (error) {
        console.error("Application status check failed:", error);
      }

      if (!isMounted) {
        return;
      }

      setVerifiedEmail(currentEmail);

      if (!currentEmail) {
        setHasActiveApplication(false);
        setCheckingApplication(false);
        return;
      }

      const normalizedStatus = String(currentStatus || "").trim().toLowerCase();
      setHasActiveApplication(blockedStatuses.includes(normalizedStatus));
      setCheckingApplication(false);
    };

    void checkApplicationStatus();

    return () => {
      isMounted = false;
    };
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
        if (!verifiedEmail) {
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
