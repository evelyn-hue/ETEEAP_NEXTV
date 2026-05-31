import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Enrollment and Reports Overview
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100">
            <div className="w-11 h-11 rounded-full bg-blue-600 border-2 border-blue-500" />
            <div className="hidden sm:block">
              <h4 className="font-semibold text-gray-900">Admin User</h4>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-sm bg-blue-50">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 rounded-lg bg-white text-blue-600">
                <FiFileText size={28} />
              </div>
              <div className="text-sm font-semibold flex items-center gap-1 text-green-500">
                <FiTrendingUp />
                +12%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Total Applications</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">1,234</p>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-yellow-50">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 rounded-lg bg-white text-yellow-600">
                <FiClock size={28} />
              </div>
              <div className="text-sm font-semibold flex items-center gap-1 text-red-500">
                <FiTrendingUp />
                -5%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Pending Review</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">45</p>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-green-50">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 rounded-lg bg-white text-green-600">
                <FiCheckCircle size={28} />
              </div>
              <div className="text-sm font-semibold flex items-center gap-1 text-green-500">
                <FiTrendingUp />
                +8%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Approved</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">892</p>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-purple-50">
            <div className="flex justify-between items-center mb-4">
              <div className="p-3 rounded-lg bg-white text-purple-600">
                <FiUsers size={28} />
              </div>
              <div className="text-sm font-semibold flex items-center gap-1 text-green-500">
                <FiTrendingUp />
                +3%
              </div>
            </div>
            <h3 className="text-sm text-gray-600">Verified Alumni</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">567</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Academic Year Reports
            </h2>
            <div className="h-72 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
              Chart preview
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Monthly Applicants
            </h2>
            <div className="h-72 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
              Chart preview
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Activities
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50">
              <FiDownload />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600">
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
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    John Doe
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Submitted application for ETEEAP Program
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">2 hours ago</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Jane Smith
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Application approved
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      approved
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">4 hours ago</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Mike Johnson
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Application rejected
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      rejected
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">1 day ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
