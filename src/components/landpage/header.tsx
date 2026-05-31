"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import imgSrc from "@/config/img_src.json";

import { FaEnvelope, FaFolder, FaUserCircle } from "react-icons/fa";

export default function HeaderPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT LOGOS */}
        <div className="flex items-center gap-4">
          <Image
            src={imgSrc.lccblogo}
            alt="LCCB Logo"
            width={65}
            height={65}
            className="object-contain"
          />

          <Image
            src={imgSrc.eteeapLogo}
            alt="ETEEAP Logo"
            width={65}
            height={65}
            className="object-contain"
          />
        </div>

        {/* CENTER NAVIGATION */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/overview" className="hover:text-blue-600">About</Link>
          <Link href="/courses" className="hover:text-blue-600">Programs</Link>
          <Link href="/alumni" className="hover:text-blue-600">Alumni</Link>
          <Link href="/question" className="hover:text-blue-600">FAQ's</Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {!user ? (
            <>
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-blue-600 text-sm font-medium"
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <FaEnvelope className="text-gray-600 text-xl cursor-pointer hover:text-blue-600" />
              <FaFolder className="text-gray-600 text-xl cursor-pointer hover:text-blue-600" />
              <FaUserCircle className="text-gray-600 text-2xl cursor-pointer hover:text-blue-600" />
            </>
          )}

        </div>

      </div>
    </header>
  );
}