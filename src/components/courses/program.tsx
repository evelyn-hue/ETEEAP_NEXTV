"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import imgSrc from "@/config/img_src.json";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

// Map programs to their images from config
const programImages: { [key: string]: string } = {
  "Bachelor of Arts in English Language Studies": imgSrc.art || "/arts.png",
  "Bachelor of Science in Business Administration - Human Resource Management":
    imgSrc.hrm || "/hrm.png",
  "Bachelor of Science in Business Administration - Marketing Management":
    imgSrc.mm || "/mm.png",
  "Bachelor of Science in Hospitality Management": imgSrc.hm || "/hm.png",
};

const programs = [
  {
    name: "Bachelor of Arts in English Language Studies",
    description:
      "The Bachelor of Arts in English Language Studies is a comprehensive program designed to develop advanced proficiency in the English language while fostering critical thinking, effective communication, and cultural awareness. Students will explore the intricacies of linguistics, literature, and language pedagogy, gaining a deep understanding of how language shapes thought, culture, and society.",
    link: "/courses/BAELS",
    apply: "/form?program=Bachelor of Arts in English Language Studies"
  },
  {
    name: "Bachelor of Science in Business Administration - Human Resource Management",
    description:
      "The Bachelor of Science in Business Administration with a specialization in Human Resource Management prepares students to become strategic leaders in workforce development and organizational success. This program delves into the core principles of human capital management, covering essential areas such as recruitment, employee relations, performance management, and workplace diversity.",
    link: "courses/BSBA-HRM",
    apply: "/form?program=Bachelor of Science in Business Administration - Human Resource Management"
  },
  {
    name: "Bachelor of Science in Business Administration - Marketing Management",
    description:
      "The Bachelor of Science in Business Administration with a focus on Marketing Management equips students with the strategic acumen and creative skills needed to thrive in the fast-paced world of marketing and brand management. This program covers fundamental marketing principles, including market research, consumer behavior, branding, and digital marketing strategies.",
    link: "courses/BSBA-HRM",
    apply: "/form?program=Bachelor of Science in Business Administration - Marketing Management"
  },
  {
    name: "Bachelor of Science in Hospitality Management",
    description:
      "The Bachelor of Science in Hospitality Management offers a dynamic education tailored for those passionate about creating exceptional guest experiences in the tourism and hospitality industry. This program provides a comprehensive understanding of hotel operations, restaurant management, event planning, and tourism development.",
    link: "courses/BSBA-HRM",
    apply: "/form?program=Bachelor of Science in Hospitality Management"
  },
];

const staff = [
  {
    name: "Renell L. Bruma, MBA-HRM, CHRA",
    image: imgSrc.bruma || "/bruma.jpg",
  },
  {
    name: "Ellen Glice Sesante",
    image: imgSrc.ellen || "/ellen.jpg",
  },
];

export default function Program() {
  const router = useRouter();
  const { email, loading: authLoading } = useAuth();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasActiveAlumniApplication, setHasActiveAlumniApplication] =
    useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!email) {
        setCheckingApplication(false);
        return;
      }

      try {
        const response = await fetch(
          `/services/supabase/alumni_profiles/retrieve?email=${encodeURIComponent(email)}`
        );
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const activeApplication = result.data.some(
            (profile: { verification_status?: string }) =>
              String(profile.verification_status ?? "").toLowerCase() !== "rejected"
          );

          setHasActiveAlumniApplication(activeApplication);
        }
      } catch {
        setHasActiveAlumniApplication(false);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplicationStatus();
  }, [authLoading, email]);
  

  return (
    <main className="max-w-7xl mx-auto px-6 py-20 mt-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-blue-800">
        Program Offerings
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        {programs.map((program, index) => (
          <div
            key={index}
            className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-96 flex flex-col"
          >
            {/* Program Image */}
            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
              <Image
                src={
                  programImages[program.name as keyof typeof programImages] ||
                  programImages["Bachelor of Arts in English Language Studies"]
                }
                alt={program.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Content Section with Background */}
            <div
              className="flex-1 p-6 flex flex-col justify-between relative"
              style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:rgb(59,130,246);stop-opacity:0.6" /><stop offset="100%25" style="stop-color:rgb(37,99,235);stop-opacity:0.6" /></linearGradient></defs><rect width="400" height="300" fill="url(%23grad)"/></svg>')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>

              {/* Text Content */}
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2 text-white">
                  {program.name}
                </h2>
                <p className="text-gray-100 text-sm line-clamp-2">
                  {program.description}
                </p>
              </div>

              {/* Buttons */}
              <div className="relative z-10 flex gap-2">
                <button
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/50 hover:scale-105 cursor-pointer"
                  onClick={() => {router.push(`${program.link}`);}}
                >
                  Learn More
                </button>
                <button
                  className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-green-500/50 hover:scale-105 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:bg-gray-400"
                  disabled={checkingApplication || hasActiveAlumniApplication}
                  title={
                    hasActiveAlumniApplication
                      ? "You already have an alumni application in progress or approved. You can apply again only after it has been rejected."
                      : undefined
                  }
                  onClick={() => {router.push(`${program.apply}`);}}
                >
                  {hasActiveAlumniApplication ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coordinators */}
      <h2 className="text-3xl font-bold text-center mt-12 mb-8 text-blue-800">
        Coordinators
      </h2>
      <div className="flex flex-col md:flex-row justify-center gap-12 mt-4">
        {staff.map((member, index) => (
          <div
            key={index}
            className="flex flex-col items-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <Image
              src={member.image}
              alt={member.name}
              width={96}
              height={96}
              className="rounded-full object-cover mb-2"
              style={{ borderRadius: "50%" }}
            />
            <span className="text-lg font-semibold text-blue-800">
              {member.name}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}