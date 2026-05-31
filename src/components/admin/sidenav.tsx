"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiFileText,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidenavProps {
  onLogout?: () => void;
}

const Sidenav: React.FC<SidenavProps> = ({ onLogout }) => {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <FiHome size={20} />,
    },
    {
      label: "Applications",
      href: "/admin/application",
      icon: <FiFileText size={20} />,
      badge: 5,
    },
    {
      label: "Activity Logs",
      href: "/admin/activitylogs",
      icon: <FiUsers size={20} />,
    },
    {
      label: "Settings",
      href: "/admin/setting",
      icon: <FiSettings size={20} />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
  };

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-800 text-white md:hidden"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* SIDENAV */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-linear-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-20"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-blue-700">
          {/* LOGO + TITLE */}
          <div className="flex items-center gap-2 overflow-hidden">
            {/* LOGO */}
            <div className="flex items-center justify-center shadow-md shrink-0">

              {/* Example image logo:*/}
              <Image
                src="/ETEEAP_LOGO.png"
                alt="Logo"
                width="70"
                height="70"
              />
            </div>

            {/* TITLE */}
            {isOpen && (
              <div>
                <h1 className="text-lg font-bold leading-tight">
                  Admin Panel
                </h1>

                <p className="text-xs text-blue-200">
                  ETEEAP System
                </p>
              </div>
            )}
          </div>

          {/* DESKTOP TOGGLE */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex p-2 hover:bg-blue-700 rounded-md transition-colors"
          >
            {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-blue-600 shadow-lg"
                  : "hover:bg-blue-700"
              }`}
              title={!isOpen ? item.label : ""}
            >
              <span className="shrink-0">{item.icon}</span>

              {isOpen && (
                <>
                  <span className="flex-1 font-medium">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="border-t border-blue-700 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors text-white font-medium"
          >
            <FiLogOut size={20} />

            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* CONTENT SPACER */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "md:ml-64" : "md:ml-20"
        }`}
      />
    </>
  );
};

export default Sidenav;