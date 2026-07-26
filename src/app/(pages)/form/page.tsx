"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InteriorPage from "@/components/shared/InteriorPage";
import ProgramDetails from "@/components/form/programdetails";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";

function LandContent() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isBusinessOwner, setIsBusinessOwner] = useState("No");
  const [status, setStatus] = useState(true);
  const searchParams = useSearchParams();
  const params = searchParams.get('program');

  useEffect(() => {
    const fetchData = async() => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (response.success) {
        const d = response.data.message.final_data.data[0];
        setEmail(d.email);
        setFullName(d.fullName ?? "");
        setIsBusinessOwner(d.isBusinessOwner ?? "No");
        setStatus(d.civil_status === "Married");
      }
    };
    fetchData();
  }, []);

  return (
    <InteriorPage>
      <ProgramDetails
        programName={`${params}`}
        applicantName={fullName}
        email={email}
        statusMarital={status}
        isBusinessOwner={isBusinessOwner}
      />
    </InteriorPage>
  );
}

export default function LandPage() {
  return (
    <Suspense fallback={null}>
      <LandContent />
    </Suspense>
  );
}
