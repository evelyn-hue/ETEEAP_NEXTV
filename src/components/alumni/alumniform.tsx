export default function JoinAlumniPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 mt-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 border-b pb-5">
          <h1 className="text-3xl font-bold text-blue-800">
            Alumni Slambook Registration
          </h1>
          <p className="text-gray-500 mt-2">
            Build your verified alumni profile for the LCCB ETEEAP community.
          </p>
        </div>

        <form className="space-y-10">
          <div>
            <h2 className="text-lg font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="fullName"
                placeholder="Full Name"
                className="border p-3 rounded w-full"
              />
              <input
                name="nickname"
                placeholder="Nickname"
                className="border p-3 rounded w-full"
              />
              <input
                name="graduationYear"
                placeholder="Academic Year (ETEEAP 2024-2025)"
                className="border p-3 rounded w-full"
              />
              <input
                type="date"
                name="birthday"
                className="border p-3 rounded w-full"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Educational Attainment</h2>
            <div className="flex gap-2 mb-4">
              <select className="border p-2 rounded w-full">
                <option>Primary School</option>
                <option>Junior High School</option>
                <option>Senior High School</option>
                <option>Technical Vocational (TESDA)</option>
                <option>Bachelor&apos;s Degree</option>
                <option>Master&apos;s Degree</option>
                <option>Doctorate Degree</option>
              </select>
              <button
                type="button"
                className="bg-blue-700 text-white px-4 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Bachelor&apos;s Degree
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Program Information</h2>
            <div className="flex gap-2 mb-4">
              <select className="border p-2 rounded w-full">
                <option>BS Information Technology</option>
                <option>BS Education</option>
                <option>BS Business Administration</option>
                <option>BS Criminology</option>
                <option>BS Nursing</option>
                <option>ETEEAP Program</option>
              </select>
              <button
                type="button"
                className="bg-blue-700 text-white px-4 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                ETEEAP Program
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Work Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="companyName"
                placeholder="Company Name"
                className="border p-3 rounded w-full"
              />
              <input
                name="roleOrReason"
                placeholder="Role / Position"
                className="border p-3 rounded w-full"
              />
              <input
                name="workYear"
                placeholder="Inclusive Years"
                className="border p-3 rounded w-full"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Certificates & Licenses</h2>
            <div className="flex gap-2 mb-4">
              <select className="border p-2 rounded w-full">
                <option>TESDA NC II</option>
                <option>TESDA NC III</option>
                <option>Professional License (PRC)</option>
                <option>Civil Service Eligibility</option>
                <option>Training Certificate</option>
              </select>
              <button
                type="button"
                className="bg-blue-700 text-white px-4 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                TESDA NC II
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Reflection</h2>
            <textarea
              name="experience"
              placeholder="How was your experience with LCCB ETEEAP?"
              className="border p-3 rounded w-full mb-4"
              rows={4}
            />
            <textarea
              name="transformation"
              placeholder="How did the LCCB ETEEAP transform your career as a professional?"
              className="border p-3 rounded w-full"
              rows={4}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Profile Visibility</h2>
            <select name="visibility" className="border p-3 rounded w-full">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <button
            type="button"
            className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold"
          >
            Submit for Verification
          </button>
        </form>
      </div>
    </main>
  );
}
