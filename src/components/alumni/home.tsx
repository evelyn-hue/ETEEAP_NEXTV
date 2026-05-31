"use client";

import { useEffect, useState } from "react";

/* =========================
   TYPES (MATCH YOUR SLAMBOOK)
========================= */

type ChipItem = {
  value: string;
};

type Alumni = {
  id: string;

  fullName: string;
  nickname: string;
  graduationYear: string;
  birthday: string;

  education: ChipItem[];
  programs: ChipItem[];
  certificates: ChipItem[];

  companyName: string;
  roleOrReason: string;
  workYear: string;

  experience: string;
  transformation: string;
};

/* =========================
   MOCK DATA (FULL SLAMBOOK STYLE)
========================= */

const mockAlumni: Alumni[] = [
  {
    id: "1",
    fullName: "Juan Dela Cruz",
    nickname: "JD",
    graduationYear: "2024-2025",
    birthday: "1998-05-10",

    education: [{ value: "Bachelor's Degree" }],
    programs: [{ value: "Bachelor of Science in Business Administration - Human Resource Management" }],
    certificates: [{ value: "TESDA NC II" }],

    companyName: "Tech Corp",
    roleOrReason: "Software Developer",
    workYear: "2025-Present",

    experience: "Great journey in ETEEAP program.",
    transformation: "It changed my career path completely.",
  },
  {
    id: "2",
    fullName: "Maria Santos",
    nickname: "MS",
    graduationYear: "2025-2026",
    birthday: "1999-08-15",

    education: [{ value: "Bachelor's Degree" }],
    programs: [{ value: "Bachelor of Arts in English Language Studies" }],
    certificates: [{ value: "TESDA NC III" }],

    companyName: "Education Plus",
    roleOrReason: "English Teacher",
    workYear: "2026-Present",

    experience: "Excellent learning experience at the institution.",
    transformation: "Improved my teaching skills significantly.",
  },
  {
    id: "3",
    fullName: "Carlos Miguel",
    nickname: "CM",
    graduationYear: "2024-2025",
    birthday: "1997-03-22",

    education: [{ value: "Bachelor's Degree" }],
    programs: [{ value: "Bachelor of Science in Business Administration - Marketing Management" }],
    certificates: [{ value: "Digital Marketing Cert" }],

    companyName: "Marketing Solutions Inc",
    roleOrReason: "Marketing Manager",
    workYear: "2025-Present",

    experience: "Outstanding program with practical learning.",
    transformation: "Transformed my career trajectory.",
  },
  {
    id: "4",
    fullName: "Angela Reyes",
    nickname: "AR",
    graduationYear: "2025-2026",
    birthday: "2000-11-30",

    education: [{ value: "Bachelor's Degree" }],
    programs: [{ value: "Bachelor of Science in Hospitality Management" }],
    certificates: [{ value: "Hospitality Professional Cert" }],

    companyName: "Grand Hotel Resort",
    roleOrReason: "Front Office Manager",
    workYear: "2026-Present",

    experience: "Fantastic industry exposure and connections.",
    transformation: "Launched my hospitality career successfully.",
  },
];

/* =========================
   FILTER OPTIONS
========================= */

const PROGRAMS = [
  "Bachelor of Science in Business Administration - Human Resource Management",
  "Bachelor of Arts in English Language Studies",
  "Bachelor of Science in Business Administration - Marketing Management",
  "Bachelor of Science in Hospitality Management",
];

// Generate academic years from 2004 to 2030
const generateAcademicYears = () => {
  const years: string[] = [];
  for (let year = 2004; year <= 2030; year++) {
    years.push(`${year}-${year + 1}`);
  }
  return years;
};

const ACADEMIC_YEARS = generateAcademicYears();

/* =========================
   MAIN PAGE
========================= */

