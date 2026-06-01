"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Fetch_to } from "@/utilities";
import imgSrc from "@/config/img_src.json";
import api_link from "@/config/api_link.json";
import { Myprofile } from "@/components/myprofile";

import { FaBars, FaEnvelope, FaFolder, FaTimes, FaUserCircle } from "react-icons/fa";
// import { LiaJenkins } from "react-icons/lia";

type Jwt_props = {
  showProfile: boolean;
  email: string;
}

export default function HeaderPage({ showProfile, email }: Jwt_props) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCompactWidth, setIsCompactWidth] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      setIsCompactWidth(window.innerWidth < 800);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!isCompactWidth) {
      setIsMobileNavOpen(false);
    }
  }, [isCompactWidth]);

  const handleProfileClick = () => {
    setProfileOpen((prev) => !prev);
    setNotificationOpen(false);
  };

  const handleSignOut = async() => {
    const response = await Fetch_to(api_link.jwt.deauth);
    if (response.success) {
      window.location.reload();
    }
  };

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT LOGOS */}
        <div className="flex items-center gap-4">
          {isCompactWidth ? (
            <button
              type="button"
              aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
            >
              {isMobileNavOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          ) : null}
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
        <nav className={`${isCompactWidth ? "hidden" : "block"} text-sm font-medium text-gray-700`}>
          <ul className="flex gap-8">
            <li onClick={() => { router.push("/"); }} className="cursor-pointer hover:text-blue-600">Home</li>
            <li onClick={() => { router.push("/overview"); }} className="cursor-pointer hover:text-blue-600">About</li>
            <li onClick={() => { router.push("/courses"); }} className="cursor-pointer hover:text-blue-600">Programs</li>
            <li onClick={() => { router.push("/alumni"); }} className="cursor-pointer hover:text-blue-600">Alumni</li>
            <li onClick={() => { router.push("/question"); }} className="cursor-pointer hover:text-blue-600">FAQ{"'"}s</li>
          </ul>
        </nav>

        

        {/* RIGHT SIDE */}
        <div className="relative flex items-center gap-4">

        {showProfile ? (
          <>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <FaEnvelope className="text-gray-600 text-xl cursor-pointer hover:text-blue-600" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border z-50">
                  <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Notifications</h2>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 border-b hover:bg-gray-50 transition">
                      <p className="text-sm text-gray-800">
                        Your application has been received.
                      </p>
                      <span className="text-xs text-gray-400">
                        May 31, 2026, 10:00 AM
                      </span>
                    </div>

                    <div className="p-4 border-b hover:bg-gray-50 transition">
                      <p className="text-sm text-gray-800">
                        Your submitted documents are ready for review.
                      </p>
                      <span className="text-xs text-gray-400">
                        May 31, 2026, 9:30 AM
                      </span>
                    </div>

                    <div className="p-4 hover:bg-gray-50 transition">
                      <p className="text-sm text-gray-800">
                        Please check your application status.
                      </p>
                      <span className="text-xs text-gray-400">
                        May 30, 2026, 4:15 PM
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <FaFolder
              className="text-gray-600 text-xl cursor-pointer hover:text-blue-600"
              onClick={() => {
                router.push("/form/draft");
              }}
            />
            <FaUserCircle
              onClick={handleProfileClick}
              className="text-gray-600 text-2xl cursor-pointer hover:text-blue-600"
            />

            {profileOpen && (
              <div className="absolute right-0 top-10 w-56 rounded-md border border-gray-200 bg-white p-4 text-sm shadow-lg">
                <p className="mb-3 truncate font-medium text-gray-700">
                  {email || "No email found"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="mb-2 w-full rounded-md bg-blue-600 px-3 py-2 text-left text-white hover:bg-blue-700"
                >
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </>
        ) : (
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
        )}
         
           
          
            

        </div>

      </div>

      {isCompactWidth && isMobileNavOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-[100dvh] w-[30dvw] min-w-[220px] bg-white shadow-2xl">
            <div className="flex h-full flex-col p-6 pt-24 text-sm font-medium text-gray-700">
              <button
                type="button"
                onClick={() => {
                  router.push("/");
                  setIsMobileNavOpen(false);
                }}
                className="py-3 text-left hover:text-blue-600"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/overview");
                  setIsMobileNavOpen(false);
                }}
                className="py-3 text-left hover:text-blue-600"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/courses");
                  setIsMobileNavOpen(false);
                }}
                className="py-3 text-left hover:text-blue-600"
              >
                Programs
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/alumni");
                  setIsMobileNavOpen(false);
                }}
                className="py-3 text-left hover:text-blue-600"
              >
                Alumni
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/question");
                  setIsMobileNavOpen(false);
                }}
                className="py-3 text-left hover:text-blue-600"
              >
                FAQ{"'"}s
              </button>
            </div>
          </aside>
        </>
      ) : null}

      {profileModalOpen ? (
        <Myprofile
          modal
          onClose={() => {
            setProfileModalOpen(false);
          }}
        />
      ) : null}
    </header>
  );
}
