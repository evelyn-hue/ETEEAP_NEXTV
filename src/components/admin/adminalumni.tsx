"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import Fetch_to from "@/utilities/Fetch_to";

type AlumniStatus = "pending" | "verified" | "rejected";

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
  verification_status: AlumniStatus;
  created_at: string;
};

function StatusBadge({ status }: { status: AlumniStatus }) {
  const styles =
    status === "verified"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
  onVerify,
  onReject,
  onDelete,
  loading,
}: {
  item: AlumniProfile;
  onView: () => void;
  onVerify: () => void;
  onReject: () => void;
  onDelete: () => void;
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
        onClick={onVerify}
        disabled={item.verification_status !== "pending" || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FiUserCheck />
        Verify
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={item.verification_status !== "pending" || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FiUserX />
        Reject
      </button>
      {item.verification_status === "rejected" ? (
        <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <FiX />
          Delete
        </button>
      ) : null}
    </div>
  );
}

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    action: "verify" | "reject" | "";
    alumniId: string;
    fullName: string;
  }>({ show: false, action: "", alumniId: "", fullName: "" });

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

  const totals = useMemo(() => {
    return alumni.reduce(
      (acc, item) => {
        if (item.verification_status === "pending") acc.pending += 1;
        if (item.verification_status === "verified") acc.verified += 1;
        if (item.verification_status === "rejected") acc.rejected += 1;
        return acc;
      },
      { pending: 0, verified: 0, rejected: 0 }
    );
  }, [alumni]);

  const filteredAlumni = alumni.filter((item) => {
    const haystack = `${item.full_name} ${item.email} ${item.programs?.join(" ") || ""} ${item.verification_status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const sortedAlumni = useMemo(() => {
    const normalize = (s: string) => String(s || "").toLowerCase().trim();
    const order: Record<string, number> = { pending: 0, verified: 1, rejected: 2 };
    return [...filteredAlumni].sort((a, b) => {
      const aKey = order[normalize(a.verification_status)] ?? 99;
      const bKey = order[normalize(b.verification_status)] ?? 99;
      if (aKey !== bKey) return aKey - bKey;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredAlumni]);

  const confirmAction = (message: string) => window.confirm(message);

  const openConfirmModal = (action: "verify" | "reject", alumniId: string, fullName: string) => {
    setConfirmModal({ show: true, action, alumniId, fullName });
  };

  const cancelConfirmModal = () => {
    setConfirmModal({ show: false, action: "", alumniId: "", fullName: "" });
  };

  const confirmModalYes = () => {
    const { action, alumniId } = confirmModal;
    cancelConfirmModal();
    if (!alumniId || !action) return;
    void updateStatus(alumniId, action === "verify" ? "verified" : "rejected");
  };

  const updateStatus = async (id: string, status: AlumniStatus) => {
    setUpdatingId(id);
    try {
      const result = await Fetch_to(
        "/services/supabase/alumni_profiles/update",
        {
          id,
          verification_status: status,
        }
      );

      if (result.success) {
        setAlumni((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, verification_status: status } : item
          )
        );
        if (selectedAlumni?.id === id) {
          setSelectedAlumni({ ...selectedAlumni, verification_status: status });
        }
        setToast({
          message: `Alumni profile ${status === "verified" ? "verified" : "rejected"} successfully!`,
          type: "success",
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({
          message: `Failed to update status: ${result.message}`,
          type: "error",
        });
        setTimeout(() => setToast(null), 3000);
        console.error("Failed to update status:", result.message);
      }
    } catch (error) {
      setToast({
        message: `Error updating status: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
      setTimeout(() => setToast(null), 3000);
      console.error("Error updating status:", error);
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
    <main className="min-h-screen bg-slate-100 p-6">
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
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Alumni Verification
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Verify Alumni Profiles
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Review and verify alumni profile submissions from Supabase.
              </p>
            </div>

            <div className="flex gap-3 lg:flex-col">
              <button
                onClick={fetchAlumni}
                disabled={fetching}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <FiRefreshCw className={fetching ? "animate-spin" : ""} />
                Refresh
              </button>
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
              placeholder="Search name, email, program, or status..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        {fetching ? (
          <div className="text-center py-12">
            <FiRefreshCw className="animate-spin mx-auto mb-3 text-blue-600" size={32} />
            <p className="text-slate-600">Loading alumni profiles...</p>
          </div>
        ) : (
          <>
            <section className="space-y-4 md:hidden">
              {sortedAlumni.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.full_name}</p>
                      <p className="mt-1 break-all text-sm text-slate-500">{item.email}</p>
                    </div>
                    <StatusBadge status={item.verification_status} />
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
                      onVerify={() => {
                        if (confirmAction(`Verify ${item.full_name}?`)) {
                          void updateStatus(item.id, "verified");
                        }
                      }}
                      onReject={() => {
                        if (confirmAction(`Reject ${item.full_name}?`)) {
                          void updateStatus(item.id, "rejected");
                        }
                      }}
                      onDelete={() => {
                        if (confirmAction(`Delete rejected alumni profile for ${item.full_name}? This cannot be undone.`)) {
                          void deleteAlumni(item.id);
                        }
                      }}
                      loading={updatingId === item.id}
                    />
                  </div>
                </article>
              ))}
            </section>

            <section className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Alumni Profiles ({sortedAlumni.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-230">
                  <thead className="bg-slate-50 text-left text-sm text-slate-600">
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
                          <StatusBadge status={item.verification_status} />
                        </td>
                        <td className="px-6 py-5">
                          <AlumniActions
                            item={item}
                            onView={() => setSelectedAlumni(item)}
                            onVerify={() => openConfirmModal("verify", item.id, item.full_name)}
                            onReject={() => openConfirmModal("reject", item.id, item.full_name)}
                            onDelete={() => {
                              if (confirmAction(`Delete rejected alumni profile for ${item.full_name}? This cannot be undone.`)) {
                                void deleteAlumni(item.id);
                              }
                            }}
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
                    Status: <span className="font-semibold"><StatusBadge status={selectedAlumni.verification_status} /></span>
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
                    onClick={() => openConfirmModal("verify", selectedAlumni.id, selectedAlumni.full_name)}
                    disabled={selectedAlumni.verification_status !== "pending" || updatingId === selectedAlumni.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                  >
                    <FiUserCheck />
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirmModal("reject", selectedAlumni.id, selectedAlumni.full_name)}
                    disabled={selectedAlumni.verification_status !== "pending" || updatingId === selectedAlumni.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <FiUserX />
                    Reject
                  </button>
                  {selectedAlumni.verification_status === "rejected" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmAction(`Delete rejected alumni profile for ${selectedAlumni.full_name}? This cannot be undone.`)) {
                          void deleteAlumni(selectedAlumni.id);
                        }
                      }}
                      disabled={updatingId === selectedAlumni.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      <FiX />
                      Delete
                    </button>
                  ) : null}
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
              {confirmModal.action === "verify" ? "Confirm Verify" : "Confirm Reject"}
            </h3>
            <p className="mt-4 text-sm text-slate-600">
              Are you sure you want to {confirmModal.action} {confirmModal.fullName}?
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
                className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
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
