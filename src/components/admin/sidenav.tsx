import Image from "next/image";
import Link from "next/link";
import {
  FiFileText,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

export default function Sidenav() {
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40">
        <div className="flex items-center justify-between h-20 px-4 border-b border-blue-700">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center shadow-md shrink-0">
              <Image src="/ETEEAP_LOGO.png" alt="Logo" width={70} height={70} />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
              <p className="text-xs text-blue-200">ETEEAP System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-700"
          >
            <FiHome size={20} />
            <span className="flex-1 font-medium">Dashboard</span>
          </Link>

          <Link
            href="/admin/application"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-700"
          >
            <FiFileText size={20} />
            <span className="flex-1 font-medium">Applications</span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              5
            </span>
          </Link>

          <Link
            href="/admin/activitylogs"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-700"
          >
            <FiUsers size={20} />
            <span className="flex-1 font-medium">Activity Logs</span>
          </Link>

          <Link
            href="/admin/setting"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-700"
          >
            <FiSettings size={20} />
            <span className="flex-1 font-medium">Settings</span>
          </Link>
        </nav>

        <div className="border-t border-blue-700 p-3">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors text-white font-medium"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <div className="transition-all duration-300 md:ml-64" />
    </>
  );
}
