"use client";

import PageTransition from "@/components/shared/PageTransition";
import ProgramDetails from "@/components/form/programdetails";
import {Footer, Header} from "@/components/landpage";
import { Fetch_to } from "@/utilities";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import api_link from "@/config/api_link.json";

function LandContent() {
  const [showProfile, setShowProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isBusinessOwner, setIsBusinessOwner] = useState("No");
  const searchParams = useSearchParams();
  const params = searchParams.get('program');
  const [status, setStatus] = useState(true);

  useEffect(() => {
    const Verify = async() => {
      const response = await Fetch_to(api_link.jwt.verify);

      if (response.success) {
        const response_data = response.data.message.final_data.data[0];
        setShowProfile(true);
        setEmail(response_data.email);
        setFullName(response_data.fullName ?? "");
        setIsBusinessOwner(response_data.isBusinessOwner ?? "No");
        setStatus(response_data.civil_status === "Married");
        return;
      }
      setShowProfile(false);
    };
    Verify();
  }, []);

  return (
    <PageTransition> 
      <Header showProfile={showProfile} email={email} />
      <ProgramDetails
        programName={`${params}`}
        applicantName={fullName}
        email={email}
        statusMarital={status}
        isBusinessOwner={isBusinessOwner}
      />
      <Footer />
    </PageTransition>
  );

}

export default function LandPage() {
    return (
        <Suspense fallback={null}>
            <LandContent />
        </Suspense>
    );
}
