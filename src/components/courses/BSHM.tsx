"use client";

import Image from "next/image";
import imgSrc from "@/config/img_src.json";
import ApplyButton from "./apply-button";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import Reveal from "@/components/shared/Reveal";

export default function DetailedPrograms() {
  const programName = "Bachelor of Science in Hospitality Management";
  const formQuery = "/form?program=Bachelor of Science in Hospitality Management";

  return (
    <main className="min-h-screen">
      <section className="relative w-full h-75 flex items-center justify-center overflow-hidden">
        <Image
          src={imgSrc.hm}
          alt={programName}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        <h1 className="relative z-10 text-4xl font-bold text-white font-display text-center px-6">
          {programName}
        </h1>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">

        <Reveal>
          <div>
            <SectionEyebrow>Overview</SectionEyebrow>
            <SectionHeading>About the Program</SectionHeading>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-8 border-l-4 border-blue-600">
              <p className="text-gray-700 text-lg leading-relaxed">
                Bachelor of Science in Hospitality Management provides comprehensive education in the principles and practices of the hospitality industry. Students will learn about hotel operations, food and beverage management, event planning, and customer service.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <SectionEyebrow>Benefits &amp; Career</SectionEyebrow>
            <SectionHeading>What You Gain</SectionHeading>
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl text-blue-700 font-bold">+</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-700">Benefits</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Comprehensive curriculum designed by industry experts</span></li>
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Hands-on training and practical experience in your field</span></li>
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Network with professionals and peer students</span></li>
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Earn recognized credentials valued by employers</span></li>
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl text-blue-700 font-bold">+</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-700">Career Opportunities</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Positions in leading organizations and companies</span></li>
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Opportunities for career advancement and specialization</span></li>
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Competitive salaries and benefits packages</span></li>
                  <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Potential for entrepreneurship and independent practice</span></li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <SectionEyebrow>Skills</SectionEyebrow>
            <SectionHeading level="h3">Skills You Will Learn</SectionHeading>
            <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm ring-1 ring-slate-200/30 p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Critical thinking and problem-solving",
                  "Professional communication and presentation",
                  "Leadership and team management",
                  "Strategic planning and analysis",
                  "Technical expertise in your field",
                  "Project management and execution",
                  "Research and innovation methodologies",
                  "Ethical decision-making and professionalism",
                ].map((skill, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <p className="text-gray-800 font-semibold flex items-center">
                      <span className="text-blue-600 font-bold mr-3">-</span>
                      {skill}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-12 text-center text-white">
            <SectionHeading>Ready to Apply?</SectionHeading>
            <p className="text-xl mb-8 text-blue-100">
              Take the first step towards your future in {programName}
            </p>
            <ApplyButton href={formQuery} programName={programName} />
          </div>
        </Reveal>

        <Reveal>
          <div>
            <SectionEyebrow>Requirements</SectionEyebrow>
            <SectionHeading level="h3">Before You Apply</SectionHeading>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-8 border-l-4 border-blue-600">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Letter of Intent addressed to the ETEEAP Coordinator</span></li>
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Detailed Resume/Curriculum Vitae</span></li>
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Formal Picture (white background, recent)</span></li>
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Fully accomplished ETEEAP Application Form</span></li>
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Recommendation letter from immediate superior</span></li>
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Original school credentials (whichever is applicable):<ul className="ml-6 mt-2 space-y-1"><li>- High School diploma and Form 138-A or PEPT documents</li><li>- Transcript of Records with Honorable Dismissal</li></ul></span></li>
                <li className="flex items-start"><span className="text-blue-600 font-bold mr-3">-</span><span>Photocopies / Scanned Copies of the Following:<ul className="ml-6 mt-2 space-y-1"><li>- PSA/NSO Authenticated Birth Certificate</li><li>- Marriage Certificate (for female applicants, if applicable)</li><li>- Certificate of Employment with Job Description (from past to present employers)</li><li>- NBI Clearance</li><li>- Business Registration Certificate (if business owner)</li><li>- Certificates of seminars, trainings, workshops, conferences attended</li><li>- Certificates of recognitions and awards received</li><li>- Certificates of relevant professional exams passed</li></ul></span></li>
              </ul>
            </div>
          </div>
        </Reveal>

      </div>
    </main>
  );
}
