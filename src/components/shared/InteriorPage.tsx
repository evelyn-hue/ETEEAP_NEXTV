"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";
import { Header, Footer } from "@/components/landpage";
import PageTransition from "@/components/shared/PageTransition";
import { usePathname } from "next/navigation";

type Props = { children: ReactNode; variant?: "public" | "auth"; showFooter?: boolean };

export default function InteriorPage({ children, variant = "public", showFooter = true }: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const isSigninOrSignup = pathname === "/auth/signin" || pathname === "/auth/signup";

  useEffect(() => {
    const verify = async () => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (response.success) {
        const data = response.data.message.final_data.data[0];
        setShowProfile(true);
        setEmail(data.email);
      } else {
        setShowProfile(false);
      }
    };
    verify();
  }, []);

  return (
    <PageTransition>
      {variant === "public" ? (
        <div className="min-h-screen bg-surface-warm" style={{ backgroundImage: "var(--bg-interior)" }}>
          <Header showProfile={showProfile} email={email} />
          {children}
          {showFooter && <Footer />}
        </div>
      ) : (
        <>
          {isSigninOrSignup && <Header showProfile={showProfile} email={email} />}
          {children}
        </>
      )}
    </PageTransition>
  );
}
