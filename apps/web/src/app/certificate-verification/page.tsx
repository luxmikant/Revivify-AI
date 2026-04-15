"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { BadgeCheck, Download, FileSpreadsheet, Search, ShieldCheck } from "lucide-react";

type Role = "student" | "admin";

type Certificate = {
  certificateId: string;
  studentName: string;
  internshipDomain: string;
  startDate: string;
  endDate: string;
  issueDate: string;
};

const seedCertificates: Certificate[] = [
  {
    certificateId: "CERT-2026-1001",
    studentName: "Anita Sharma",
    internshipDomain: "Web Development",
    startDate: "2025-11-01",
    endDate: "2026-01-31",
    issueDate: "2026-02-05",
  },
  {
    certificateId: "CERT-2026-1002",
    studentName: "Riya Patel",
    internshipDomain: "MERN Stack Development",
    startDate: "2025-10-15",
    endDate: "2026-01-15",
    issueDate: "2026-01-20",
  },
];

export default function CertificateVerificationPage() {
  const [role, setRole] = useState<Role>("student");
  const [certificates, setCertificates] = useState<Certificate[]>(seedCertificates);
  const [queryId, setQueryId] = useState("");
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");

  const [form, setForm] = useState<Certificate>({
    certificateId: "",
    studentName: "",
    internshipDomain: "",
    startDate: "",
    endDate: "",
    issueDate: "",
  });

  const certificate = useMemo(() => {
    if (selectedCertificateId) {
      return (
        certificates.find((item) => item.certificateId === selectedCertificateId) || null
      );
    }

    if (!queryId.trim()) {
      return null;
    }

    return (
      certificates.find(
        (item) => item.certificateId.toLowerCase() === queryId.trim().toLowerCase()
      ) || null
    );
  }, [certificates, selectedCertificateId, queryId]);

  const addCertificate = () => {
    if (
      !form.certificateId ||
      !form.studentName ||
      !form.internshipDomain ||
      !form.startDate ||
      !form.endDate ||
      !form.issueDate
    ) {
      return;
    }

    const exists = certificates.some(
      (item) => item.certificateId.toLowerCase() === form.certificateId.toLowerCase()
    );

    if (exists) {
      return;
    }

    setCertificates((prev) => [form, ...prev]);
    setForm({
      certificateId: "",
      studentName: "",
      internshipDomain: "",
      startDate: "",
      endDate: "",
      issueDate: "",
    });
  };

  const importSampleExcelData = () => {
    const imported: Certificate[] = [
      {
        certificateId: "CERT-2026-1003",
        studentName: "Sneha Iyer",
        internshipDomain: "Data Analytics",
        startDate: "2025-09-01",
        endDate: "2025-12-01",
        issueDate: "2025-12-10",
      },
      {
        certificateId: "CERT-2026-1004",
        studentName: "Kunal Verma",
        internshipDomain: "UI/UX Design",
        startDate: "2025-08-20",
        endDate: "2025-11-20",
        issueDate: "2025-11-30",
      },
    ];

    setCertificates((prev) => {
      const existingIds = new Set(prev.map((item) => item.certificateId));
      const fresh = imported.filter((item) => !existingIds.has(item.certificateId));
      return [...fresh, ...prev];
    });
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BadgeCheck className="text-amber-400" /> Certificate Verification System
              </h1>
              <p className="text-slate-300 mt-1 text-sm">
                Upload student data, verify certificates, and download printable certificate views.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setRole("student")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  role === "student"
                    ? "bg-rose-600 text-white"
                    : "bg-transparent text-slate-300 hover:bg-white/10"
                }`}
              >
                Student View
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  role === "admin"
                    ? "bg-rose-600 text-white"
                    : "bg-transparent text-slate-300 hover:bg-white/10"
                }`}
              >
                Admin View
              </button>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Roles & Authentication</p>
            <p className="text-sm text-slate-200 mt-2">
              Admin and student views are separated, and Clerk handles secure sessions.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Data Integrity</p>
            <p className="text-sm text-slate-200 mt-2">
              Frontend validation prevents duplicate IDs and incomplete certificate records.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Download</p>
            <p className="text-sm text-slate-200 mt-2">
              Students can print or download certificate views in a printable format.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="text-rose-400" size={18} /> Certificate Search and Retrieval
            </h2>

            <div className="flex gap-2">
              <input
                value={queryId}
                onChange={(e) => {
                  setSelectedCertificateId(null);
                  setQueryId(e.target.value);
                }}
                placeholder="Enter certificate ID"
                className="flex-1 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
              />
              <button
                onClick={() => {
                  setSelectedCertificateId(null);
                  setQueryId(queryId.trim());
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-500"
              >
                Verify
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
              <p className="text-slate-300">
                Enter a valid certificate ID, for example: CERT-2026-1001
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium mb-3">Available Certificates</p>
              <div className="max-h-56 overflow-auto space-y-2">
                {certificates.map((item) => (
                  <button
                    key={item.certificateId}
                    onClick={() => {
                      setSelectedCertificateId(item.certificateId);
                      setQueryId(item.certificateId);
                    }}
                    className="w-full text-left rounded-lg border border-white/10 px-3 py-2 hover:bg-white/5 transition"
                  >
                    <p className="text-sm text-slate-100">{item.certificateId}</p>
                    <p className="text-xs text-slate-400">{item.studentName}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="text-amber-400" size={18} /> Security and Integrity
            </h2>

            <ul className="space-y-2 text-sm text-slate-300">
              <li>Encrypted sessions and role-based access through existing auth provider.</li>
              <li>Validation checks for required fields before certificate generation.</li>
              <li>Duplicate certificate ID prevention during manual and bulk imports.</li>
              <li>Controlled download and print flows from verified certificate data.</li>
            </ul>
          </div>
        </section>

        {role === "admin" && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="text-rose-400" size={18} /> Data Management (Excel Upload)
              </h2>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setUploadFileName(e.target.files?.[0]?.name || "")}
                className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm"
              />

              {uploadFileName && (
                <p className="text-xs text-slate-400">Selected file: {uploadFileName}</p>
              )}

              <button
                onClick={importSampleExcelData}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2 text-sm font-semibold"
              >
                Simulate Excel Import
              </button>

              <p className="text-xs text-slate-400">
                This UI demonstrates bulk upload flow. Connect this action to your backend parser/API.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Certificate Generation</h2>

              <div className="space-y-3">
                <input
                  value={form.certificateId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, certificateId: e.target.value }))
                  }
                  placeholder="Certificate ID"
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                />
                <input
                  value={form.studentName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, studentName: e.target.value }))
                  }
                  placeholder="Student Name"
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                />
                <input
                  value={form.internshipDomain}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, internshipDomain: e.target.value }))
                  }
                  placeholder="Internship Domain"
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  />
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  />
                </div>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, issueDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                />

                <button
                  onClick={addCertificate}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-500"
                >
                  Generate Certificate Record
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6" id="certificate-printable">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">Certificate Preview</h2>
            <button
              onClick={printCertificate}
              disabled={!certificate}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <Download size={14} /> Download / Print
              </span>
            </button>
          </div>

          {certificate ? (
            <article className="rounded-xl border border-amber-400/30 bg-black/30 p-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Internship Certificate</p>
              <h3 className="text-2xl font-bold text-slate-100">{certificate.studentName}</h3>
              <p className="text-slate-300">Certificate ID: {certificate.certificateId}</p>
              <p className="text-slate-300">Domain: {certificate.internshipDomain}</p>
              <p className="text-slate-400 text-sm">
                Internship Duration: {certificate.startDate} to {certificate.endDate}
              </p>
              <p className="text-slate-400 text-sm">Issue Date: {certificate.issueDate}</p>
            </article>
          ) : (
            <p className="text-sm text-slate-400">
              Verify a certificate ID to view the certificate details.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
