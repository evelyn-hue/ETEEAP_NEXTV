"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import imgSrc from "@/config/img_src.json";
import { Myprofile } from "@/components/myprofile";
import { useAuth } from "@/context/AuthContext";
import { Fetch_to } from "@/utilities";

import { FaBars, FaEnvelope, FaTimes, FaUserCircle } from "react-icons/fa";
// import { LiaJenkins } from "react-icons/lia";

type Jwt_props = {
  showProfile: boolean;
  email: string;
}

export default function HeaderPage({ showProfile, email }: Jwt_props) {
  const router = useRouter();
  const { profilePicture, isLoggedIn } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCompactWidth, setIsCompactWidth] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; created_at: string; user: string; actions: string; details: string }>>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

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

  const fetchNotifications = async () => {
    if (!email) return;
    setNotificationsLoading(true);
    setNotificationError("");

    const response = await Fetch_to("/services/supabase/activity_logs", {
      mode: "list",
      user: email,
      page: 1,
      limit: 5,
    });

    if (response.success) {
      const payload = Array.isArray(response.data?.message) ? response.data.message : [];
      setNotifications(payload);
    } else {
      setNotifications([]);
      setNotificationError(response.message || "Unable to load notifications.");
    }

    setNotificationsLoading(false);
  };

  useEffect(() => {
    if (showProfile && email) {
      void fetchNotifications();
    }
  }, [showProfile, email]);

  const handleProfileClick = () => {
    setProfileOpen((prev) => !prev);
    setNotificationOpen(false);
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

        {showProfile && isLoggedIn ? (
          <>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => {
                  const nextOpen = !notificationOpen;
                  setNotificationOpen(nextOpen);
                  setProfileOpen(false);
                  if (nextOpen && email) {
                    void fetchNotifications();
                  }
                }}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <FaEnvelope className="text-gray-600 text-xl cursor-pointer hover:text-blue-600" />
                {notifications.length > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                ) : null}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border z-50">
                  <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Notifications</h2>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
                    ) : notificationError ? (
                      <div className="p-4 text-sm text-red-600">{notificationError}</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition">
                          <p className="text-sm font-medium text-gray-800">{notification.actions}</p>
                          <p className="mt-1 text-sm text-gray-600">{notification.details}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {profilePicture ? (
              <div key={profilePicture} className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer hover:border-blue-600 transition"
                onClick={handleProfileClick}
              >
                <Image
                  key={`profile-${profilePicture}`}
                  src={profilePicture}
                  alt="Profile picture"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <FaUserCircle
                onClick={handleProfileClick}
                className="text-gray-600 text-2xl cursor-pointer hover:text-blue-600"
              />
            )}

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
                  Account Info
                </button>
                <button
                  type="button"
                  onClick={() => {
                    router.push("/form/draft");
                    setProfileOpen(false);
                  }}
                  className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Drafts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    router.push("/form/civilstatus");
                    setProfileOpen(false);
                  }}
                  className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Application Status
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
          <aside className="fixed left-0 top-0 z-50 h-dvh w-[30dvw] min-w-55 bg-white shadow-2xl">
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
