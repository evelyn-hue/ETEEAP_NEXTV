"use client";
import { useEffect, useState, useMemo } from "react";
import { Fetch_to } from "@/utilities";
import {
  FileText,
  Eye,
  X,
  RefreshCw,
  Search,
  AlertCircle,
} from "lucide-react";

type ApplicationStatus =
  | "draft"
  | "Under Review"
  | "accepted"
  | "rejected"
  | "Approve"
  | "Reject"
  | "Delete"
  | "Pending"
  | "pending";

interface Application {
  id: string;
  email: string;
  applicantName: string;
  civil_status?: string;
  businessName?: string;
  isBusinessOwner?: string;
  program: string;
  form_status: ApplicationStatus;
  created_at: string;
  letterOfIntent?: string;
  resume?: string;
  picture?: string;
  [key: string]: string | undefined;
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const normalized = String(status).toLowerCase();
  const styles =
    normalized.includes("accept") || normalized === "accepted"
      ? "bg-green-100 text-green-800"
      : normalized.includes("reject")
      ? "bg-red-100 text-red-800"
      : normalized.includes("under review") || normalized.includes("pending")
      ? "bg-blue-100 text-blue-800"
      : normalized.includes("delete")
      ? "bg-slate-100 text-slate-700"
      : "bg-amber-100 text-amber-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "N/A"}</p>
    </div>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setFetching(true);
    try {
      const result = await Fetch_to("/services/supabase/form/retrieve-all", {});

      if (result.success && Array.isArray(result.data)) {
        setApplications(result.data as Application[]);
      } else {
        console.error("Failed to fetch applications:", result.message);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setFetching(false);
    }
  };
  const normalizeStatus = (status: string) => {
    const normalized = String(status).trim().toLowerCase();
    if (normalized.includes("under review") || normalized.includes("pending") || normalized.includes("pending review")) return "under review";
    if (normalized.includes("reject")) return "rejected";
    if (normalized.includes("delete")) return "delete";
    if (normalized.includes("accept") || normalized.includes("approve") || normalized.includes("approved")) return "accepted";
    if (normalized.includes("draft")) return "draft";
    return normalized;
  };

  const totals = useMemo(() => {
    return applications.reduce(
      (acc, item) => {
        const status = normalizeStatus(String(item.form_status));
        if (status === "draft") acc.draft += 1;
        if (status === "under review") acc.underReview += 1;
        if (status === "accepted") acc.accepted += 1;
        if (status === "rejected") acc.rejected += 1;
        return acc;
      },
      { draft: 0, underReview: 0, accepted: 0, rejected: 0 }
    );
  }, [applications]);

  const filteredApplications = applications.filter((item) => {
    const haystack = `${item.applicantName} ${item.email} ${item.program} ${item.form_status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const sortedApplications = useMemo(() => {
    // reuse outer normalizeStatus

    const statusOrder: Record<string, number> = {
      "under review": 0,
      rejected: 1,
      delete: 2,
      accepted: 3,
      draft: 4,
    };

    return [...filteredApplications].sort((a, b) => {
      const aStatus = statusOrder[normalizeStatus(a.form_status)] ?? 99;
      const bStatus = statusOrder[normalizeStatus(b.form_status)] ?? 99;
      if (aStatus !== bStatus) return aStatus - bStatus;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredApplications]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Application Management
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Verify Applications
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Review and manage all submitted applications from applicants.
              </p>
            </div>

            <button
              onClick={fetchApplications}
              disabled={fetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <RefreshCw className={fetching ? "animate-spin" : ""} size={16} />
              Refresh
            </button>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-amber-800">{totals.draft}</p>
                <p className="text-xs uppercase tracking-wide text-amber-700">Draft</p>
              </div>
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-800">{totals.underReview}</p>
                <p className="text-xs uppercase tracking-wide text-blue-700">Under Review</p>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-green-800">{totals.accepted}</p>
                <p className="text-xs uppercase tracking-wide text-green-700">Accepted</p>
              </div>
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-red-800">{totals.rejected}</p>
                <p className="text-xs uppercase tracking-wide text-red-700">Rejected</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="shrink-0 text-slate-500" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, program, or status..."
              className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        {/* Loading State */}
        {fetching ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-3 text-blue-600" size={32} />
            <p className="text-slate-600">Loading applications...</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <section className="space-y-4 md:hidden">
              {sortedApplications.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.applicantName}</h3>
                      <p className="text-xs text-slate-500">{item.email}</p>
                    </div>
                    <StatusBadge status={item.form_status} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-900">Program:</span> {item.program}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Submitted:</span>{" "}
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedApp(item)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </article>
              ))}
            </section>

            {/* Desktop Table View */}
            <section className="hidden overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Applications ({filteredApplications.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead className="bg-slate-50 text-left text-sm text-slate-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Applicant</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Program</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Submitted</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedApplications.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {item.applicantName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.program}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.form_status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedApp(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Modal - Application Details */}
        {selectedApp && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-0 py-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedApp(null);
            }}
          >
            <div className="w-full h-full rounded-none bg-white shadow-2xl overflow-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white z-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                    Application Details
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedApp.applicantName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedApp.email}</p>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 h-[calc(100vh-96px)] overflow-y-auto">
                {/* Application Information */}
                <section className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Application Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Detail label="Applicant Name" value={selectedApp.applicantName} />
                    <Detail label="Email" value={selectedApp.email} />
                    <Detail label="Civil Status" value={selectedApp.civil_status} />
                    <Detail label="Program" value={selectedApp.program} />
                    <Detail label="Status" value={selectedApp.form_status} />
                    <Detail label="Business Owner" value={selectedApp.isBusinessOwner} />
                    <Detail label="Business Name" value={selectedApp.businessName} />
                    <Detail
                      label="Submitted Date"
                      value={formatDate(selectedApp.created_at)}
                    />
                  </div>
                </section>

                {/* Documents Preview */}
                <section className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedApp)
                      .filter(
                        ([key, value]) =>
                          typeof value === "string" &&
                          (key.includes("Of") ||
                            key === "resume" ||
                            key === "picture" ||
                            key === "certificate" ||
                            key === "letterOfIntent") &&
                          value.startsWith("http")
                      )
                      .map(([key, value]) => (
                        <a
                          key={key}
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 truncate">
                            {key}
                          </span>
                        </a>
                      ))}
                  </div>
                </section>

                {/* Warning for Under Review */}
                {selectedApp.form_status === "Under Review" && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">
                        Application Under Review
                      </p>
                      <p className="text-sm text-amber-800">
                        This application is currently being reviewed by the verification team.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <a
                  href={`/form/civilstatus/${selectedApp.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Eye size={16} />
                  Full Review
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
