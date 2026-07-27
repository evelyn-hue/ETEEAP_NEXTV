"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiFileText, FiHome, FiLogOut, FiMenu, FiUsers, FiX } from "react-icons/fi";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Fetch_to } from "@/utilities";
import { useAuth } from "@/context/AuthContext";
import api_link from "@/config/api_link.json";

type NavItem = {
  href: string;
  label: string;
  icon: typeof FiHome;
  badge?: number;
};

const MotionLink = motion.create(Link);

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
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <MotionLink
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative flex items-center rounded-lg px-4 py-2.5 transition-all duration-200 ${
              isActive
                ? "bg-white/15 border-l-2 border-white/80"
                : "hover:bg-white/10"
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon size={18} className={isActive ? "text-white" : "text-blue-200"} />
              <span className={`text-sm font-medium ${isActive ? "text-white" : "text-blue-100"}`}>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{item.badge}</span>
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
    <aside className="flex h-full w-64 flex-col bg-linear-to-b from-blue-900 to-blue-800 text-white shadow-xl">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div className="shrink-0">
          <Image src="/ETEEAP_LOGO.png" alt="Logo" width={44} height={44} className="rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold leading-tight">Admin Panel</h1>
          <p className="text-[11px] text-blue-300/80">ETEEAP System</p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 md:hidden"
            aria-label="Close navigation"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      <NavLinks onNavigate={onNavigate} counts={counts} />

      <div className="border-t border-white/10 p-3">
        <button
          onClick={onLogoutConfirm}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-white/10 cursor-pointer"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default function Sidenav() {
  const reduced = useReducedMotion();
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
        className="fixed left-4 top-4 z-[60] inline-flex items-center justify-center rounded-xl bg-blue-900 p-2.5 text-white shadow-lg md:hidden hover:bg-blue-800 transition-colors"
        aria-label="Open navigation"
      >
        <FiMenu size={20} />
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
              initial={reduced ? undefined : { x: "-100%" }}
              animate={reduced ? undefined : { x: 0 }}
              exit={reduced ? undefined : { x: "-100%" }}
              transition={reduced ? undefined : { type: "spring", damping: 28, stiffness: 250 }}
              className="absolute left-0 top-0 h-full shadow-2xl"
            >
              <SidebarShell onNavigate={() => setOpen(false)} counts={counts} onLogoutConfirm={() => setShowLogoutConfirm(true)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div
            initial={reduced ? undefined : { scale: 0.95, opacity: 0 }}
            animate={reduced ? undefined : { scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/30"
          >
            <h2 className="text-lg font-bold text-slate-900">Confirm Logout</h2>
            <p className="mt-1.5 text-sm text-slate-500">Are you sure you want to logout?</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await handleLogout();
                }}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      <div className="md:ml-64" />
    </>
  );
}
