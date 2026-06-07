"use client";

import { ReviewApplication} from "@/components/form";
import {Footer, Header} from "@/components/landpage";
import { Fetch_to } from "@/utilities";
import { useEffect, useState } from "react";
import api_link from "@/config/api_link.json";

export default function LandPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const Verify = async() => {
      const response = await Fetch_to(api_link.jwt.verify);

      if (response.success) {
        const response_data = response.data.message.final_data.data[0];
        setShowProfile(true);
        setEmail(response_data.email);
        setFullName(response_data.fullName);
        setStatus(response_data.status);
        setPhone(response_data.phone);
        return;
      }
      setShowProfile(false);
    };
    Verify();
  }, []);

  return (
    <main> 
      <Header showProfile={showProfile} email={email} />
      <ReviewApplication fullname={fullName} phone={phone} status={status} email={email} />
      <Footer />
    </main>
  );
}