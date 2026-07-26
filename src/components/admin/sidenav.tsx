"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiFileText, FiHome, FiLogOut, FiMenu, FiUsers, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Fetch_to } from "@/utilities";
import { useAuth } from "@/context/AuthContext";
import api_link from "@/config/api_link.json";

type NavItem = {
  href: string;
  label: string;
  icon: typeof FiHome;
  badge?: number;
};

const MotionLink = motion(Link);

function SidenavNavItems({
  counts,
  onNavigate,
}: {
  counts: { pendingApplications: number; pendingAlumni: number };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: FiHome },
    { href: "/admin/application", label: "Applications", icon: FiFileText, badge: counts.pendingApplications },
    { href: "/admin/adminalumni", label: "Alumni", icon: FiFileText, badge: counts.pendingAlumni },
    { href: "/admin/activitylogs", label: "Activity Logs", icon: FiUsers },
  ];

  return (
    <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <MotionLink
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            whileHover={{ scale: 1.02 }}
            className="relative flex items-center rounded-xl px-4 py-3 transition-all duration-200 hover:bg-blue-700"
          >
            {isActive && (
              <motion.div data-layout-id="activeNav" className="absolute inset-0 rounded-xl bg-blue-700" />
            )}
            <span className="relative z-10 flex items-center gap-3 min-w-0">
              <Icon size={20} />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              ) : null}
            </span>
          </MotionLink>
        );
      })}
    </nav>
  );
}

function NavLinks({ onNavigate, counts }: { onNavigate?: () => void; counts: { pendingApplications: number; pendingAlumni: number } }) {
  return (
    <SidenavNavItems counts={counts} onNavigate={onNavigate} />
  );
}

function SidebarShell({ onNavigate, counts, onLogoutConfirm }: { onNavigate?: () => void; counts: { pendingApplications: number; pendingAlumni: number }; onLogoutConfirm: () => void }) {
  return (
    <aside className="flex h-full w-64 flex-col bg-linear-to-b from-blue-900 to-blue-800 text-white">
      <div className="flex h-20 items-center justify-between border-b border-blue-700 px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="shrink-0">
            <Image src="/ETEEAP_LOGO.png" alt="Logo" width={70} height={70} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
            <p className="text-xs text-blue-200">ETEEAP System</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigate}
          className="rounded-full p-2 text-white hover:bg-blue-700 md:hidden"
          aria-label="Close navigation"
        >
          <FiX size={20} />
        </button>
      </div>

      <NavLinks onNavigate={onNavigate} counts={counts} />

      <div className="border-t border-blue-700 p-3">
        <button
          onClick={onLogoutConfirm}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 cursor-pointer"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default function Sidenav() {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ pendingApplications: 0, pendingAlumni: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      const response = await Fetch_to("/services/supabase/dashboard/statistics", {});
      const payload = response.data?.data || response.data || {};
      if (response.success) {
        setCounts({
          pendingApplications: Number(payload.pendingReview ?? 0),
          pendingAlumni: Number(payload.pendingAlumni ?? 0),
        });
      }
    };

    void loadCounts();
  }, []);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await Fetch_to(api_link.jwt.deauth);
    } finally {
      logout();
      router.push("/auth/signin");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-[60] inline-flex items-center justify-center rounded-xl bg-blue-900 p-3 text-white shadow-lg md:hidden"
        aria-label="Open navigation"
      >
        <FiMenu size={22} />
      </button>

      <div className="hidden md:fixed md:left-0 md:top-0 md:z-40 md:block md:h-screen">
        <SidebarShell counts={counts} onLogoutConfirm={() => setShowLogoutConfirm(true)} />
      </div>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full"
            >
              <SidebarShell onNavigate={() => setOpen(false)} counts={counts} onLogoutConfirm={() => setShowLogoutConfirm(true)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Confirm Logout</h2>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to logout?</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await handleLogout();
                }}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="md:ml-64" />
    </>
  );
}
