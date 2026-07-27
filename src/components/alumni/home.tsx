"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import Fetch_to from "@/utilities/Fetch_to";
import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import Reveal from "@/components/shared/Reveal";

type WorkExperience = {
  companyName: string;
  roleOrReason: string;
  workYear: string;
};

type AlumniProfile = {
  id: string;
  email: string;
  full_name: string;
  nickname: string | null;
  graduation_year: string | null;
  birthday: string | null;
  educational_attainments: string[] | null;
  programs: string[] | null;
  certificates: string[] | null;
  work_experiences: WorkExperience[] | null;
  experience: string | null;
  transformation: string | null;
  visibility: "public" | "private";
  verification_status: string;
  profile_picture: string | null;
};

export default function AlumniFeedPage() {
  const { email: authEmail, profilePicture: authProfilePicture, loading: authLoading } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExistingAlumni, setHasExistingAlumni] = useState(false);
  const [checkingAlumniStatus, setCheckingAlumniStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allPrograms = [
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Science in Business Administration - Human Resource Management",
    "Bachelor of Science in Business Administration - Marketing Management",
    "Bachelor of Science in Hospitality Management"
  ];

  const allYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let year = currentYear; year >= 1926; year--) {
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }, []);

  useEffect(() => {
    if (authLoading || !authEmail) {
      if (!authEmail) setCheckingAlumniStatus(false);
      return;
    }
    const checkExisting = async () => {
      try {
        const result = await Fetch_to("/services/supabase/alumni_profiles/retrieve", { email: authEmail });
        if (result.success) {
          const data = Array.isArray(result.data) ? result.data : (result.data?.data || []);
          const hasActive = data.some(
            (p: AlumniProfile) => String(p.verification_status ?? "").toLowerCase() !== "rejected"
          );
          setHasExistingAlumni(hasActive);
        }
      } catch {
      } finally {
        setCheckingAlumniStatus(false);
      }
    };
    checkExisting();
  }, [authEmail, authLoading]);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const result = await Fetch_to("/services/supabase/alumni_profiles/retrieve-all", {});
        const alumniData = result.data?.data || result.data || [];
        if (result.success && Array.isArray(alumniData)) {
          const verifiedPublic = alumniData.filter(
            (person: AlumniProfile) =>
              person.verification_status === "verified" && person.visibility === "public"
          );
          setAlumni(verifiedPublic);
        }
      } catch (error) {
        console.error("Error fetching alumni:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  const filteredAlumni = useMemo(() => {
    return alumni.filter((person) => {
      const matchesSearch =
        person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.nickname?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram =
        !selectedProgram || person.programs?.includes(selectedProgram);
      const matchesYear =
        !selectedYear || person.graduation_year === selectedYear;
      return matchesSearch && matchesProgram && matchesYear;
    });
  }, [alumni, searchQuery, selectedProgram, selectedYear]);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main>
      <section className="relative w-full h-64 md:h-72 flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6">
          <SectionEyebrow className="text-white/80">Community</SectionEyebrow>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display">
            Alumni Feed
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto">
            Verified alumni profiles from our growing community
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">

        <Reveal>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6">
            <SectionEyebrow>Get Connected</SectionEyebrow>
            <SectionHeading className="mb-4">Join the Alumni Network</SectionHeading>
            {checkingAlumniStatus || authLoading ? (
              <span className="inline-block mt-2 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">Checking...</span>
            ) : hasExistingAlumni ? (
              <span className="inline-block mt-2 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">Already Applied</span>
            ) : (
              <Link href="/alumni/alumniform" className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Join Alumni</Link>
            )}
          </div>
        </Reveal>

        <Reveal>
          <div className="bg-section-warm rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6">
            <SectionEyebrow>Filter</SectionEyebrow>
            <SectionHeading level="h3">Search Alumni</SectionHeading>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(180px,240px)_minmax(160px,200px)] mt-4">
              <input className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30" placeholder="Search alumni by name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
                <option value="">All programs</option>
                {allPrograms.map((program) => (<option key={program} value={program}>{program}</option>))}
              </select>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">All academic years</option>
                {allYears.map((year) => (<option key={year} value={year}>{year}</option>))}
              </select>
            </div>
            {(searchQuery || selectedProgram || selectedYear) && (
              <div className="border-t pt-4 mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Search: {searchQuery}</span>}
                  {selectedProgram && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{selectedProgram}</span>}
                  {selectedYear && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{selectedYear}</span>}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {loading ? (
          <div className="text-center py-12"><p className="text-gray-600">Loading alumni profiles...</p></div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-600">No alumni profiles found matching your criteria.</p></div>
        ) : (
          <div>
            <div className="text-sm text-gray-600 mb-6">
              Showing {filteredAlumni.length} of {alumni.length} verified alumni
            </div>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((person) => {
                const isOpen = expandedId === person.id;
                const entryPic = person.profile_picture;
                const isCurrentUser = authEmail && person.email && authEmail.toLowerCase().trim() === person.email.toLowerCase().trim();
                const avatarSrc = entryPic || (isCurrentUser ? authProfilePicture : undefined);

                return (
                  <StaggerItem key={person.id}>
                    <div
                      className="relative bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 hover:shadow-lg transition cursor-pointer"
                      onClick={() => toggleExpand(person.id)}
                    >
                      <div className="p-5 flex items-center gap-4">
                        {avatarSrc ? (
                          <Image src={avatarSrc} alt={person.full_name} width={56} height={56} className="w-14 h-14 rounded-full object-cover shrink-0" unoptimized />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">{getInitials(person.full_name)}</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h2 className="font-bold text-primary truncate">{person.full_name}</h2>
                          {person.nickname && <p className="text-sm text-gray-500 truncate">&quot;{person.nickname}&quot;</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">Verified</span>
                            {person.graduation_year && <span className="text-xs text-gray-400">{person.graduation_year}</span>}
                          </div>
                        </div>
                        <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>

                      {isOpen && (
                        <div className="absolute left-0 right-0 top-full z-20 bg-white rounded-b-xl shadow-lg border border-gray-100 px-5 pb-5 pt-3 space-y-4 text-sm">
                          {(person.birthday || person.graduation_year) && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Personal Info</p>
                              <div className="text-gray-600">{person.birthday && <p>Birthday: {person.birthday}</p>}</div>
                            </div>
                          )}

                          {person.educational_attainments && person.educational_attainments.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Education</p>
                              <div className="flex flex-wrap gap-1">{person.educational_attainments.map((e) => (<span key={e} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{e}</span>))}</div>
                            </div>
                          )}

                          {person.programs && person.programs.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Programs</p>
                              <div className="flex flex-wrap gap-1">{person.programs.map((p) => (<span key={p} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{p}</span>))}</div>
                            </div>
                          )}

                          {person.certificates && person.certificates.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Certificates</p>
                              <div className="flex flex-wrap gap-1">{person.certificates.map((c) => (<span key={c} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{c}</span>))}</div>
                            </div>
                          )}

                          {person.work_experiences && person.work_experiences.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Work Experience</p>
                              <div className="space-y-2">{person.work_experiences.map((w, i) => (
                                <div key={i} className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                                  <p className="font-medium">{w.companyName}</p>
                                  <p>{w.roleOrReason}</p>
                                  <p className="text-gray-400">{w.workYear}</p>
                                </div>
                              ))}</div>
                            </div>
                          )}

                          {person.experience && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Experience</p>
                              <p className="text-gray-600 text-xs leading-relaxed">{person.experience}</p>
                            </div>
                          )}

                          {person.transformation && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1 text-xs uppercase tracking-wider">Transformation</p>
                              <p className="text-gray-600 text-xs leading-relaxed">{person.transformation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}
      </div>
    </main>
  );
}
