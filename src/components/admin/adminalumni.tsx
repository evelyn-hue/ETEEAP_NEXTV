"use client";

import { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiX,
} from "react-icons/fi";

type AlumniStatus = "Pending" | "Verified" | "Rejected";

type AlumniRecord = {
  id: number;
  name: string;
  nickname: string;
  email: string;
  program: string;
  batch: string;
  birthday: string;
  submitted: string;
  status: AlumniStatus;
  educationalAttainment: string[];
  programInformation: string[];
  workExperience: {
    companyName: string;
    roleOrReason: string;
    workYear: string;
  };
  certificates: string[];
  experience: string;
  transformation: string;
  visibility: "public" | "private";
};

const initialAlumni: AlumniRecord[] = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    nickname: "JD",
    email: "juan@email.com",
    program: "BSBA - Human Resource Management",
    batch: "2024-2025",
    birthday: "1998-05-10",
    submitted: "2 hours ago",
    status: "Pending",
    educationalAttainment: ["Bachelor's Degree"],
    programInformation: ["ETEEAP Program"],
    workExperience: {
      companyName: "Tech Corp",
      roleOrReason: "Software Developer",
      workYear: "2025-Present",
    },
    certificates: ["TESDA NC II"],
    experience: "Great journey in ETEEAP program.",
    transformation: "It changed my career path completely.",
    visibility: "public",
  },
  {
    id: 2,
    name: "Maria Santos",
    nickname: "MS",
    email: "maria@email.com",
    program: "BA - English Language Studies",
    batch: "2025-2026",
    birthday: "1999-08-15",
    submitted: "5 hours ago",
    status: "Pending",
    educationalAttainment: ["Bachelor's Degree"],
    programInformation: ["ETEEAP Program"],
    workExperience: {
      companyName: "Education Plus",
      roleOrReason: "English Teacher",
      workYear: "2026-Present",
    },
    certificates: ["TESDA NC III"],
    experience: "Excellent learning experience at the institution.",
    transformation: "Improved my teaching skills significantly.",
    visibility: "private",
  },
  {
    id: 3,
    name: "Mark Reyes",
    nickname: "MR",
    email: "mark@email.com",
    program: "BSHM",
    batch: "2024-2025",
    birthday: "1997-03-22",
    submitted: "1 day ago",
    status: "Verified",
    educationalAttainment: ["Bachelor's Degree"],
    programInformation: ["BS Hospitality Management"],
    workExperience: {
      companyName: "Hotel One",
      roleOrReason: "Front Office Associate",
      workYear: "2024-Present",
    },
    certificates: ["Training Certificate"],
    experience: "Built strong guest service and hospitality skills.",
    transformation: "Helped me move into the hotel industry.",
    visibility: "public",
  },
  {
    id: 4,
    name: "Alyssa Gomez",
    nickname: "AG",
    email: "alyssa@email.com",
    program: "BSBA - Marketing Management",
    batch: "2026-2027",
    birthday: "2000-11-02",
    submitted: "2 days ago",
    status: "Rejected",
    educationalAttainment: ["Senior High School", "Bachelor's Degree"],
    programInformation: ["BS Business Administration"],
    workExperience: {
      companyName: "Brand House",
      roleOrReason: "Marketing Assistant",
      workYear: "2023-2025",
    },
    certificates: ["Professional License (PRC)"],
    experience: "Strong exposure to brand campaigns and coordination.",
    transformation: "Expanded my confidence in marketing work.",
    visibility: "private",
  },
];

