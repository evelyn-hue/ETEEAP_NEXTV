"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiUsers,
} from "react-icons/fi";

import StaggerContainer from "@/components/shared/StaggerContainer";
import StaggerItem from "@/components/shared/StaggerItem";
import Reveal from "@/components/shared/Reveal";
import Skeleton from "@/components/shared/Skeleton";

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

function getActionColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("verified") || a.includes("verify") || a.includes("accepted") || a.includes("approve")) return "text-green-600";
  if (a.includes("rejected") || a.includes("reject") || a.includes("deleted") || a.includes("delete")) return "text-red-600";
  if (a.includes("under review") || a.includes("pending") || a.includes("draft")) return "text-amber-600";
  if (a.includes("login") || a.includes("logout")) return "text-slate-500";
  return "text-blue-600";
}

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
    <div className="min-h-screen bg-section-warm">

      <div className="p-4 sm:p-6">

        {/* Page Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Overview</p>
          <h1 className="mt-1.5 text-2xl font-bold text-slate-900 font-display">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Enrollment and Reports Overview</p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mb-8 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-surface-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* STATS */}
        <Reveal>
        <div className="mb-8 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">

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
        {!loading && <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* COURSE */}
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/30">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Analytics</p>
            <h2 className="text-lg font-bold text-slate-900 mt-1 mb-4">
              Applications vs Alumni
            </h2>

            <div className="h-72">
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
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/30">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Trends</p>
            <h2 className="text-lg font-bold text-slate-900 mt-1 mb-4">
              Enrollment Trend
            </h2>

            <div className="h-72">
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
        }

        {/* ACTIVITY TABLE */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/30 overflow-hidden">

          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Activity</p>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Recent Activities</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4 md:space-y-0">
              <Skeleton count={3} className="h-16 w-full rounded-xl md:h-12" />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-5 text-sm text-slate-400 text-center py-12">No recent activities.</div>
          ) : (
            <>
              <StaggerContainer>
                {/* Mobile card view */}
                <div className="md:hidden space-y-2 p-4">
                  {activities.map((a) => (
                    <StaggerItem key={a.id}>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-xs ${getActionColor(a.actions || "")}`}>{a.actions || "-"}</span>
                          <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs mt-1 text-slate-600">{a.details || "-"}</p>
                        <p className="text-xs mt-1 text-slate-400">{a.user || "-"}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">Details</th>
                        <th className="px-5 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((a) => (
                        <motion.tr
                          key={a.id}
                          variants={{
                            hidden: { opacity: 0, y: 16 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
                          }}
                          className="border-t border-slate-100 hover:bg-blue-50/40 transition-colors">
                            <td className="px-5 py-3.5 text-sm text-slate-700">{a.user}</td>
                            <td className={`px-5 py-3.5 text-sm font-medium ${getActionColor(a.actions || "")}`}>{a.actions}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-500">{a.details || "-"}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                          </motion.tr>
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
  const accentColors: Record<"blue" | "yellow" | "green" | "purple" | "teal", { border: string; icon: string }> = {
    blue: { border: "border-t-blue-500", icon: "bg-blue-50 text-blue-600" },
    yellow: { border: "border-t-amber-500", icon: "bg-amber-50 text-amber-600" },
    green: { border: "border-t-green-500", icon: "bg-green-50 text-green-600" },
    purple: { border: "border-t-purple-500", icon: "bg-purple-50 text-purple-600" },
    teal: { border: "border-t-teal-500", icon: "bg-teal-50 text-teal-600" },
  };

  return (
    <motion.div
      className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/30 border-t-4 ${accentColors[color].border}`}
      whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${accentColors[color].icon}`}>
        {icon}
      </div>
      <p className="text-slate-500 text-xs font-medium mt-4 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5"><AnimatedStat value={value} /></p>
    </motion.div>
  );
}