"use client";
import ForgotPasswordForm from "@/components/auth/forgot-password";
import InteriorPage from "@/components/shared/InteriorPage";

export default function ForgotPasswordPage() {
  return (
    <InteriorPage variant="auth" showFooter={false}>
      <ForgotPasswordForm />
    </InteriorPage>
  );
}