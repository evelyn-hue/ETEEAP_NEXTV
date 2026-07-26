"use client";
import { SignIn } from "@/components/auth";
import InteriorPage from "@/components/shared/InteriorPage";

export default function SignInPage() {
  return (
    <InteriorPage variant="auth" showFooter={false}>
      <SignIn />
    </InteriorPage>
  );
}