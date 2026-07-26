"use client";

import { SignIn } from "@/components/auth";
import {Header} from "@/components/landpage";
import { Fetch_to } from "@/utilities";
import { useEffect, useState } from "react";
import api_link from "@/config/api_link.json";
import PageTransition from "@/components/shared/PageTransition";

export default function LandPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const Verify = async() => {
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
    <PageTransition> 
      <Header showProfile={showProfile} email={email} />
      <SignIn />
    </PageTransition>
  );
}