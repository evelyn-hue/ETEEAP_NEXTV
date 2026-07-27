"use client";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password";
import InteriorPage from "@/components/shared/InteriorPage";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InteriorPage variant="auth" showFooter={false}>
        <ResetPasswordForm />
      </InteriorPage>
    </Suspense>
  );
}