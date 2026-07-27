"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import imgSrc from "@/config/img_src.json";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import Reveal from "@/components/shared/Reveal";

const programImages: Record<string, string> = {
  "Bachelor of Arts in English Language Studies": imgSrc.art || "/arts.png",
  "Bachelor of Science in Business Administration - Human Resource Management": imgSrc.hrm || "/hrm.png",
  "Bachelor of Science in Business Administration - Marketing Management": imgSrc.mm || "/mm.png",
  "Bachelor of Science in Hospitality Management": imgSrc.hm || "/hm.png",
};

const programs = [
  {
    name: "Bachelor of Arts in English Language Studies",
    description:
      "The Bachelor of Arts in English Language Studies is a comprehensive program designed to develop advanced proficiency in the English language while fostering critical thinking, effective communication, and cultural awareness. Students will explore the intricacies of linguistics, literature, and language pedagogy, gaining a deep understanding of how language shapes thought, culture, and society.",
    link: "/courses/BAELS",
    apply: "/form?program=Bachelor of Arts in English Language Studies",
  },
  {
    name: "Bachelor of Science in Business Administration - Human Resource Management",
    description:
      "The Bachelor of Science in Business Administration with a specialization in Human Resource Management prepares students to become strategic leaders in workforce development and organizational success. This program delves into the core principles of human capital management, covering essential areas such as recruitment, employee relations, performance management, and workplace diversity.",
    link: "/courses/BSBA-HRM",
    apply: "/form?program=Bachelor of Science in Business Administration - Human Resource Management",
  },
  {
    name: "Bachelor of Science in Business Administration - Marketing Management",
    description:
      "The Bachelor of Science in Business Administration with a focus on Marketing Management equips students with the strategic acumen and creative skills needed to thrive in the fast-paced world of marketing and brand management. This program covers fundamental marketing principles, including market research, consumer behavior, branding, and digital marketing strategies.",
    link: "/courses/BSBA-MM",
    apply: "/form?program=Bachelor of Science in Business Administration - Marketing Management",
  },
  {
    name: "Bachelor of Science in Hospitality Management",
    description:
      "The Bachelor of Science in Hospitality Management offers a dynamic education tailored for those passionate about creating exceptional guest experiences in the tourism and hospitality industry. This program provides a comprehensive understanding of hotel operations, restaurant management, event planning, and tourism development.",
    link: "/courses/BSHM",
    apply: "/form?program=Bachelor of Science in Hospitality Management",
  },
];

const staff = [
  { name: "Renell L. Bruma, MBA-HRM, CHRA", image: imgSrc.bruma || "/bruma.jpg" },
  { name: "Ellen Glice Sesante", image: imgSrc.ellen || "/ellen.jpg" },
];

export default function Program() {
  const router = useRouter();
  const { email, loading: authLoading, applicant_status, isLoggedIn } = useAuth();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
  const [isAlumni, setIsAlumni] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!email) {
      setHasSubmittedApplication(false);
      setIsAlumni(false);
      setCheckingApplication(false);
      return;
    }
    const normalizedStatus = String(applicant_status || "").trim().toLowerCase();
    const blockedStatuses = ["submitted", "under review", "accepted", "approved", "pending", "in progress"];
    setHasSubmittedApplication(blockedStatuses.includes(normalizedStatus));
    fetch("/services/supabase/alumni_profiles/retrieve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((r) => r.json())
      .then((data) => {
        const profiles = Array.isArray(data) ? data : (data.data || []);
        const hasActive = profiles.some(
          (p: { verification_status?: string }) => String(p.verification_status ?? "").toLowerCase() !== "rejected",
        );
        setIsAlumni(hasActive);
      })
      .catch(() => setIsAlumni(false))
      .finally(() => setCheckingApplication(false));
  }, [authLoading, email, applicant_status]);

  return (
    <main>
      {/* Hero */}
      <section className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6">
          <SectionEyebrow className="text-white/80">Programs</SectionEyebrow>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
            Program Offerings
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-20">

        {/* Program Cards */}
        <Reveal>
          <section>
            <SectionEyebrow className="text-center">Our Programs</SectionEyebrow>
            <SectionHeading level="h1" className="text-center mb-12">
              Choose Your Path
            </SectionHeading>
            <div className="grid md:grid-cols-2 gap-10">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-96 flex flex-col"
                >
                  <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                    <Image
                      src={programImages[program.name] || programImages["Bachelor of Arts in English Language Studies"]}
                      alt={program.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between relative bg-primary">
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="relative z-10">
                      <h2 className="text-xl font-bold mb-2 text-white">
                        {program.name}
                      </h2>
                      <p className="text-gray-100 text-sm line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                    <div className="relative z-10 flex gap-2">
                      <button
                        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/50 hover:scale-105 cursor-pointer"
                        onClick={() => router.push(program.link)}
                      >
                        Learn More
                      </button>
                      <button
                        className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-green-500/50 hover:scale-105 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:scale-100 disabled:hover:bg-gray-400"
                        disabled={checkingApplication || hasSubmittedApplication || isAlumni}
                        title={
                          hasSubmittedApplication
                            ? "You already applied for this account. If your application was rejected, you can apply again."
                            : isAlumni
                              ? "You are already an alumni member."
                              : undefined
                        }
                        onClick={() => {
                          if (!email || !isLoggedIn) {
                            router.push(`/auth/signin?next=${encodeURIComponent(program.apply)}`);
                            return;
                          }
                          router.push(program.apply);
                        }}
                      >
                        {checkingApplication ? "Checking..." : hasSubmittedApplication ? "Already Applied" : isAlumni ? "Already an Alumni" : "Apply"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Coordinators */}
        <Reveal>
          <section className="bg-section-warm rounded-xl p-12 text-center">
            <SectionEyebrow>Team</SectionEyebrow>
            <SectionHeading level="h2" className="text-center">
              Program Coordinators
            </SectionHeading>
            <div className="flex flex-col md:flex-row justify-center gap-12 mt-8">
              {staff.map((member, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center transition-transform duration-200 hover:-translate-y-1"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="rounded-full object-cover mb-3 shadow-md"
                  />
                  <span className="text-lg font-semibold text-primary">
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

      </div>
    </main>
  );
}
