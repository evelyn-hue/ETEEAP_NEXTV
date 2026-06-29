"use client";

import { Suspense, useEffect, useState } from "react";
import { ApplicationStatus } from "@/components/form";
import { Footer, Header } from "@/components/landpage";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";

function ApplicationStatusContent() {
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const Verify = async () => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (response.success) {
        const response_data = response.data.message.final_data.data[0];
        setShowProfile(true);
        setEmail(response_data.email);
        return;
      }
      setShowProfile(false);
    };
    Verify();
  }, []);

  return (
    <main>
      <Header showProfile={showProfile} email={email} />
      <ApplicationStatus />
      <Footer />
    </main>
  );
}

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ApplicationStatusContent />
    </Suspense>
  );
}
