"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

import imgSrc from "@/config/img_src.json";


export default function About() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-20 space-y-16">
      {/* Hero Section */}
      <section className="relative">
        <Image
          src={imgSrc.heroImage}
          alt="ETEEAP Students"
          width={1200}
          height={600}
          style={{ marginTop: "4rem" }}
          className="w-full h-64 md:h-96 object-cover rounded-xl shadow-md"
          priority
        />

        <h1 className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-bold text-white bg-black/40 rounded-xl">
          About ETEEAP
        </h1>
      </section>

      {/* Overview */}
      <Reveal>
        <section className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 md:p-12">
          <SectionHeading>Overview</SectionHeading>
          <p className="text-gray-700 leading-relaxed">
            The Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP) is an alternative education delivery mode, promulgated through Executive Order 330, which promotes access to continuing quality higher education. It is an effective system of academic equivalency and accreditation of prior learning from relevant work experiences and formal/non-formal educational training. Deputized Higher Educational Institutions (HEIs) are authorized to conduct competency-based evaluation and award appropriate degrees to deserving individuals.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            The Commission on Higher Education deputized LCC Bacolod to offer ETEEAP for Bachelor of Science in Business Administration, Liberal Arts in English Language Studies, and the Bachelor of Science in Hospitality Management. The program follows a revised curriculum based on a 10-month timeframe with classes every Saturday.
          </p>
        </section>
      </Reveal>

      {/* Mission & Vision */}
      <Reveal>
        <section className="bg-blue-50/50 rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <Image
            src={imgSrc.heroImage}
            alt="Mission"
            width={500}
            height={300}
            className="rounded-lg shadow-md object-cover"
          />

          <div className="flex-1 space-y-6">
            <SectionHeading>Mission & Vision</SectionHeading>

            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                Guided by the teachings of Christ and inspired by Augustinian and Marian values, LCC Bacolod{"'"}s ETEEAP is dedicated to delivering quality, accessible, and transformative academic programs that recognize prior learning and professional experience. It upholds a culture of excellence in instruction, innovation, and nation building to form lifelong learners and professionals who embody integrity, leadership, and service strengthening its role as the leading provider of future and world ready graduates.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
               La Consolacion College Bacolod{"'"}s ETEEAP envisions itself as a Catholic academic community committed to excellence and quality education for adult learners. It aspires to be the leading provider of competent, compassionate, and values-driven graduates in the Negros Island Region and beyond who contribute to the creation of a just, humane, and sustainable society.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Why Choose */}
      <Reveal>
        <section className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 md:p-12">
          <SectionHeading>Why Choose ETEEAP?</SectionHeading>

          <ul className="grid md:grid-cols-2 gap-6">
            <li>&#127891; Opportunity for working adults to complete a degree within 10 months.</li>
            <li>&#9200; Flexible class schedules (every Saturday).</li>
            <li>&#128196; Competency-based evaluation and recognition of prior learning.</li>
            <li>&#11088; Deputized HEIs ensure quality and official degree accreditation.</li>
          </ul>
        </section>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <section className="text-center">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            Apply now
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
