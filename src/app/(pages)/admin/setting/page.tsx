"use client";

import { Setting, SideNav } from "@/components/admin";
import { Fetch_to } from "@/utilities";
import { useEffect } from "react";
import api_link from "@/config/api_link.json";
import { useRouter } from "next/navigation";

export default function ApplicationPage() {
  const router = useRouter();
  // const [showProfile, setShowProfile] = useState(false);
  // const [email, setEmail] = useState("");
  
    useEffect(() => {
      const Verify = async() => {
        const response = await Fetch_to(api_link.jwt.verify);
        
        if (!response.success) return router.push("/");
  
        if (response.success) {
          // const response_data = response.data.message.final_data.data[0];
          // setShowProfile(true);
          // setEmail(response_data.email);
          return;
        }
        // setShowProfile(false);
      };
      Verify();
    }, []);
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="md:w-64 shrink-0">
        <SideNav />
      </div>

      <div className="flex-1 overflow-hidden">
        <Setting />
      </div>

    </div>
  );
}