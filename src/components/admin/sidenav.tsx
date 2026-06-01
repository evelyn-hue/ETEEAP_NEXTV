"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiFileText, FiHome, FiLogOut, FiMenu, FiSettings, FiUsers, FiX } from "react-icons/fi";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/application", label: "Applications", icon: FiFileText, badge: "5" },
  { href: "/admin/adminalumni", label: "Alumni", icon: FiFileText, badge: "5" },
  { href: "/admin/activitylogs", label: "Activity Logs", icon: FiUsers },
  { href: "/admin/setting", label: "Settings", icon: FiSettings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-blue-700"
          >
            <Icon size={20} />
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarShell({ onNavigate }: { onNavigate?: () => void }) {
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

      <NavLinks onNavigate={onNavigate} />

      <div className="border-t border-blue-700 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}

export default function Sidenav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex items-center justify-center rounded-xl bg-blue-900 p-3 text-white shadow-lg md:hidden"
        aria-label="Open navigation"
      >
        <FiMenu size={22} />
      </button>

      <div className="hidden md:fixed md:left-0 md:top-0 md:z-40 md:block md:h-screen">
        <SidebarShell />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <SidebarShell onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="md:ml-64" />
    </>
  );
}
