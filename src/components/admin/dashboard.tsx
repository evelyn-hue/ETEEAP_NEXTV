"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiUsers,
} from "react-icons/fi";

import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

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

import Fetch_to from "@/utilities/Fetch_to";

type Statistics = {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  pendingAlumni: number;
  verifiedAlumni: number;
  totalAlumni: number;
};

type CourseData = {
  course: string;
  courseAbbrev?: string;
  applications: number;
  alumni: number;
  lastUpdated?: string | null;
};

type EnrollmentData = {
  year: string;
  enrollment: number;
  alumni: number;
};

type Activity = {
  id: number;
  user: string;
  actions: string;
  details: string;
  created_at: string;
};

export default function Dashboard() {
  const [statistics, setStatistics] = useState<Statistics>({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    pendingAlumni: 0,
    verifiedAlumni: 0,
    totalAlumni: 0,
  });

  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const [statsRes, courseRes, enrollRes, activityRes] =
          await Promise.all([
            Fetch_to("/services/supabase/dashboard/statistics", {}),
            Fetch_to("/services/supabase/dashboard/course-comparison", {}),
            Fetch_to("/services/supabase/dashboard/enrollment-trend", {}),
            Fetch_to("/services/supabase/activity_logs", {
              mode: "list",
              page: 1,
              limit: 10,
            }),
          ]);

        if (statsRes.success) {
          setStatistics(statsRes.data?.data || statsRes.data);
        }

        if (courseRes.success) {
          setCourseData(courseRes.data?.data || courseRes.data);
        }

        if (enrollRes.success) {
          setEnrollmentData(enrollRes.data?.data || enrollRes.data);
        }

        if (activityRes.success) {
          const allActivities = activityRes.data?.message || activityRes.data || [];
          setActivities(
            Array.isArray(allActivities)
              ? allActivities
                  .filter((activity) => {
                    const userValue = String(activity.user ?? "").toLowerCase();
                    return userValue.includes("admin");
                  })
                  .slice(0, 5)
              : []
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between pl-20 pr-6 py-4 md:px-6">
          <div>
            <SectionHeading level="h1">Dashboard</SectionHeading>
            <p className="text-sm text-gray-600">
              Enrollment and Reports Overview
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-2">
            <div className="h-11 w-11 rounded-full bg-blue-600" />
            <div>
              <h4 className="font-semibold">Admin User</h4>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">

        {/* LOADING */}
        {loading && (
          <p className="mb-4 text-gray-600">Loading dashboard...</p>
        )}

        {/* STATS */}
        <Reveal>
        <div className="mb-8 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">

          <StatCard
            icon={<FiFileText />}
            label="Total Applicants"
            value={statistics.totalApplications}
            color="blue"
          />

          <StatCard
            icon={<FiClock />}
            label="Pending Review"
            value={statistics.pendingReview}
            color="yellow"
          />

          <StatCard
            icon={<FiCheckCircle />}
            label="Approved"
            value={statistics.approved}
            color="green"
          />

          <StatCard
            icon={<FiClock />}
            label="Pending Alumni"
            value={statistics.pendingAlumni}
            color="yellow"
          />

          <StatCard
            icon={<FiUsers />}
            label="Verified Alumni"
            value={statistics.verifiedAlumni}
            color="purple"
          />

          <StatCard
            icon={<FiUsers />}
            label="Total Alumni"
            value={statistics.totalAlumni}
            color="teal"
          />
        </div>
        </Reveal>

        {/* CHARTS */}
        <div className="mb-8 grid gap-6 xl:grid-cols-2">

          {/* COURSE */}
          <div className="rounded-xl bg-white p-6">
            <h2 className="font-bold text-xl mb-4">
              Applications vs Alumni
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;

                      const data = payload[0].payload as CourseData;
                      const formattedDate = data.lastUpdated
                        ? new Date(data.lastUpdated).toLocaleDateString()
                        : "No date";
                      const shortLabel = data.courseAbbrev || data.course;

                      return (
                        <div className="rounded-xl bg-white p-3 shadow-lg border border-slate-200">
                          <p className="font-semibold text-slate-900">{shortLabel}</p>
                          <p className="text-xs text-slate-500">Last updated: {formattedDate}</p>
                          {payload.map((entry) => {
                            const label = String(entry.name ?? entry.dataKey ?? "");

                            return (
                              <p key={String(entry.dataKey)} className="text-sm text-slate-700">
                                <span className="font-semibold">{label}:</span> {entry.value}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="applications" name="applications" fill="#2563eb" />
                  <Bar dataKey="alumni" name="alumni" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ENROLLMENT */}
          <div className="rounded-xl bg-white p-6">
            <h2 className="font-bold text-xl mb-4">
              Enrollment Trend
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="enrollment"
                    stroke="#0f172a"
                  />
                  <Line
                    type="monotone"
                    dataKey="alumni"
                    stroke="#16a34a"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ACTIVITY TABLE */}
        <div className="rounded-xl bg-white p-6">

          <div className="flex justify-between border-b pb-4">
            <h2 className="font-bold text-xl">
              Recent Activities
            </h2>

            <button className="flex items-center gap-2 text-blue-600">
              <FiDownload />
              Export
            </button>
          </div>

          {loading ? (
            <p className="mt-4 text-gray-600 text-sm">Loading activities...</p>
          ) : activities.length === 0 ? (
            <p className="mt-4 text-gray-500 text-sm">No recent activities.</p>
          ) : (
            <>
              <StaggerContainer>
                {/* Mobile card view */}
                <div className="md:hidden space-y-3 mt-4">
                  {activities.map((a) => (
                    <StaggerItem key={a.id}>
                      <div className="bg-gray-50 rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-blue-700">{a.actions || "-"}</span>
                          <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-600">{a.details || "-"}</p>
                        <p className="text-xs mt-1 text-gray-400">{a.user || "-"}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto mt-4">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="pb-2">User</th>
                        <th className="pb-2">Action</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((a) => (
                        <StaggerItem key={a.id}>
                          <tr className="border-t">
                            <td className="py-3 pr-4 text-sm">{a.user}</td>
                            <td className="py-3 pr-4 text-sm">{a.actions}</td>
                            <td className="py-3 pr-4">
                              <span className="text-xs px-2 py-1 rounded bg-gray-200 whitespace-nowrap">
                                {a.details || "-"}
                              </span>
                            </td>
                            <td className="py-3 text-gray-500 text-sm whitespace-nowrap">
                              {new Date(a.created_at).toLocaleString()}
                            </td>
                          </tr>
                        </StaggerItem>
                      ))}
                    </tbody>
                  </table>
                </div>
              </StaggerContainer>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* SMALL COMPONENTS */
function AnimatedStat({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(() => Math.round(count.get()));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: [0.25, 0.1, 0.25, 1] });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "yellow" | "green" | "purple" | "teal";
};

function StatCard({
  icon,
  label,
  value,
  color,
}: StatCardProps) {
  const colors: Record<"blue" | "yellow" | "green" | "purple" | "teal", string> = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/30">
      <div className={`inline-block p-3 rounded ${colors[color]}`}>
        {icon}
      </div>

      <h3 className="text-gray-600 text-sm mt-3">{label}</h3>
      <p className="text-3xl font-bold"><AnimatedStat value={value} /></p>
    </div>
  );
}