"use client";

import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const courseComparison = [
  {
    course: "BSBA-HRM",
    applications: 148,
    alumni: 92,
  },
  {
    course: "BA-ELS",
    applications: 126,
    alumni: 84,
  },
  {
    course: "BSHM",
    applications: 138,
    alumni: 97,
  },
  {
    course: "BSBA-MM",
    applications: 112,
    alumni: 73,
  },
  {
    course: "BSIT",
    applications: 94,
    alumni: 58,
  },
];

const enrollmentTrend = [
  { year: "2021-2022", enrollment: 310, alumni: 76 },
  { year: "2022-2023", enrollment: 336, alumni: 84 },
  { year: "2023-2024", enrollment: 352, alumni: 92 },
  { year: "2024-2025", enrollment: 341, alumni: 97 },
  { year: "2025-2026", enrollment: 368, alumni: 105 },
];

const recentEnrollmentChange =
  enrollmentTrend[enrollmentTrend.length - 1].enrollment -
  enrollmentTrend[enrollmentTrend.length - 2].enrollment;

const recentEnrollmentChangeLabel =
  recentEnrollmentChange >= 0
    ? `+${recentEnrollmentChange}`
    : `${recentEnrollmentChange}`;

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Enrollment and Reports Overview
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-2">
            <div className="h-11 w-11 rounded-full border-2 border-blue-500 bg-blue-600" />
            <div className="hidden sm:block">
              <h4 className="font-semibold text-gray-900">Admin User</h4>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-blue-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-white p-3 text-blue-600">
                <FiFileText size={28} />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-500">
                <FiTrendingUp />
                +12%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Total Applications</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
          </div>

          <div className="rounded-xl bg-yellow-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-white p-3 text-yellow-600">
                <FiClock size={28} />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-red-500">
                <FiTrendingUp />
                -5%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Pending Review</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">45</p>
          </div>

          <div className="rounded-xl bg-green-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-white p-3 text-green-600">
                <FiCheckCircle size={28} />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-500">
                <FiTrendingUp />
                +8%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Approved</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">892</p>
          </div>

          <div className="rounded-xl bg-purple-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-white p-3 text-purple-600">
                <FiUsers size={28} />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-500">
                <FiTrendingUp />
                +3%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Verified Alumni</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">567</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Applications vs Alumni per Course
                </h2>
                <p className="text-sm text-gray-600">
                  Compare how many apply against how many become alumni.
                </p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseComparison} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="course" tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" name="Applications" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="alumni" name="Alumni" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Enrollment Trend by Academic Year
                </h2>
                <p className="text-sm text-gray-600">
                  Track whether enrollment is increasing or decreasing over time.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-wide text-blue-700">
                  Latest Change
                </p>
                <p className="text-sm font-semibold text-blue-800">
                  {recentEnrollmentChangeLabel}
                </p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="enrollment"
                    name="Enrollment"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alumni"
                    name="Alumni"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-blue-600 hover:bg-blue-50">
              <FiDownload />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Submitted application for ETEEAP Program
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                      pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">2 hours ago</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Jane Smith
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Application approved
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      approved
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">4 hours ago</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Mike Johnson
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Application rejected
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                      rejected
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">1 day ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
