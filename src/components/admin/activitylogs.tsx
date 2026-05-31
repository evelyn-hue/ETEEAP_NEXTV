export default function AdminActivityLog() {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-5">
        Admin Activity Log
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search activity..."
          className="border px-3 py-2 rounded-lg shadow-sm flex-1 min-w-[180px]"
        />

        <select className="border px-3 py-2 rounded-lg shadow-sm min-w-[140px] w-full sm:w-auto">
          <option>All Actions</option>
          <option>Accepted Applicant</option>
          <option>Rejected Applicant</option>
          <option>Verify</option>
          <option>Unverify</option>
          <option>Deleted</option>
          <option>Restored</option>
          <option>Add Remark</option>
          <option>Login</option>
          <option>Logout</option>
          <option>Update Profile</option>
          <option>Update Profile Picture</option>
        </select>

        <input
          type="date"
          className="border px-3 py-2 rounded-lg shadow-sm min-w-[140px]"
        />
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="border-b hover:bg-gray-50 transition">
              <td className="p-3">2026-05-31</td>
              <td className="p-3">Admin User</td>
              <td className="p-3 font-semibold text-blue-700">
                Login
              </td>
              <td className="p-3">Admin signed in to the dashboard.</td>
            </tr>
            <tr className="border-b hover:bg-gray-50 transition">
              <td className="p-3">2026-05-31</td>
              <td className="p-3">Registrar</td>
              <td className="p-3 font-semibold text-blue-700">
                Accepted Applicant
              </td>
              <td className="p-3">Application status was updated.</td>
            </tr>
            <tr className="hover:bg-gray-50 transition">
              <td className="p-3">2026-05-30</td>
              <td className="p-3">Coordinator</td>
              <td className="p-3 font-semibold text-blue-700">
                Add Remark
              </td>
              <td className="p-3">Document remark was added.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-600">Date:</span>
            <span>2026-05-31</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-600">User:</span>
            <span>Admin User</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-600">Action:</span>
            <span className="font-semibold text-blue-700">Login</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-semibold text-gray-600">Details:</span>
            <span className="text-right">Admin signed in.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
