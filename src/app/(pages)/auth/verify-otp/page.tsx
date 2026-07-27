"use client";
import { Suspense } from "react";
import VerifyOtpForm from "@/components/auth/verify-otp";
import InteriorPage from "@/components/shared/InteriorPage";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InteriorPage variant="auth" showFooter={false}>
        <VerifyOtpForm />
      </InteriorPage>
    </Suspense>
  );
}