export default function AlumniFeedPage() {
  const [alumni, setAlumni] = useState<Alumni[]>(mockAlumni);
  const [filtered, setFiltered] = useState<Alumni[]>(mockAlumni);

  const [search, setSearch] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  /* =========================
     FETCH (SAFE)
  ========================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/alumni");
        const data = await res.json();

        const safe = Array.isArray(data) ? data : [];

        if (safe.length > 0) {
          setAlumni(safe);
          setFiltered(safe);
        }
      } catch {
        console.log("Using mock data");
      }
    };

    fetchData();
  }, []);

  /* =========================
     SEARCH & FILTER (FEED STYLE)
  ========================= */

  useEffect(() => {
    let result = [...alumni];

    // Search by name
    if (search.trim()) {
      result = result.filter((a) =>
        a.fullName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by programs
    if (selectedPrograms.length > 0) {
      result = result.filter((a) =>
        a.programs.some((p) => selectedPrograms.includes(p.value))
      );
    }

    // Filter by academic years
    if (selectedYears.length > 0) {
      result = result.filter((a) =>
        selectedYears.includes(a.graduationYear)
      );
    }

    setFiltered(result);
  }, [search, alumni, selectedPrograms, selectedYears]);

  /* =========================
     TOGGLE FILTER HANDLERS
  ========================= */

  const toggleProgram = (program: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(program)
        ? prev.filter((p) => p !== program)
        : [...prev, program]
    );
  };

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedPrograms([]);
    setSelectedYears([]);
  };

  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-gray-100 p-6 mt-12">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-blue-800">
          🎓 Alumni Feed
        </h1>
        <p className="text-gray-500">
          Full slambook profiles from graduates
        </p>

        <a
          href="/alumniform"
          className="inline-block mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + Join Alumni
        </a>
      </div>

      {/* SEARCH */}
      <div className="max-w-5xl mx-auto mb-6">
        <input
          className="w-full border p-3 rounded"
          placeholder="Search alumni..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <div className="max-w-5xl mx-auto mb-6 bg-white p-6 rounded-xl shadow">
        {/* Clear Filters Button */}
        {(search || selectedPrograms.length > 0 || selectedYears.length > 0) && (
          <button
            onClick={clearFilters}
            className="mb-4 text-sm bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
          >
            Clear All Filters
          </button>
        )}

        {/* PROGRAM & ACADEMIC YEAR DROPDOWNS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* PROGRAM FILTER DROPDOWN */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">📚 Filter by Program</h3>
            <select
              multiple
              value={selectedPrograms}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedPrograms(selected);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
              size={5}
            >
              {PROGRAMS.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>

          {/* ACADEMIC YEAR FILTER DROPDOWN */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">📅 Filter by Academic Year</h3>
            <select
              multiple
              value={selectedYears}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedYears(selected);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700"
              size={5}
            >
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SELECTED FILTERS DISPLAY */}
        {(selectedPrograms.length > 0 || selectedYears.length > 0) && (
          <div className="border-t pt-4">
            {/* Selected Programs */}
            {selectedPrograms.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Selected Programs:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPrograms.map((program) => (
                    <span
                      key={program}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {program}
                      <button
                        onClick={() => toggleProgram(program)}
                        className="text-blue-700 hover:text-blue-900 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Years */}
            {selectedYears.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Selected Academic Years:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedYears.map((year) => (
                    <span
                      key={year}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {year}
                      <button
                        onClick={() => toggleYear(year)}
                        className="text-green-700 hover:text-green-900 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FEED */}
      <div className="max-w-5xl mx-auto space-y-6">

        {filtered.map((a) => (
          <AlumniFeedCard key={a.id} alumni={a} />
        ))}

      </div>
    </main>
  );
}

/* =========================
   FEED CARD (FULL SLAMBOOK DISPLAY)
========================= */

function AlumniFeedCard({ alumni }: { alumni: Alumni }) {
  const initials = alumni.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">

        <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
          {initials}
        </div>

        <div>
          <h2 className="text-xl font-bold text-blue-800">
            {alumni.fullName}
          </h2>
          <p className="text-sm text-gray-500">
            "{alumni.nickname}"
          </p>
        </div>
      </div>

      {/* VERIFIED */}
      <div className="mb-4">
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
          ✔ Verified Alumni
        </span>
      </div>

      {/* PERSONAL INFO */}
      <Section title="👤 Personal Info">
        <p>Birthday: {alumni.birthday}</p>
        <p>Batch: {alumni.graduationYear}</p>
      </Section>

      {/* EDUCATION */}
      <Section title="🎓 Education">
        <Chips items={alumni.education} />
      </Section>

      {/* PROGRAMS */}
      <Section title="🏫 Programs">
        <Chips items={alumni.programs} />
      </Section>

      {/* CERTIFICATES */}
      <Section title="📜 Certificates">
        <Chips items={alumni.certificates} />
      </Section>

      {/* WORK */}
      <Section title="💼 Work Experience">
        <p>{alumni.companyName}</p>
        <p>{alumni.roleOrReason}</p>
        <p>{alumni.workYear}</p>
      </Section>

      {/* REFLECTION */}
      <Section title="💬 Experience">
        <p>{alumni.experience}</p>
      </Section>

      <Section title="✨ Transformation">
        <p>{alumni.transformation}</p>
      </Section>

    </div>
  );
}

/* =========================
   UI HELPERS
========================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: ChipItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items?.map((item, i) => (
        <span
          key={i}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
        >
          {item.value}
        </span>
      ))}
    </div>
  );
}