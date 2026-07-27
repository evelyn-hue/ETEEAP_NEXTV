"use client";

import { useEffect, useMemo, useState } from "react";
import apiLink from "@/config/api_link.json";
import { Fetch_to } from "@/utilities";
import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";
import Reveal from "@/components/shared/Reveal";
import Skeleton from "@/components/shared/Skeleton";

type ActivityRow = {
  id: number;
  created_at: string;
  user: string;
  actions: string;
  details: string;
};

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function getActionColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("verified") || a.includes("verify") || a.includes("accepted") || a.includes("approve")) return "text-green-600";
  if (a.includes("rejected") || a.includes("reject") || a.includes("deleted") || a.includes("delete")) return "text-red-600";
  if (a.includes("under review") || a.includes("pending") || a.includes("draft")) return "text-amber-600";
  if (a.includes("login") || a.includes("logout")) return "text-slate-500";
  return "text-blue-600";
}

const actionOptions = [
  "All Actions",
  "Deleted Applicant",
  "Restored Applicant",
  "Accepted Applicant",
  "Rejected Applicant",
  "Under Review Applicant",
  "Draft Applicant",
  "Verify Document",
  "Reject Document",
  "Update Document",
  "Login",
  "Logout",
  "Update Profile",
  "Update Profile Picture",
];

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<ActivityRow[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    const response = await Fetch_to(apiLink.activity_logs, {
      mode: "list",
      search,
      action: actionFilter,
      date: dateFilter,
      page,
      limit: 20,
    });

    if (!response.success) {
      setError(response.message || "Failed to fetch activity logs.");
      setLogs([]);
      setLoading(false);
      return;
    }

    const payload = Array.isArray(response.data?.message) ? response.data.message : [];
    setLogs(payload as ActivityRow[]);
    setTotalPages(response.data?.pagination?.totalPages ?? 1);
    setLoading(false);
  };

  useEffect(() => {
    void fetchLogs();
  }, [page, actionFilter, dateFilter]);

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;

    return logs.filter((item) => {
      const haystack = `${item.user} ${item.actions} ${item.details}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, search]);

  const onSearchSubmit = () => {
    setPage(1);
    void fetchLogs();
  };

  return (
    <div className="min-h-screen bg-section-warm p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Logs</p>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-900 font-display">Admin Activity Log</h1>
          <p className="mt-1 text-sm text-slate-500">Track all actions and changes made in the system.</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/30 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 ring-1 ring-transparent focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all">
              <input
                type="text"
                placeholder="Search activity..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearchSubmit();
                }}
                className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={onSearchSubmit}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <select
              value={actionFilter}
              onChange={(event) => {
                setActionFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block rounded-xl bg-white shadow-sm ring-1 ring-slate-200/30 overflow-hidden">
              <div className="px-5 py-4 bg-blue-800"><Skeleton className="h-5 w-96 bg-white/20" /></div>
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-6">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-4 bg-white shadow-sm">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </>
        ) : null}
        {!loading && error ? (
          <div className="mb-4 rounded-xl bg-red-50 p-5 text-sm font-semibold text-red-700 ring-1 ring-red-200">{error}</div>
        ) : null}
        {!loading && <>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/30">
        <Reveal>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-5 py-4 text-sm font-semibold">Date</th>
                <th className="px-5 py-4 text-sm font-semibold">User</th>
                <th className="px-5 py-4 text-sm font-semibold">Action</th>
                <th className="px-5 py-4 text-sm font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-blue-50/40">
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(log.created_at)}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{log.user || "-"}</td>
                  <td className={`px-5 py-4 text-sm font-semibold ${getActionColor(log.actions || "")}`}>{log.actions || "-"}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{log.details || "-"}</td>
                </tr>
              ))}
              {!loading && filteredLogs.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-400" colSpan={4}>
                    No activity logs found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        </Reveal>

        <Reveal>
        <StaggerContainer className="md:hidden space-y-2 p-4">
          {filteredLogs.map((log) => (
            <StaggerItem key={log.id} className="rounded-xl border border-slate-100 p-4 bg-white shadow-sm">
              <div className="flex justify-between mb-1.5 gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase">Date</span>
                <span className="text-xs text-right text-slate-600">{formatDate(log.created_at)}</span>
              </div>
              <div className="flex justify-between mb-1.5 gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase">User</span>
                <span className="text-xs text-right text-slate-600">{log.user || "-"}</span>
              </div>
              <div className="flex justify-between mb-1.5 gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase">Action</span>
                <span className={`text-xs font-semibold ${getActionColor(log.actions || "")} text-right`}>{log.actions || "-"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase">Details</span>
                <span className="text-xs text-right text-slate-600">{log.details || "-"}</span>
              </div>
            </StaggerItem>
          ))}
          {!loading && filteredLogs.length === 0 ? (
            <div className="rounded-xl border border-slate-100 p-6 text-center text-sm text-slate-400">
              No activity logs found.
            </div>
          ) : null}
        </StaggerContainer>
        </Reveal>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pageNumber === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            &gt;
          </button>
        </div>
        </div>
        </>}
      </div>
    </div>
  );
}
