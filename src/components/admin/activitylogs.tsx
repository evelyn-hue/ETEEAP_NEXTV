"use client";

import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

interface ActivityLog {
  id: number;
  date: string;
  user_id: number | null;
  user: string;
  role: string;
  action: string;
  details: string;
}

export default function AdminActivityLog() {
  const [search, setSearch] = useState<string>("");
  const [actionCategory, setActionCategory] =
    useState<string>("All");

  const [filterDate, setFilterDate] =
    useState<string>("");

  const [logs, setLogs] = useState<ActivityLog[]>(
    []
  );

  const [loading, setLoading] =
    useState<boolean>(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // Admin action categories
  const ADMIN_ACTIONS = [
    "accept",
    "reject",
    "verify",
    "unverify",
    "delete",
    "restore",
    "remark",
    "login",
    "logout",
    "update_profile",
    "update_profile_picture",
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/admin/activity-logs`,
        {
          headers: {
            "x-user-id":
              localStorage.getItem("userId") || "",
          },
        }
      );

      const safeLogs: ActivityLog[] = (
        response.data || []
      ).map((log: any) => ({
        id: log.id,
        date: log.date || "",
        user_id: log.user_id || null,
        user: log.user || "Unknown User",
        role: (
          log.role || ""
        ).toString().toLowerCase(),
        action: log.action || "",
        details: log.details || "",
      }));

      setLogs(safeLogs);
    } catch (err) {
      console.error(
        "Error fetching activity logs:",
        err
      );

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const m1 =
      log.user
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      log.action
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      log.details
        .toLowerCase()
        .includes(search.toLowerCase());

    const m3 = filterDate
      ? log.date.includes(filterDate)
      : true;

    let m5 = true;

    if (actionCategory === "accept") {
      m5 =
        /\baccept(ed)?\b/i.test(log.action) &&
        !/\breject(ed)?\b/i.test(log.action);
    } else if (
      actionCategory === "reject"
    ) {
      m5 =
        /\breject(ed)?\b/i.test(log.action) &&
        !/\baccept(ed)?\b/i.test(log.action);
    } else if (
      actionCategory === "verify"
    ) {
      m5 =
        /verify/i.test(log.action) &&
        !/unverify/i.test(log.action);
    } else if (
      actionCategory === "unverify"
    ) {
      m5 =
        /unverify|unverified/i.test(
          log.action
        );
    } else if (
      actionCategory === "delete"
    ) {
      m5 =
        /delete|removed|deleted/i.test(
          log.action
        );
    } else if (
      actionCategory === "restore"
    ) {
      m5 =
        /restore|restored/i.test(
          log.action
        );
    } else if (
      actionCategory === "remark"
    ) {
      m5 =
        /remark|remarked|add_document_remark/i.test(
          log.action
        );
    } else if (
      actionCategory === "login"
    ) {
      m5 =
        /\blogin\b|admin login/i.test(
          log.action
        );
    } else if (
      actionCategory === "logout"
    ) {
      m5 =
        /\blogout\b|admin logout/i.test(
          log.action
        );
    } else if (
      actionCategory ===
      "update_profile"
    ) {
      m5 =
        /update_profile|update profile/i.test(
          log.action
        );
    } else if (
      actionCategory ===
      "update_profile_picture"
    ) {
      m5 =
        /update_profile_picture|profile picture|update picture/i.test(
          log.action
        );
    }

    return m1 && m3 && m5;
  });

  if (loading) {
    return (
      <div className="p-4 text-center">
        Loading activity logs...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-5">
        Admin Activity Log
      </h2>

      {/* CONTROLS */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search activity..."
          className="border px-3 py-2 rounded-lg shadow-sm flex-1 min-w-[180px]"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          className="border px-3 py-2 rounded-lg shadow-sm min-w-[140px] w-full sm:w-auto"
          value={actionCategory}
          onChange={(e) =>
            setActionCategory(
              e.target.value
            )
          }
        >
          <option value="All">
            All Actions
          </option>

          <option value="accept">
            Accepted Applicant
          </option>

          <option value="reject">
            Rejected Applicant
          </option>

          <option value="verify">
            Verify
          </option>

          <option value="unverify">
            Unverify
          </option>

          <option value="delete">
            Deleted
          </option>

          <option value="restore">
            Restored
          </option>

          <option value="remark">
            Add Remark
          </option>

          <option value="login">
            Login
          </option>

          <option value="logout">
            Logout
          </option>

          <option value="update_profile">
            Update Profile
          </option>

          <option value="update_profile_picture">
            Update Profile Picture
          </option>
        </select>

        <input
          type="date"
          className="border px-3 py-2 rounded-lg shadow-sm min-w-[140px]"
          value={filterDate}
          onChange={(e) =>
            setFilterDate(e.target.value)
          }
        />
      </div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-3">
                Date
              </th>

              <th className="p-3">
                User
              </th>

              <th className="p-3">
                Action
              </th>

              <th className="p-3">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-gray-500"
                >
                  No matching activity found.
                </td>
              </tr>
            )}

            {filtered.map((log) => (
              <tr
                key={log.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  {log.date}
                </td>

                <td className="p-3">
                  {log.user}
                </td>

                <td className="p-3 font-semibold text-blue-700">
                  {log.action}
                </td>

                <td className="p-3">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}

      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="p-4 text-center text-gray-500 border rounded-lg">
            No matching activity found.
          </div>
        )}

        {filtered.map((log) => (
          <div
            key={log.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">
                Date:
              </span>

              <span>
                {log.date}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">
                User:
              </span>

              <span>
                {log.user}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-600">
                Action:
              </span>

              <span className="font-semibold text-blue-700">
                {log.action}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-600">
                Details:
              </span>

              <span className="text-right">
                {log.details}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}