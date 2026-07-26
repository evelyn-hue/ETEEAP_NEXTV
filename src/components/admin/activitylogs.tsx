"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import apiLink from "@/config/api_link.json";
import { Fetch_to } from "@/utilities";
import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

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
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-5">
        Admin Activity Log
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search activity..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearchSubmit();
          }}
          className="border px-3 py-2 rounded-lg shadow-sm flex-1 min-w-45"
        />

        <button
          type="button"
          onClick={onSearchSubmit}
          className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800"
        >
          Search
        </button>

        <select
          value={actionFilter}
          onChange={(event) => {
            setActionFilter(event.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded-lg shadow-sm min-w-35 w-full sm:w-auto"
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
          className="border px-3 py-2 rounded-lg shadow-sm min-w-35"
        />
      </div>

      {loading ? (
        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Loading logs...</div>
      ) : null}
      {!loading && error ? (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <table className="w-full min-w-175 text-left">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <motion.tbody className="bg-white" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            {filteredLogs.map((log) => (
              <motion.tr key={log.id} className="border-b hover:bg-gray-50 transition" variants={itemVariants}>
                <td className="p-3">{formatDate(log.created_at)}</td>
                <td className="p-3">{log.user || "-"}</td>
                <td className="p-3 font-semibold text-blue-700">{log.actions || "-"}</td>
                <td className="p-3">{log.details || "-"}</td>
              </motion.tr>
            ))}
            {!loading && filteredLogs.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-sm text-gray-500" colSpan={4}>
                  No activity logs found.
                </td>
              </tr>
            ) : null}
          </motion.tbody>
        </table>
      </div>

      <StaggerContainer className="md:hidden space-y-3">
        {filteredLogs.map((log) => (
          <StaggerItem key={log.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between mb-2 gap-3">
              <span className="font-semibold text-gray-600">Date:</span>
              <span className="text-right">{formatDate(log.created_at)}</span>
            </div>
            <div className="flex justify-between mb-2 gap-3">
              <span className="font-semibold text-gray-600">User:</span>
              <span className="text-right">{log.user || "-"}</span>
            </div>
            <div className="flex justify-between mb-2 gap-3">
              <span className="font-semibold text-gray-600">Action:</span>
              <span className="font-semibold text-blue-700 text-right">{log.actions || "-"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-600">Details:</span>
              <span className="text-right">{log.details || "-"}</span>
            </div>
          </StaggerItem>
        ))}
        {!loading && filteredLogs.length === 0 ? (
          <div className="border rounded-lg p-4 shadow-sm bg-white text-sm text-gray-500">
            No activity logs found.
          </div>
        ) : null}
      </StaggerContainer>

      <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-md border bg-white text-gray-700 disabled:opacity-50"
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            className={`px-4 py-2 rounded-md border ${
              pageNumber === page
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-gray-700"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md border bg-white text-gray-700 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
