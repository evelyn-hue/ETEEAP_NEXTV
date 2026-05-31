import Link from "next/link";
import Image from "next/image";
import imgSrc from "@/config/img_src.json";

export default function DetailedPrograms() {
  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 to-white mt-12">
      <section className="relative w-full h-75 flex items-center justify-center overflow-hidden">
        <Image
          src={imgSrc.art}
          alt="Bachelor of Arts in English Language Studies"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl font-bold text-white">
            Bachelor of Arts in English Language Studies
          </h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-blue-800 mb-6">Overview</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
            <p className="text-gray-700 text-lg leading-relaxed">
              Bachelor of Arts in English Language Studies develops strong
              communication, research, language analysis, and professional
              writing skills for careers in education, communication, business,
              media, and related fields.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">+</span>
              </div>
              <h3 className="text-2xl font-bold text-green-700">Benefits</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">-</span>
                <span>Comprehensive curriculum designed by industry experts</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">-</span>
                <span>Hands-on training and practical experience in your field</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">-</span>
                <span>Network with professionals and peer students</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">-</span>
                <span>Earn recognized credentials valued by employers</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">+</span>
              </div>
              <h3 className="text-2xl font-bold text-purple-700">
                Career Opportunities
              </h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">-</span>
                <span>Positions in leading organizations and companies</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">-</span>
                <span>Opportunities for career advancement and specialization</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">-</span>
                <span>Competitive salaries and benefits packages</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">-</span>
                <span>Potential for entrepreneurship and independent practice</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-blue-800 mb-6">
            Skills You Will Learn
          </h3>
          <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Critical thinking and problem-solving
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Professional communication and presentation
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Leadership and team management
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Strategic planning and analysis
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Technical expertise in your field
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Project management and execution
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Research and innovation methodologies
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-gray-800 font-semibold flex items-center">
                  <span className="text-blue-600 font-bold mr-3">-</span>
                  Ethical decision-making and professionalism
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Take the first step towards your future in Bachelor of Arts in
            English Language Studies
          </p>
          <Link
            href="/form"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform bg-white text-blue-600 hover:bg-blue-50"
          >
            Apply Now
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">!</span>
            </div>
            <h3 className="text-2xl font-bold text-black-700">
              Requirements Before You Apply
            </h3>
          </div>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>Letter of Intent addressed to the ETEEAP Coordinator</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>Detailed Resume/Curriculum Vitae</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>Formal Picture (white background, recent)</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>Fully accomplished ETEEAP Application Form</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>Recommendation letter from immediate superior</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>
                Original school credentials (whichever is applicable):
                <ul className="ml-6 mt-2 space-y-1">
                  <li>- High School diploma and Form 138-A or PEPT documents</li>
                  <li>- Transcript of Records with Honorable Dismissal</li>
                </ul>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-3">-</span>
              <span>
                Photocopies / Scanned Copies of the Following:
                <ul className="ml-6 mt-2 space-y-1">
                  <li>- PSA/NSO Authenticated Birth Certificate</li>
                  <li>- Marriage Certificate (for female applicants, if applicable)</li>
                  <li>
                    - Certificate of Employment with Job Description (from past
                    to present employers)
                  </li>
                  <li>- NBI Clearance</li>
                  <li>- Business Registration Certificate (if business owner)</li>
                  <li>
                    - Certificates of seminars, trainings, workshops,
                    conferences attended
                  </li>
                  <li>- Certificates of recognitions and awards received</li>
                  <li>- Certificates of relevant professional exams passed</li>
                </ul>
              </span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
