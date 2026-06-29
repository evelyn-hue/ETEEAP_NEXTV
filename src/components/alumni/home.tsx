"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import Fetch_to from "@/utilities/Fetch_to";

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

  // All available programs
  const allPrograms = [
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Science in Business Administration - Human Resource Management",
    "Bachelor of Science in Business Administration - Marketing Management",
    "Bachelor of Science in Hospitality Management"
  ];

  // Generate all academic years from 1990 to current year
  const allYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  // Check if current user already has an alumni profile
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
        // Silently fail
      } finally {
        setCheckingAlumniStatus(false);
      }
    };
    checkExisting();
  }, [authEmail, authLoading]);

  // Fetch verified and public alumni profiles
  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const result = await Fetch_to("/services/supabase/alumni_profiles/retrieve-all", {});

        // Handle the response nesting from Fetch_to
        const alumniData = result.data?.data || result.data || [];

        if (result.success && Array.isArray(alumniData)) {
          // Filter for verified and public profiles only
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

  // Filter alumni based on search and selections
  const filteredAlumni = useMemo(() => {
    return alumni.filter((person) => {
      // Search only by name (full name and nickname)
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 mt-18">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Alumni Feed</h1>
        <p className="text-gray-500">Verified alumni profiles from our community</p>

        {checkingAlumniStatus || authLoading ? (
          <span className="inline-block mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">
            Checking...
          </span>
        ) : hasExistingAlumni ? (
          <span className="inline-block mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">
            Already Applied
          </span>
        ) : (
          <Link
            href="/alumni/alumniform"
            className="inline-block mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            Join Alumni
          </Link>
        )}
      </div>

      <div className="max-w-5xl mx-auto mb-6 bg-white p-6 rounded-xl shadow">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(180px,240px)_minmax(160px,200px)]">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
            placeholder="Search alumni by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">All programs</option>
            {allPrograms.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>

          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All academic years</option>
            {allYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedProgram || selectedYear) && (
          <div className="border-t pt-4 mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Active Filters:
            </p>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Search: {searchQuery}
                </span>
              )}
              {selectedProgram && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {selectedProgram}
                </span>
              )}
              {selectedYear && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {selectedYear}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="max-w-5xl mx-auto text-center py-12">
          <p className="text-gray-600">Loading alumni profiles...</p>
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div className="max-w-5xl mx-auto text-center py-12">
          <p className="text-gray-600">No alumni profiles found matching your criteria.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredAlumni.length} of {alumni.length} verified alumni
          </div>

          {filteredAlumni.map((person) => (
            <div key={person.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const entryPic = person.profile_picture;
                  const isCurrentUser = authEmail && person.email && authEmail.toLowerCase().trim() === person.email.toLowerCase().trim();
                  const avatarSrc = entryPic || (isCurrentUser ? authProfilePicture : undefined);
                  if (avatarSrc) {
                    return (
                      <Image
                        src={avatarSrc}
                        alt={person.full_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                        unoptimized
                      />
                    );
                  }
                  return (
                    <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
                      {getInitials(person.full_name)}
                    </div>
                  );
                })()}

                <div>
                  <h2 className="text-xl font-bold text-blue-800">
                    {person.full_name}
                  </h2>
                  {person.nickname && (
                    <p className="text-sm text-gray-500">&quot;{person.nickname}&quot;</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Verified Alumni
                </span>
              </div>

              {(person.birthday || person.graduation_year) && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Personal Info
                  </h3>
                  <div className="text-sm text-gray-600">
                    {person.birthday && <p>Birthday: {person.birthday}</p>}
                    {person.graduation_year && <p>Batch: {person.graduation_year}</p>}
                  </div>
                </div>
              )}

              {person.educational_attainments && person.educational_attainments.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Education</h3>
                  <div className="flex flex-wrap gap-2">
                    {person.educational_attainments.map((edu) => (
                      <span
                        key={edu}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                      >
                        {edu}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {person.programs && person.programs.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Programs</h3>
                  <div className="flex flex-wrap gap-2">
                    {person.programs.map((program) => (
                      <span
                        key={program}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                      >
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {person.certificates && person.certificates.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Certificates</h3>
                  <div className="flex flex-wrap gap-2">
                    {person.certificates.map((cert) => (
                      <span
                        key={cert}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {person.work_experiences && person.work_experiences.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Work Experience
                  </h3>
                  <div className="space-y-3">
                    {person.work_experiences.map((work, idx) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p className="font-medium">{work.companyName}</p>
                        <p>{work.roleOrReason}</p>
                        <p className="text-xs text-gray-500">{work.workYear}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {person.experience && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Experience</h3>
                  <div className="text-sm text-gray-600">
                    <p>{person.experience}</p>
                  </div>
                </div>
              )}

              {person.transformation && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">
                    Professional Transformation
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>{person.transformation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
