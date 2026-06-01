"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";

import imgSrc from "@/config/img_src.json";

type MyprofileProps = {
  modal?: boolean;
  onClose?: () => void;
};

function ProfileBody() {
  const [preview, setPreview] = useState<string>(imgSrc.heroImage);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleProfilePictureChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <section className="shrink-0">
          <div className="h-36 w-36 overflow-hidden rounded-3xl border-4 border-white bg-slate-200 shadow-lg">
            <Image
              src={preview}
              alt="Profile picture"
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Change Profile Picture
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
            />
          </label>
        </section>

        <section className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Account Details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Frontend-only profile view.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Full Name
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                Juan Dela Cruz
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                juandelacruz@email.com
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Phone Number
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                +63 912 345 6789
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Civil Status
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                Single
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Myprofile({ modal = false, onClose }: MyprofileProps) {
  if (modal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div className="relative w-full max-w-4xl">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="absolute -right-2 -top-2 z-10 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-md hover:bg-slate-100"
            aria-label="Close profile"
          >
            Close
          </button>
          <ProfileBody />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <ProfileBody />
    </main>
  );
}
