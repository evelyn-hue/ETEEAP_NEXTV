"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";
import Reveal from "@/components/shared/Reveal";

import imgSrc from "@/config/img_src.json";

export default function About() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative w-full h-64 md:h-96 flex items-center justify-center overflow-hidden mt-14">
        <Image
          src={imgSrc.heroImage}
          alt="ETEEAP Students"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-white font-display">
          About ETEEAP
        </h1>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">

        {/* Overview */}
        <Reveal>
          <section className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 md:p-12 border-l-4 border-blue-600">
            <SectionEyebrow>Overview</SectionEyebrow>
            <SectionHeading>What is ETEEAP?</SectionHeading>
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
          <section className="bg-section-warm rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 md:p-12">
            <SectionEyebrow className="text-center">Mission &amp; Vision</SectionEyebrow>
            <SectionHeading className="text-center mb-10">Our Core Purpose</SectionHeading>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <h3 className="font-semibold text-primary text-lg mb-3">Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  Guided by the teachings of Christ and inspired by Augustinian and Marian values, LCC Bacolod&rsquo;s ETEEAP is dedicated to delivering quality, accessible, and transformative academic programs that recognize prior learning and professional experience. It upholds a culture of excellence in instruction, innovation, and nation building to form lifelong learners and professionals who embody integrity, leadership, and service strengthening its role as the leading provider of future and world ready graduates.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <h3 className="font-semibold text-primary text-lg mb-3">Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  La Consolacion College Bacolod&rsquo;s ETEEAP envisions itself as a Catholic academic community committed to excellence and quality education for adult learners. It aspires to be the leading provider of competent, compassionate, and values-driven graduates in the Negros Island Region and beyond who contribute to the creation of a just, humane, and sustainable society.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Why Choose */}
        <Reveal>
          <section className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/30 p-6 md:p-12">
            <SectionEyebrow>Benefits</SectionEyebrow>
            <SectionHeading>Why Choose ETEEAP?</SectionHeading>
            <ul className="grid md:grid-cols-2 gap-6 mt-6">
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🎓</span>
                <span className="text-gray-700">Opportunity for working adults to complete a degree within 10 months.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">📅</span>
                <span className="text-gray-700">Flexible class schedules (every Saturday).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">📋</span>
                <span className="text-gray-700">Competency-based evaluation and recognition of prior learning.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl shrink-0">⭐</span>
                <span className="text-gray-700">Deputized HEIs ensure quality and official degree accreditation.</span>
              </li>
            </ul>
          </section>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section className="bg-section-navy rounded-xl p-12 text-center">
            <SectionHeading className="text-white">Ready to Begin?</SectionHeading>
            <p className="text-white/70 mb-8">Take the first step toward earning your degree.</p>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-lg bg-white text-primary px-6 py-3 font-semibold shadow-md transition-colors hover:bg-gray-100"
            >
              Apply Now
            </Link>
          </section>
        </Reveal>

      </div>
    </main>
  );
}
