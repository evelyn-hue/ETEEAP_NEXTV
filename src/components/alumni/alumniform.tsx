"use client";

import { useState } from "react";

/* =========================
   TYPES
========================= */

type ChipItem = {
  value: string;
};

type AlumniForm = {
  fullName: string;
  nickname: string;
  graduationYear: string;
  birthday: string;

  education: ChipItem[];
  programs: ChipItem[];
  certificates: ChipItem[];

  companyName: string;
  roleOrReason: string;
  workYear: string;

  experience: string;
  transformation: string;

  visibility: "public" | "private";
};

/* =========================
   OPTIONS
========================= */

const degreeOptions = [
  "Primary School",
  "Junior High School",
  "Senior High School",
  "Technical Vocational (TESDA)",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate Degree",
];

const programOptions = [
  "BS Information Technology",
  "BS Education",
  "BS Business Administration",
  "BS Criminology",
  "BS Nursing",
  "ETEEAP Program",
];

const certificateOptions = [
  "TESDA NC II",
  "TESDA NC III",
  "Professional License (PRC)",
  "Civil Service Eligibility",
  "Training Certificate",
];

/* =========================
   MAIN PAGE
========================= */

export default function JoinAlumniPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AlumniForm>({
    fullName: "",
    nickname: "",
    graduationYear: "",
    birthday: "",

    education: [],
    programs: [],
    certificates: [],

    companyName: "",
    roleOrReason: "",
    workYear: "",

    experience: "",
    transformation: "",

    visibility: "public",
  });

  /* =========================
     CHIP SYSTEM
  ========================= */

  const addChip = (
    key: "education" | "programs" | "certificates",
    value: string
  ) => {
    if (!value) return;

    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], { value }],
    }));
  };

  const removeChip = (
    key: "education" | "programs" | "certificates",
    index: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  /* =========================
     HANDLERS
  ========================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/alumni/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      alert("Submitted successfully! Waiting for admin verification.");
    } catch {
      alert("Submission failed.");
    }

    setLoading(false);
  };

  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 mt-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">

        {/* HEADER */}
        <div className="mb-8 border-b pb-5">
          <h1 className="text-3xl font-bold text-blue-800">
            Alumni Slambook Registration
          </h1>
          <p className="text-gray-500 mt-2">
            Build your verified alumni profile for the LCCB ETEEAP community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* PERSONAL */}
          <Section title="👤 Personal Information">
            <Grid>
              <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
              <Input name="nickname" placeholder="Nickname" value={form.nickname} onChange={handleChange} />
              <Input name="graduationYear" placeholder="Academic Year (ETEEAP 2024-2025)" value={form.graduationYear} onChange={handleChange} />
              <Input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
            </Grid>
          </Section>

          {/* EDUCATION */}
          <Section title="🎓 Educational Attainment">
            <ChipSelector
              options={degreeOptions}
              onAdd={(val) => addChip("education", val)}
              items={form.education}
              onRemove={(i) => removeChip("education", i)}
            />
          </Section>

          {/* PROGRAM */}
          <Section title="🏫 Program Information">
            <ChipSelector
              options={programOptions}
              onAdd={(val) => addChip("programs", val)}
              items={form.programs}
              onRemove={(i) => removeChip("programs", i)}
            />
          </Section>

          {/* WORK */}
          <Section title="💼 Work Experience">
            <Grid>
              <Input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} />
              <Input name="roleOrReason" placeholder="Role / Position" value={form.roleOrReason} onChange={handleChange} />
              <Input name="workYear" placeholder="Inclusive Years" value={form.workYear} onChange={handleChange} />
            </Grid>
          </Section>

          {/* CERTIFICATES */}
          <Section title="📜 Certificates & Licenses">
            <ChipSelector
              options={certificateOptions}
              onAdd={(val) => addChip("certificates", val)}
              items={form.certificates}
              onRemove={(i) => removeChip("certificates", i)}
            />
          </Section>

          {/* REFLECTION */}
          <Section title="💬 Reflection">
            <Textarea
              name="experience"
              placeholder="How was your experience with LCCB ETEEAP?"
              value={form.experience}
              onChange={handleChange}
            />

            <Textarea
              name="transformation"
              placeholder="How did the LCCB ETEEAP transform your career as a professional?"
              value={form.transformation}
              onChange={handleChange}
            />
          </Section>

          {/* VISIBILITY */}
          <Section title="🔒 Profile Visibility">
            <select
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
              className="border p-3 rounded w-full"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </Section>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>

        </form>
      </div>
    </main>
  );
}

/* =========================
   CHIP SELECTOR (REUSABLE)
========================= */

function ChipSelector({
  options,
  items,
  onAdd,
  onRemove,
}: {
  options: string[];
  items: ChipItem[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>

      {/* SELECT + ADD */}
      <div className="flex gap-2 mb-4">
        <select id="chipSelect" className="border p-2 rounded w-full">
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            const select = document.getElementById(
              "chipSelect"
            ) as HTMLSelectElement;

            onAdd(select.value);
          }}
          className="bg-blue-700 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* CHIPS */}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Chip key={i} label={item.value} onRemove={() => onRemove(i)} />
        ))}
      </div>

    </div>
  );
}

/* =========================
   CHIP UI
========================= */

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full gap-2">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 font-bold"
      >
        ✕
      </button>
    </div>
  );
}

/* =========================
   UI HELPERS
========================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Grid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className="border p-3 rounded w-full"
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className="border p-3 rounded w-full"
      rows={4}
    />
  );
}