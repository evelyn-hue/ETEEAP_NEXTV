"use client";
import { SignUp } from "@/components/auth";
import InteriorPage from "@/components/shared/InteriorPage";

export default function SignUpPage() {
  return (
    <InteriorPage variant="auth" showFooter={false}>
      <SignUp />
    </InteriorPage>
  );
}