"use client";
import { useEffect, useState } from "react";
import InteriorPage from "@/components/shared/InteriorPage";
import { ReviewApplication } from "@/components/form";
import { Fetch_to } from "@/utilities";
import api_link from "@/config/api_link.json";

export default function LandPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [isBusinessOwner, setIsBusinessOwner] = useState("No");

  useEffect(() => {
    const fetchExtra = async() => {
      const response = await Fetch_to(api_link.jwt.verify);
      if (response.success) {
        const d = response.data.message.final_data.data[0];
        setEmail(d.email);
        setFullName(d.fullName);
        setStatus(d.civil_status || d.status || "");
        setPhone(d.phone);
        setIsBusinessOwner(d.isBusinessOwner ?? "No");
      }
    };
    fetchExtra();
  }, []);

  return (
    <InteriorPage>
      <ReviewApplication fullname={fullName} phone={phone} status={status} email={email} isBusinessOwner={isBusinessOwner} />
    </InteriorPage>
  );
}