function StatusBadge({ status }: { status: AlumniStatus }) {
  const styles =
    status === "Verified"
      ? "bg-green-100 text-green-800"
      : status === "Rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function AlumniActions({
  item,
  onView,
  onVerify,
  onReject,
}: {
  item: AlumniRecord;
  onView: () => void;
  onVerify: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={onView}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
      >
        <FiEye />
        View
      </button>
      <button
        type="button"
        onClick={onVerify}
        disabled={item.status === "Verified"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FiUserCheck />
        Verify
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={item.status === "Rejected"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FiUserX />
        Reject
      </button>
    </div>
  );
}

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState(initialAlumni);
  const [query, setQuery] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniRecord | null>(
    null
  );

  const totals = useMemo(() => {
    return alumni.reduce(
      (acc, item) => {
        if (item.status === "Pending") acc.pending += 1;
        if (item.status === "Verified") acc.verified += 1;
        if (item.status === "Rejected") acc.rejected += 1;
        return acc;
      },
      { pending: 0, verified: 0, rejected: 0 }
    );
  }, [alumni]);

  const filteredAlumni = alumni.filter((item) => {
    const haystack = `${item.name} ${item.email} ${item.program} ${item.batch} ${item.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const updateStatus = (id: number, status: AlumniStatus) => {
    setAlumni((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Alumni Verification
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Verify or Reject Alumni
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Frontend-only review queue for alumni submissions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-yellow-800">{totals.pending}</p>
                <p className="text-xs uppercase tracking-wide text-yellow-700">
                  Pending
                </p>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-green-800">{totals.verified}</p>
                <p className="text-xs uppercase tracking-wide text-green-700">
                  Verified
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-red-800">{totals.rejected}</p>
                <p className="text-xs uppercase tracking-wide text-red-700">
                  Rejected
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FiSearch className="shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, program, batch, or status..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        <section className="space-y-4 md:hidden">
          {filteredAlumni.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 break-all text-sm text-slate-500">{item.email}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Program</p>
                  <p className="mt-1">{item.program}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Batch</p>
                    <p className="mt-1">{item.batch}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
                    <p className="mt-1">{item.submitted}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <AlumniActions
                  item={item}
                  onView={() => setSelectedAlumni(item)}
                  onVerify={() => updateStatus(item.id, "Verified")}
                  onReject={() => updateStatus(item.id, "Rejected")}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Alumni Requests
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="bg-slate-50 text-left text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Alumni</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">Batch</th>
                  <th className="px-6 py-4 font-semibold">Submitted</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.email}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">
                      {item.program}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700">
                      {item.batch}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {item.submitted}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-5">
                      <AlumniActions
                        item={item}
                        onView={() => setSelectedAlumni(item)}
                        onVerify={() => updateStatus(item.id, "Verified")}
                        onReject={() => updateStatus(item.id, "Rejected")}
                      />
                    </td>
                  </tr>
                ))}

                {filteredAlumni.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No alumni match the current search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <FiClock />
              </div>
              <div>
                <p className="text-sm text-slate-500">Review Mode</p>
                <p className="font-semibold text-slate-900">Manual verification</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <FiCheckCircle />
              </div>
              <div>
                <p className="text-sm text-slate-500">Approved</p>
                <p className="font-semibold text-slate-900">Visible on alumni list</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-700">
                <FiUserX />
              </div>
              <div>
                <p className="text-sm text-slate-500">Rejected</p>
                <p className="font-semibold text-slate-900">Kept out of public list</p>
              </div>
            </div>
          </div>
        </section>

        {selectedAlumni ? (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-0 py-0 sm:items-center sm:px-4 sm:py-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedAlumni(null);
              }
            }}
          >
            <div className="h-[100dvh] w-full max-w-5xl overflow-y-auto rounded-none bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    Alumni Details
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedAlumni.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAlumni.program} | {selectedAlumni.batch}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAlumni(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close details"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Personal Information
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Detail label="Full Name" value={selectedAlumni.name} />
                      <Detail label="Nickname" value={selectedAlumni.nickname} />
                      <Detail label="Birthday" value={selectedAlumni.birthday} />
                      <Detail label="Academic Year" value={selectedAlumni.batch} />
                    </div>
                  </section>

                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Educational Attainment
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedAlumni.educationalAttainment.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Program Information
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedAlumni.programInformation.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Work Experience
                    </h3>
                    <div className="mt-4 space-y-3">
                      <Detail
                        label="Company Name"
                        value={selectedAlumni.workExperience.companyName}
                      />
                      <Detail
                        label="Role / Position"
                        value={selectedAlumni.workExperience.roleOrReason}
                      />
                      <Detail
                        label="Inclusive Years"
                        value={selectedAlumni.workExperience.workYear}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Certificates & Licenses
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedAlumni.certificates.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Reflection
                    </h3>
                    <div className="mt-4 space-y-4 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-900">
                          Experience:
                        </span>{" "}
                        {selectedAlumni.experience}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Transformation:
                        </span>{" "}
                        {selectedAlumni.transformation}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-slate-900 p-5 text-white">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Profile Visibility
                    </h3>
                    <p className="mt-3 text-lg font-semibold capitalize">
                      {selectedAlumni.visibility}
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
