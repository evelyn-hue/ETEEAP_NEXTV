"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiX,
  FiRefreshCw,
  FiUpload,
} from "react-icons/fi";
import Fetch_to from "@/utilities/Fetch_to";
import Reveal from "@/components/shared/Reveal";
import Skeleton from "@/components/shared/Skeleton";

type AlumniProfile = {
  id: string;
  full_name: string;
  nickname: string | null;
  graduation_year: string | null;
  birthday: string | null;
  email: string;
  educational_attainments: string[] | null;
  programs: string[] | null;
  certificates: string[] | null;
  work_experiences: Array<{
    companyName: string;
    roleOrReason: string;
    workYear: string;
  }> | null;
  experience: string | null;
  transformation: string | null;
  visibility: "public" | "private";
  is_graduate?: boolean;
  created_at: string;
};

function GraduateBadge({ isGraduate }: { isGraduate?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isGraduate ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
      }`}
    >
      {isGraduate ? "Graduate" : "Non-Graduate"}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "N/A"}</p>
    </div>
  );
}

function AlumniActions({
  item,
  onView,
  onDelete,
  onToggleGraduate,
  loading,
}: {
  item: AlumniProfile;
  onView: () => void;
  onDelete: () => void;
  onToggleGraduate: () => void;
  loading: boolean;
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
        onClick={onToggleGraduate}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition sm:w-auto ${
          item.is_graduate
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {item.is_graduate ? "✓ Graduate" : "Mark Graduate"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FiX />
        Delete
      </button>
    </div>
  );
}

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [graduateFilter, setGraduateFilter] = useState<"all" | "graduate" | "non-graduate">("all");
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    action: "delete" | "graduate" | "";
    alumniId: string;
    fullName: string;
    isGraduateNow: boolean;
  }>({ show: false, action: "", alumniId: "", fullName: "", isGraduateNow: false });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setFetching(true);
    try {
      const result = await Fetch_to("/services/supabase/alumni_profiles/retrieve-all", {});

      // Handle the response nesting from Fetch_to
      const alumniData = result.data?.data || result.data;

      if (result.success && Array.isArray(alumniData)) {
        setAlumni(alumniData as AlumniProfile[]);
        setToast({
          message: `Loaded ${alumniData.length} alumni profiles`,
          type: "success",
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorMsg = result.message || "Unknown error";
        console.error("Failed to fetch alumni:", errorMsg);
        setToast({
          message: `Error: ${errorMsg}`,
          type: "error",
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
      setToast({
        message: `Error fetching alumni: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/services/supabase/alumni_profiles/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        const summary = result.data;
        setToast({
          message: `Imported ${summary.imported}, skipped ${summary.skipped} duplicate${summary.errors?.length ? `, ${summary.errors.length} error(s)` : ""}`,
          type: "success",
        });
        await fetchAlumni();
      } else {
        setToast({
          message: `Import failed: ${result?.error || "Unknown error"}`,
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: `Error importing: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    } finally {
      setImporting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const totals = useMemo(() => {
    return alumni.reduce(
      (acc, item) => {
        if (item.is_graduate) acc.graduates += 1;
        return acc;
      },
      { graduates: 0 }
    );
  }, [alumni]);

  const filteredAlumni = alumni.filter((item) => {
    const haystack = `${item.full_name} ${item.email} ${item.programs?.join(" ") || ""} ${item.is_graduate ? "graduate" : ""}`.toLowerCase();
    if (!haystack.includes(query.toLowerCase())) return false;
    if (graduateFilter === "graduate") return item.is_graduate === true;
    if (graduateFilter === "non-graduate") return !item.is_graduate;
    return true;
  });

  const sortedAlumni = useMemo(() => {
    return [...filteredAlumni].sort((a, b) => {
      const aGrad = a.is_graduate ? 0 : 1;
      const bGrad = b.is_graduate ? 0 : 1;
      if (aGrad !== bGrad) return aGrad - bGrad;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredAlumni]);

  const openConfirmModal = (
    action: "delete" | "graduate",
    alumniId: string,
    fullName: string,
    isGraduateNow = false,
  ) => {
    setConfirmModal({ show: true, action, alumniId, fullName, isGraduateNow });
  };

  const cancelConfirmModal = () => {
    setConfirmModal({ show: false, action: "", alumniId: "", fullName: "", isGraduateNow: false });
  };

  const confirmModalYes = () => {
    const { action, alumniId, isGraduateNow } = confirmModal;
    cancelConfirmModal();
    if (!alumniId || !action) return;
    if (action === "delete") void deleteAlumni(alumniId);
    else if (action === "graduate") void toggleGraduate(alumniId, isGraduateNow);
  };

  const toggleGraduate = async (id: string, current: boolean) => {
    setUpdatingId(id);
    try {
      const result = await Fetch_to(
        "/services/supabase/alumni_profiles/update",
        { id, is_graduate: !current }
      );

      if (result.success) {
        setAlumni((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_graduate: !current } : item
          )
        );
        if (selectedAlumni?.id === id) {
          setSelectedAlumni({ ...selectedAlumni, is_graduate: !current });
        }
        setToast({
          message: `Marked as ${!current ? "graduate" : "non-graduate"}`,
          type: "success",
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({
          message: `Failed to update: ${result.message}`,
          type: "error",
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      setToast({
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteAlumni = async (id: string) => {
    setUpdatingId(id);
    try {
      const result = await Fetch_to("/services/supabase/alumni_profiles/delete", { id });

      if (result.success) {
        setAlumni((prev) => prev.filter((item) => item.id !== id));
        if (selectedAlumni?.id === id) {
          setSelectedAlumni(null);
        }
        setToast({
          message: "Alumni profile deleted successfully!",
          type: "success",
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({
          message: `Failed to delete profile: ${result.message}`,
          type: "error",
        });
        setTimeout(() => setToast(null), 3000);
        console.error("Failed to delete profile:", result.message);
      }
    } catch (error) {
      setToast({
        message: `Error deleting profile: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      setTimeout(() => setToast(null), 3000);
      console.error("Error deleting profile:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-section-warm p-4 sm:p-6">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-60 px-6 py-4 rounded-xl shadow-lg text-white font-semibold ${
            toast.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Alumni</p>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-900 font-display">Alumni Profiles</h1>
          <p className="mt-1 text-sm text-slate-500">Manage alumni profiles — mark graduates, import from CSV, and view details.</p>
        </div>

        {/* Stats + Actions */}
        <Reveal>
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/30 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-800">{alumni.length}</p>
                <p className="text-xs uppercase tracking-wide text-blue-700">
                  Total Alumni
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-800">{totals.graduates}</p>
                <p className="text-xs uppercase tracking-wide text-emerald-700">
                  Graduates
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 shadow-sm"
              >
                <FiUpload size={16} />
                {importing ? "Importing..." : "Import CSV"}
              </button>
              <button
                onClick={fetchAlumni}
                disabled={fetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 shadow-sm"
              >
                <FiRefreshCw className={fetching ? "animate-spin" : ""} size={16} />
                Refresh
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        </Reveal>

        {/* Search + Graduate Filter */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm ring-1 ring-transparent focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all">
            <FiSearch className="shrink-0 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, program, or status..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "graduate", "non-graduate"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setGraduateFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  graduateFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f === "all" ? "All" : f === "graduate" ? "Graduates" : "Non-Graduates"}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <>
            {/* Mobile skeleton */}
            <section className="space-y-4 md:hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/30">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </section>
            {/* Desktop skeleton */}
            <section className="hidden md:block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/30">
              <div className="border-b border-slate-200 px-6 py-4">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-6">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <Reveal>
            <section className="space-y-4 md:hidden">
              {sortedAlumni.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.full_name}</p>
                      <p className="mt-1 break-all text-sm text-slate-500">{item.email}</p>
                    </div>
                    <GraduateBadge isGraduate={item.is_graduate} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-700">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Program</p>
                      <p className="mt-1">{item.programs?.join(", ") || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Year</p>
                        <p className="mt-1">{item.graduation_year || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
                        <p className="mt-1">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <AlumniActions
                      item={item}
                      onView={() => setSelectedAlumni(item)}
                      onDelete={() => openConfirmModal("delete", item.id, item.full_name)}
                      onToggleGraduate={() => openConfirmModal("graduate", item.id, item.full_name, !!item.is_graduate)}
                      loading={updatingId === item.id}
                    />
                  </div>
                </article>
              ))}
            </section>
            </Reveal>

            <Reveal>
            <section className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/30 md:block">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Alumni Profiles ({sortedAlumni.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-230">
                  <thead className="bg-blue-800 text-left text-sm text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Alumni</th>
                      <th className="px-6 py-4 font-semibold">Program</th>
                      <th className="px-6 py-4 font-semibold">Year</th>
                      <th className="px-6 py-4 font-semibold">Submitted</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAlumni.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-900">{item.full_name}</p>
                          <p className="text-sm text-slate-500">{item.email}</p>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-700">
                          {item.programs?.join(", ") || "N/A"}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-700">
                          {item.graduation_year || "N/A"}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-6 py-5">
                          <GraduateBadge isGraduate={item.is_graduate} />
                        </td>
                        <td className="px-6 py-5">
                          <AlumniActions
                            item={item}
                            onView={() => setSelectedAlumni(item)}
                            onDelete={() => openConfirmModal("delete", item.id, item.full_name)}
                            onToggleGraduate={() => openConfirmModal("graduate", item.id, item.full_name, !!item.is_graduate)}
                            loading={updatingId === item.id}
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
            </Reveal>
          </>
        )}

        {selectedAlumni ? (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-0 py-0"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedAlumni(null);
              }
            }}
          >
            <div className="w-full h-full rounded-none bg-white shadow-2xl overflow-auto">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    Alumni Details
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedAlumni.full_name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAlumni.email}
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

              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_1fr] h-[calc(100vh-96px)] overflow-y-auto">
                <div className="space-y-6">
                  <section className="rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Personal Information
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Detail label="Full Name" value={selectedAlumni.full_name} />
                      <Detail label="Nickname" value={selectedAlumni.nickname} />
                      <Detail label="Birthday" value={selectedAlumni.birthday} />
                      <Detail label="Academic Year" value={selectedAlumni.graduation_year} />
                    </div>
                  </section>

                  {selectedAlumni.educational_attainments && selectedAlumni.educational_attainments.length > 0 && (
                    <section className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                        Educational Attainment
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedAlumni.educational_attainments.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedAlumni.programs && selectedAlumni.programs.length > 0 && (
                    <section className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                        Program Information
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedAlumni.programs.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedAlumni.work_experiences && selectedAlumni.work_experiences.length > 0 && (
                    <section className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                        Work Experience
                      </h3>
                      <div className="mt-4 space-y-3">
                        {selectedAlumni.work_experiences.map((work, idx) => (
                          <div key={idx}>
                            <Detail label="Company Name" value={work.companyName} />
                            <Detail label="Role/Position" value={work.roleOrReason} />
                            <Detail label="Years" value={work.workYear} />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedAlumni.certificates && selectedAlumni.certificates.length > 0 && (
                    <section className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                        Certificates & Licenses
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedAlumni.certificates.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {(selectedAlumni.experience || selectedAlumni.transformation) && (
                <div className="border-t border-slate-200 p-4 sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {selectedAlumni.experience && (
                      <section>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                          ETEEAP Experience
                        </h3>
                        <p className="mt-3 text-sm text-slate-700">
                          {selectedAlumni.experience}
                        </p>
                      </section>
                    )}
                    {selectedAlumni.transformation && (
                      <section>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                          Professional Transformation
                        </h3>
                        <p className="mt-3 text-sm text-slate-700">
                          {selectedAlumni.transformation}
                        </p>
                      </section>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 px-6 py-4 sm:flex sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-slate-600">
                    Visibility: <span className="font-semibold">{selectedAlumni.visibility}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Status: <span className="font-semibold"><GraduateBadge isGraduate={selectedAlumni.is_graduate} /></span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAlumni(null)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirmModal("graduate", selectedAlumni.id, selectedAlumni.full_name, !!selectedAlumni.is_graduate)}
                    disabled={updatingId === selectedAlumni.id}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                      selectedAlumni.is_graduate
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {selectedAlumni.is_graduate ? "Unmark Graduate" : "Mark Graduate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirmModal("delete", selectedAlumni.id, selectedAlumni.full_name)}
                    disabled={updatingId === selectedAlumni.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    <FiX />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {confirmModal.action === "delete"
                ? "Confirm Delete"
                : "Confirm Graduate"}
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              {confirmModal.action === "delete" && `Are you sure you want to delete the alumni profile for ${confirmModal.fullName}? This cannot be undone.`}
              {confirmModal.action === "graduate" &&
                (confirmModal.isGraduateNow
                  ? `Are you sure you want to unmark ${confirmModal.fullName} as a graduate?`
                  : `Are you sure you want to mark ${confirmModal.fullName} as a graduate?`)}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelConfirmModal}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmModalYes}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  confirmModal.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-800"
                }`}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
