"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
  FiFileText,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiDownload,
  FiMoon,
  FiSun,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<
    RecentActivity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // GRAPH DATA
  const yearlyData = [
    { year: "2021", enrolled: 320, graduates: 180 },
    { year: "2022", enrolled: 450, graduates: 240 },
    { year: "2023", enrolled: 520, graduates: 310 },
    { year: "2024", enrolled: 610, graduates: 400 },
    { year: "2025", enrolled: 700, graduates: 480 },
  ];

  const monthlyApplicants = [
    { month: "Jan", applicants: 40 },
    { month: "Feb", applicants: 55 },
    { month: "Mar", applicants: 70 },
    { month: "Apr", applicants: 90 },
    { month: "May", applicants: 120 },
    { month: "Jun", applicants: 150 },
    { month: "Jul", applicants: 180 },
    { month: "Aug", applicants: 210 },
    { month: "Sep", applicants: 170 },
    { month: "Oct", applicants: 140 },
    { month: "Nov", applicants: 110 },
    { month: "Dec", applicants: 95 },
  ];

  const courseData = [
    { name: "BSCS", enrolled: 220, graduates: 150 },
    { name: "BSIT", enrolled: 310, graduates: 200 },
    { name: "BSBA", enrolled: 180, graduates: 120 },
    { name: "BSED", enrolled: 150, graduates: 100 },
  ];

  const COLORS = ["#2563eb", "#16a34a", "#ca8a04", "#9333ea"];

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const initializeData = async () => {
      setLoading(true);

      try {
        const mockStats: StatCard[] = [
          {
            title: "Total Applications",
            value: "1,234",
            icon: <FiFileText size={28} />,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            trend: { value: 12, isPositive: true },
          },
          {
            title: "Pending Review",
            value: "45",
            icon: <FiClock size={28} />,
            bgColor: "bg-yellow-50",
            iconColor: "text-yellow-600",
            trend: { value: 5, isPositive: false },
          },
          {
            title: "Approved",
            value: "892",
            icon: <FiCheckCircle size={28} />,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
            trend: { value: 8, isPositive: true },
          },
          {
            title: "Verified Alumni",
            value: "567",
            icon: <FiUsers size={28} />,
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            trend: { value: 3, isPositive: true },
          },
        ];

        const mockActivities: RecentActivity[] = [
          {
            id: "1",
            user: "John Doe",
            action: "Submitted application for ETEEAP Program",
            timestamp: "2 hours ago",
            status: "pending",
          },
          {
            id: "2",
            user: "Jane Smith",
            action: "Application approved",
            timestamp: "4 hours ago",
            status: "approved",
          },
          {
            id: "3",
            user: "Mike Johnson",
            action: "Application rejected",
            timestamp: "1 day ago",
            status: "rejected",
          },
          {
            id: "4",
            user: "Sarah Williams",
            action: "Submitted application for BSCS Program",
            timestamp: "2 days ago",
            status: "pending",
          },
        ];

        setStats(mockStats);
        setRecentActivities(mockActivities);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return darkMode
          ? "bg-yellow-900/30 text-yellow-300"
          : "bg-yellow-100 text-yellow-800";

      case "approved":
        return darkMode
          ? "bg-green-900/30 text-green-300"
          : "bg-green-100 text-green-800";

      case "rejected":
        return darkMode
          ? "bg-red-900/30 text-red-300"
          : "bg-red-100 text-red-800";

      default:
        return darkMode
          ? "bg-gray-700 text-gray-200"
          : "bg-gray-100 text-gray-800";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`rounded-full h-16 w-16 border-4 ${
            darkMode
              ? "border-blue-400 border-t-blue-600"
              : "border-blue-200 border-t-blue-600"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 border-b shadow-sm ${
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="px-6 py-4 flex justify-between items-center">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">

            <div>
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dashboard
              </h1>

              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Enrollment and Reports Overview
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* DARK MODE */}
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-lg transition-all ${
                darkMode
                  ? "bg-gray-700 text-yellow-400"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* ADMIN PROFILE */}
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Admin"
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
              />

              <div className="hidden sm:block">
                <h4
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Admin User
                </h4>

                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Super Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* MAIN CONTENT */}
      <motion.div
        className="p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className={`rounded-xl p-6 shadow-sm ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : `${stat.bgColor}`
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } ${stat.iconColor}`}
                >
                  {stat.icon}
                </div>

                {stat.trend && (
                  <div
                    className={`text-sm font-semibold flex items-center gap-1 ${
                      stat.trend.isPositive
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    <FiTrendingUp />
                    {stat.trend.isPositive ? "+" : "-"}
                    {Math.abs(stat.trend.value)}%
                  </div>
                )}
              </div>

              <h3
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stat.title}
              </h3>

              <p
                className={`text-3xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* YEARLY */}
          <div
            className={`rounded-xl p-6 shadow-sm ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Academic Year Reports
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="enrolled"
                  stroke="#2563eb"
                  strokeWidth={3}
                />

                <Line
                  type="monotone"
                  dataKey="graduates"
                  stroke="#16a34a"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* MONTHLY */}
          <div
            className={`rounded-xl p-6 shadow-sm ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Monthly Applicants
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyApplicants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="applicants"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COURSE REPORTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* BAR */}
          <div
            className={`rounded-xl p-6 shadow-sm ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Per Course Reports
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="enrolled"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="graduates"
                  fill="#16a34a"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE */}
          <div
            className={`rounded-xl p-6 shadow-sm ${
              darkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Enrollment Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseData}
                  dataKey="enrolled"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {courseData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
                {/* RECENT ACTIVITIES */}
        <div
          className={`rounded-xl overflow-hidden shadow-sm ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white"
          }`}
        >
          <div
            className={`p-6 border-b flex justify-between items-center ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Activities
            </h2>

            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                darkMode
                  ? "text-blue-400 hover:bg-gray-700"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <FiDownload />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={`${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
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
                {recentActivities.map((activity, index) => (
                  <motion.tr
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-t transition ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700/40"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* USER */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {activity.user.charAt(0)}
                        </div>

                        <div>
                          <p
                            className={`font-medium ${
                              darkMode
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {activity.user}
                          </p>

                          <p
                            className={`text-xs ${
                              darkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            Applicant
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td
                      className={`px-6 py-4 text-sm ${
                        darkMode
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {activity.action}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                          activity.status
                        )}`}
                      >
                        {activity.status}
                      </span>
                    </td>

                    {/* TIME */}
                    <td
                      className={`px-6 py-4 text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {activity.timestamp}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div
            className={`px-6 py-4 border-t flex justify-between items-center ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Showing latest activities
            </p>

            <button
              className={`text-sm font-medium transition ${
                darkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              View all activities →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;