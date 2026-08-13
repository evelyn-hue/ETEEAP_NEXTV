"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FileText } from "lucide-react";
import Fetch_to from "@/utilities/Fetch_to";
import { useAuth } from "@/context/AuthContext";
import Reveal from "@/components/shared/Reveal";
import SectionHeading from "@/components/shared/SectionHeading";
import SectionEyebrow from "@/components/shared/SectionEyebrow";

type WorkExperience = {
  companyName: string;
  roleOrReason: string;
  workYear: string;
};

export default function JoinAlumniPage() {
  const reduced = useReducedMotion();
  const router = useRouter();
  const { email: authEmail, fullName: authFullName, profilePicture: authProfilePicture, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [existingProfile, setExistingProfile] = useState<"checking" | "none" | "exists">("checking");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSubmissionInfoModal, setShowSubmissionInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");

  // Educational Attainments
  const [educationalAttainment, setEducationalAttainment] = useState("");

  // Program Information
  const [program, setProgram] = useState("");

  // Work Experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [currentWork, setCurrentWork] = useState<WorkExperience>({
    companyName: "",
    roleOrReason: "",
    workYear: "",
  });

  // Certificates & Licenses
  const [certificates, setCertificates] = useState<string[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState("");

  // Reflection
  const [experience, setExperience] = useState("");
  const [transformation, setTransformation] = useState("");
 
  // Profile Visibility
  const [visibility, setVisibility] = useState("public");

  // Check if user already has an alumni profile
  useEffect(() => {
    if (authLoading) return;
    if (!authEmail) {
      setExistingProfile("none");
      return;
    }
    const checkExisting = async () => {
      try {
        const result = await Fetch_to("/services/supabase/alumni_profiles/retrieve", { email: authEmail });
        if (result.success) {
          const data = Array.isArray(result.data) ? result.data : (result.data?.data || []);
          const active = data.find(
            (p: { verification_status?: string }) => String(p.verification_status ?? "").toLowerCase() !== "rejected"
          );
          if (active) {
            setExistingProfile("exists");
            setIsEditMode(true);
            setFullName(active.full_name || authFullName || "");
            setNickname(active.nickname || "");
            setGraduationYear(active.graduation_year || "");
            setBirthday(active.birthday || "");
            setEmail(active.email || authEmail || "");
            const edu = Array.isArray(active.educational_attainments) ? active.educational_attainments : [];
            if (edu.length > 0) setEducationalAttainment(String(edu[0]));
            const progs = Array.isArray(active.programs) ? active.programs : [];
            if (progs.length > 0) setProgram(String(progs[0]));
            if (Array.isArray(active.certificates)) setCertificates(active.certificates.map(String));
            if (Array.isArray(active.work_experiences)) setWorkExperiences(active.work_experiences);
            setExperience(active.experience || "");
            setTransformation(active.transformation || "");
            if (active.visibility) setVisibility(active.visibility);
            setIsAutoFilled(true);
          } else {
            setExistingProfile("none");
          }
        } else {
          setExistingProfile("none");
        }
      } catch {
        setExistingProfile("none");
      }
    };
    checkExisting();
  }, [authEmail, authLoading]);

  // Auto-fill email and fullName from AuthContext on mount
  useEffect(() => {
    if (!authLoading && !isAutoFilled) {
      if (authEmail) {
        setEmail(authEmail);
      }
      if (authFullName) {
        setFullName(authFullName);
      }
      if (authEmail || authFullName) {
        setIsAutoFilled(true);
      }
    }
  }, [authEmail, authFullName, authLoading, isAutoFilled]);

  // Load saved alumni draft on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("eteeap-alumni-draft");
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft.fullName) setFullName(draft.fullName);
      if (draft.nickname) setNickname(draft.nickname);
      if (draft.graduationYear) setGraduationYear(draft.graduationYear);
      if (draft.birthday) setBirthday(draft.birthday);
      if (draft.email) setEmail(draft.email);
      if (draft.educationalAttainment) setEducationalAttainment(draft.educationalAttainment);
      if (draft.program) setProgram(draft.program);
      if (Array.isArray(draft.workExperiences)) setWorkExperiences(draft.workExperiences);
      if (Array.isArray(draft.certificates)) setCertificates(draft.certificates);
      if (draft.experience) setExperience(draft.experience);
      if (draft.transformation) setTransformation(draft.transformation);
      if (draft.visibility) setVisibility(draft.visibility);
      setIsAutoFilled(true);
        } catch { /* draft load skipped — non-critical */ }
  }, []);

  const isCurrentWorkComplete =
    currentWork.companyName.trim() !== "" &&
    currentWork.roleOrReason.trim() !== "" &&
    currentWork.workYear.trim() !== "";

  const validateRequiredFields = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!nickname.trim()) return "Nickname is required.";
    if (!graduationYear.trim()) return "Academic year is required.";
    if (!birthday.trim()) return "Birthday is required.";
    if (!email.trim()) return "Email is required.";
    if (!educationalAttainment.trim()) return "Educational attainment is required.";
    if (!program.trim()) return "Program is required.";
    if (workExperiences.length === 0) return "At least one work experience is required.";
    if (certificates.length === 0) return "At least one certificate or license is required.";
    if (!experience.trim()) return "Reflection experience is required.";
    if (!transformation.trim()) return "Reflection transformation is required.";
    if (!visibility.trim()) return "Profile visibility is required.";
    return "";
  };

  const addWorkExperience = () => {
    if (
      currentWork.companyName &&
      currentWork.roleOrReason &&
      currentWork.workYear
    ) {
      setWorkExperiences([...workExperiences, currentWork]);
      setCurrentWork({
        companyName: "",
        roleOrReason: "",
        workYear: "",
      });
    }
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    if (selectedCertificate && !certificates.includes(selectedCertificate)) {
      setCertificates([...certificates, selectedCertificate]);
      setSelectedCertificate("");
    }
  };

  const removeCertificate = (item: string) => {
    setCertificates(certificates.filter((c) => c !== item));
  };

  const notifyApplicant = async (userEmail: string, action: string, details: string) => {
    if (!userEmail) return;
    await Fetch_to("/services/supabase/activity_logs", {
      mode: "insert",
      user: userEmail,
      actions: action,
      details,
    });
  };

  const doSaveDraft = async () => {
    const draft = {
      applicantName: fullName,
      programName: program,
      fullName,
      nickname,
      graduationYear,
      birthday,
      email,
      educationalAttainment,
      program,
      workExperiences,
      certificates,
      experience,
      transformation,
      visibility,
      created_at: new Date().toISOString(),
    };

    setSavingDraft(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      window.localStorage.setItem("eteeap-alumni-draft", JSON.stringify(draft));
      setSuccessMessage("Draft saved to Drafts.");
      if (email) {
        await notifyApplicant(
          email,
          "Draft Applicant",
          "Your alumni form draft has been saved and can be completed later.",
        );
      }
    } catch {
      try {
        window.sessionStorage.removeItem("eteeap-application-draft");
        window.sessionStorage.removeItem("selected-application");
        window.sessionStorage.setItem("eteeap-alumni-draft", JSON.stringify(draft));
        setSuccessMessage("Draft saved to session storage.");
        if (email) {
          await notifyApplicant(
            email,
            "Draft Applicant",
            "Your alumni form draft has been saved and can be completed later.",
          );
        }
      } catch {
        setErrorMessage("Unable to save draft. Please try again.");
      }
    } finally {
      setSavingDraft(false);
    }
  };

  const saveDraft = () => {
    setShowDraftConfirm(true);
  };

  const confirmSaveDraft = async () => {
    setShowDraftConfirm(false);
    await doSaveDraft();
  };

  const cancelSaveDraft = () => {
    setShowDraftConfirm(false);
  };

  const closeSubmissionInfoModal = () => {
    setShowSubmissionInfoModal(false);
    router.push("/alumni");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateRequiredFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Use auth profile picture if user has one set in Account Details
      const profilePictureUrl = authProfilePicture || "";

      const payload = {
        full_name: fullName,
        nickname,
        graduation_year: graduationYear,
        birthday: birthday || null,
        educational_attainments: educationalAttainment ? [educationalAttainment] : [],
        programs: program ? [program] : [],
        certificates,
        work_experiences: workExperiences,
        experience,
        transformation,
        visibility,
        email,
        profile_picture: profilePictureUrl || undefined,
      };

      const result = await Fetch_to(
        "/services/supabase/alumni_profiles/submit",
        payload
      );

      if (result.success) {
        setInfoModalMessage(
          isEditMode
            ? "Your alumni profile has been updated successfully."
            : "Wait for 3-7 business days for the verification of admin and check your notification for update."
        );
        setShowSubmissionInfoModal(true);
        setSuccessMessage(
          isEditMode ? "Alumni profile saved successfully!" : "Alumni profile submitted successfully for verification!"
        );
        if (email) {
          await notifyApplicant(
            email,
            isEditMode ? "Alumni Profile Updated" : "Under Review Applicant",
            isEditMode
              ? "Your alumni profile has been updated."
              : "Your alumni profile has been submitted and is now under verification.",
          );
        }
        // Reset form
        setFullName("");
        setNickname("");
        setGraduationYear("");
        setBirthday("");
        setEmail("");
        setEducationalAttainment("");
        setProgram("");
        setCertificates([]);
        setWorkExperiences([]);
        setExperience("");
        setTransformation("");
        setVisibility("public");
      } else {
        setErrorMessage(
          result.message || "Failed to submit alumni profile. Please try again."
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const heroSection = (
    <section className="relative w-full h-72 flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center px-6">
        <SectionEyebrow className="text-white/80">Community</SectionEyebrow>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-display">{isEditMode ? "Edit Alumni Profile" : "Alumni Registration"}</h1>
        <p className="text-white/70 mt-4 max-w-xl mx-auto">
          {isEditMode ? "Update your alumni profile for the LCCB ETEEAP community." : "Build your verified alumni profile for the LCCB ETEEAP community."}
        </p>
      </div>
    </section>
  );

  if (existingProfile === "checking") {
    return (
      <main>
        {heroSection}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/30 p-12 text-center">
            <p className="text-slate-500">Checking your alumni status...</p>
          </div>
        </div>
      </main>
    );
  }

  if (existingProfile === "none") {
    return (
      <main>
        {heroSection}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/30 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 font-display">Alumni Profile Unavailable</h2>
            <p className="text-slate-500 mb-8">
              Alumni profiles are created when you are marked as a graduate by the administration. Please wait for the admin to process your graduation.
            </p>
            <button
              onClick={() => router.push("/alumni")}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Back to Alumni
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {heroSection}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/30 p-8 md:p-12">

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Reveal>
          <div>
            <SectionEyebrow>Your Information</SectionEyebrow>
            <h2 className="text-lg font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="fullName"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
                required
              />
              <input
                name="nickname"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
                required
              />
              <input
                name="graduationYear"
                placeholder="Academic Year (ETEEAP 2024-2025)"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
                required
              />
              <input
                type="date"
                name="birthday"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
                required
              />
            </div>
          </div>
          </Reveal>

          {/* Educational Attainment */}
          <Reveal delay={0.1}>
          <div>
            <SectionEyebrow>Education</SectionEyebrow>
            <h2 className="text-lg font-bold mb-4">Educational Attainment</h2>
            <select
              value={educationalAttainment}
              onChange={(e) => setEducationalAttainment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              required
            >
              <option value="">Select Educational Attainment</option>
                <option value="Associate">Associate Degree</option>
              <option value="Bachelor&apos;s">Bachelor&apos;s Degree</option>
              <option value="Master&apos;s">Master&apos;s Degree</option>
              <option value="Doctoral">Doctoral Degree</option>
            </select>
          </div>
          </Reveal>

          {/* Program Information */}
          <Reveal delay={0.2}>
          <div>
            <SectionEyebrow>Program</SectionEyebrow>
            <h2 className="text-lg font-bold mb-4">Program Information</h2>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              required
            >
              <option value="">Select Program</option>
              <option value="Bachelor of Arts in English Language Studies">
                Bachelor of Arts in English Language Studies
              </option>
              <option value="Bachelor of Science in Business Administration - Human Resource Management">
                Bachelor of Science in Business Administration - Human Resource Management
              </option>
              <option value="Bachelor of Science in Business Administration - Marketing Management">
                Bachelor of Science in Business Administration - Marketing Management
              </option>
              <option value="Bachelor of Science in Hospitality Management">
                Bachelor of Science in Hospitality Management
              </option>
            </select>
          </div>
          </Reveal>

          {/* Work Experience */}
          <Reveal delay={0.3}>
          <div>
            <SectionEyebrow>Career</SectionEyebrow>
            <h2 className="text-lg font-bold mb-4">Work Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                name="companyName"
                placeholder="Company Name"
                value={currentWork.companyName}
                onChange={(e) =>
                  setCurrentWork({ ...currentWork, companyName: e.target.value })
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              />
              <input
                name="roleOrReason"
                placeholder="Role / Position"
                value={currentWork.roleOrReason}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    roleOrReason: e.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              />
              <input
                name="workYear"
                placeholder="Inclusive Years"
                value={currentWork.workYear}
                onChange={(e) =>
                  setCurrentWork({ ...currentWork, workYear: e.target.value })
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              />
              <button
                type="button"
                onClick={addWorkExperience}
                disabled={!isCurrentWorkComplete}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add Experience
              </button>
            </div>
            <div className="space-y-2">
              {workExperiences.map((work, index) => (
                <div
                  key={index}
                  className="bg-blue-50 p-3 rounded border border-blue-200 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold">{work.companyName}</p>
                    <p className="text-sm text-gray-600">{work.roleOrReason}</p>
                    <p className="text-sm text-gray-500">{work.workYear}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWorkExperience(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          </Reveal>

          {/* Certificates & Licenses */}
          <Reveal delay={0.4}>
          <div>
            <h2 className="text-lg font-bold mb-4">Certificates & Licenses</h2>
            <div className="flex gap-2 mb-4">
              <select
                value={selectedCertificate}
                onChange={(e) => setSelectedCertificate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              >
                <option value="">Select Certificate</option>
                <option>Not on the list</option>
                <option>TESDA NC II</option>
                <option>TESDA NC III</option>
                <option>Professional License (PRC)</option>
                <option>Civil Service Eligibility</option>
                <option>Training Certificate</option>
              </select>
              <button
                type="button"
                onClick={addCertificate}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certificates.map((item) => (
                <motion.span
                  key={item}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeCertificate(item)}
                    className="text-blue-800 hover:text-blue-600"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
          </Reveal>

          {/* Reflection */}
          <Reveal delay={0.5}>
          <div>
            <SectionEyebrow>Reflection</SectionEyebrow>
            <h2 className="text-lg font-bold mb-4">Reflection</h2>
            <textarea
              name="experience"
              placeholder="How was your experience with LCCB ETEEAP?"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition mb-4"
              rows={4}
              required
            />
            <textarea
              name="transformation"
              placeholder="How did the LCCB ETEEAP transform your career as a professional?"
              value={transformation}
              onChange={(e) => setTransformation(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              rows={4}
              required
            />
          </div>
          </Reveal>

          {/* Profile Visibility */}
          <Reveal delay={0.6}>
          <div>
            <SectionEyebrow>Privacy</SectionEyebrow>
            <h2 className="text-lg font-bold mb-4">Profile Visibility</h2>
            <select
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 ring-1 ring-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-full transition"
              required
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          </Reveal>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full md:w-40 border border-slate-300 bg-white text-slate-900 py-3 rounded-xl font-semibold transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={savingDraft}
              className="w-full md:w-40 bg-slate-900 text-white py-3 rounded-xl font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {savingDraft ? "Saving Draft..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-40 bg-blue-700 text-white py-3 rounded-xl font-semibold transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Saving..." : isEditMode ? "Save Changes" : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {showDraftConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Save Draft</h3>
            <p className="mt-3 text-sm text-slate-600">
              Are you sure you want to save this form as a draft? You can complete it later.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelSaveDraft}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSaveDraft}
                className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Submission Sent</h3>
            <p className="mt-3 text-sm text-slate-600">
              {infoModalMessage}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeSubmissionInfoModal}
                className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
