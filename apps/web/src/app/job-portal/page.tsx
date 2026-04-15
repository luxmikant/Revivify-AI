"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Briefcase,
  MapPin,
  Search,
  Building2,
  Users,
  ClipboardList,
  Plus,
  Trash2,
} from "lucide-react";

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryRange: string;
  qualifications: string;
  responsibilities: string;
};

type UserRole = "jobseeker" | "employer";

const initialJobs: JobListing[] = [
  {
    id: "J-1001",
    title: "Frontend Developer",
    company: "Amdox Labs",
    location: "Bengaluru",
    type: "Full-time",
    salaryRange: "8-12 LPA",
    qualifications: "React, TypeScript, UI fundamentals",
    responsibilities: "Build reusable components and optimize UX performance",
  },
  {
    id: "J-1002",
    title: "MERN Stack Developer",
    company: "TalentBridge",
    location: "Hyderabad",
    type: "Contract",
    salaryRange: "6-10 LPA",
    qualifications: "MongoDB, Express, React, Node.js",
    responsibilities: "Develop full-stack features and maintain APIs",
  },
  {
    id: "J-1003",
    title: "QA Engineer Intern",
    company: "SkillLaunch",
    location: "Remote",
    type: "Internship",
    salaryRange: "20k-35k / month",
    qualifications: "Testing basics, Cypress or Playwright",
    responsibilities: "Write and execute test cases with bug reports",
  },
];

export default function JobPortalPage() {
  const [role, setRole] = useState<UserRole>("jobseeker");
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const [keyword, setKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("All");

  const [seekerProfile, setSeekerProfile] = useState({
    name: "",
    email: "",
    phone: "",
    resumeName: "",
    headline: "",
  });

  const [employerProfile, setEmployerProfile] = useState({
    companyName: "",
    email: "",
    website: "",
    about: "",
  });

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time" as JobType,
    salaryRange: "",
    qualifications: "",
    responsibilities: "",
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const byKeyword =
        !keyword.trim() ||
        [job.title, job.company, job.qualifications, job.responsibilities]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase());

      const byLocation =
        !locationFilter.trim() ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const byType = jobTypeFilter === "All" || job.type === jobTypeFilter;

      return byKeyword && byLocation && byType;
    });
  }, [jobs, keyword, locationFilter, jobTypeFilter]);

  const seekerDashboard = useMemo(() => {
    const appliedJobs = jobs.filter((job) => appliedJobIds.includes(job.id));
    return {
      appliedCount: appliedJobs.length,
      totalOpenings: jobs.length,
      recentApplications: appliedJobs.slice(0, 3),
    };
  }, [jobs, appliedJobIds]);

  const employerDashboard = useMemo(() => {
    const totalListings = jobs.length;
    const applicationCount = appliedJobIds.length;
    return {
      totalListings,
      applicationCount,
      managedCandidates: Math.max(applicationCount, 1),
    };
  }, [jobs.length, appliedJobIds.length]);

  const applyToJob = (jobId: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds((prev) => [jobId, ...prev]);
    }
  };

  const addJobListing = () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.salaryRange) {
      return;
    }

    const listing: JobListing = {
      id: `J-${1000 + jobs.length + 1}`,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salaryRange: newJob.salaryRange,
      qualifications: newJob.qualifications || "Not provided",
      responsibilities: newJob.responsibilities || "Not provided",
    };

    setJobs((prev) => [listing, ...prev]);
    setNewJob({
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      salaryRange: "",
      qualifications: "",
      responsibilities: "",
    });
  };

  const deleteJobListing = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    setAppliedJobIds((prev) => prev.filter((id) => id !== jobId));
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="text-amber-400" /> Job Listing Portal
              </h1>
              <p className="text-slate-300 mt-1 text-sm">
                Search jobs, manage profiles, post listings, and track applications in one place.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setRole("jobseeker")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  role === "jobseeker"
                    ? "bg-rose-600 text-white"
                    : "bg-transparent text-slate-300 hover:bg-white/10"
                }`}
              >
                Job Seeker
              </button>
              <button
                onClick={() => setRole("employer")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  role === "employer"
                    ? "bg-rose-600 text-white"
                    : "bg-transparent text-slate-300 hover:bg-white/10"
                }`}
              >
                Employer
              </button>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Authentication</p>
            <p className="text-sm text-slate-200 mt-2">
              Clerk secures user registration, login, and session handling for both user roles.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Advanced Search</p>
            <p className="text-sm text-slate-200 mt-2">
              Filter listings by keyword, location, and job type to quickly find matching jobs.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Dashboards</p>
            <p className="text-sm text-slate-200 mt-2">
              Separate dashboard views for seekers and employers with key activity metrics.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="text-rose-400" size={18} /> Job Search
          </h2>

          <div className="grid md:grid-cols-4 gap-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keyword"
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
            />
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <button
              onClick={() => {
                setKeyword("");
                setLocationFilter("");
                setJobTypeFilter("All");
              }}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 transition"
            >
              Reset Filters
            </button>
          </div>

          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const applied = appliedJobIds.includes(job.id);
              return (
                <article
                  key={job.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-100">{job.title}</h3>
                      <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                        <Building2 size={14} /> {job.company}
                        <span className="text-slate-500">|</span>
                        <MapPin size={14} /> {job.location}
                        <span className="text-slate-500">|</span>
                        {job.type}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Salary: {job.salaryRange}</p>
                      <p className="text-xs text-slate-400 mt-1">Qualifications: {job.qualifications}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => applyToJob(job.id)}
                        disabled={applied || role !== "jobseeker"}
                        className="rounded-lg px-3 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applied ? "Applied" : "Apply"}
                      </button>
                      {role === "employer" && (
                        <button
                          onClick={() => deleteJobListing(job.id)}
                          className="rounded-lg px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredJobs.length === 0 && (
              <p className="text-sm text-slate-400">No jobs match your filters.</p>
            )}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="text-amber-400" size={18} /> Profile Management
            </h2>

            {role === "jobseeker" ? (
              <div className="space-y-3">
                <input
                  placeholder="Full Name"
                  value={seekerProfile.name}
                  onChange={(e) =>
                    setSeekerProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <input
                  placeholder="Email"
                  value={seekerProfile.email}
                  onChange={(e) =>
                    setSeekerProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <input
                  placeholder="Phone"
                  value={seekerProfile.phone}
                  onChange={(e) =>
                    setSeekerProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <input
                  placeholder="Professional Headline"
                  value={seekerProfile.headline}
                  onChange={(e) =>
                    setSeekerProfile((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <label className="block text-sm text-slate-300">Resume Upload</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setSeekerProfile((prev) => ({
                      ...prev,
                      resumeName: e.target.files?.[0]?.name || "",
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm"
                />
                {seekerProfile.resumeName && (
                  <p className="text-xs text-slate-400">Uploaded: {seekerProfile.resumeName}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  placeholder="Company Name"
                  value={employerProfile.companyName}
                  onChange={(e) =>
                    setEmployerProfile((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <input
                  placeholder="Contact Email"
                  value={employerProfile.email}
                  onChange={(e) =>
                    setEmployerProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <input
                  placeholder="Website"
                  value={employerProfile.website}
                  onChange={(e) =>
                    setEmployerProfile((prev) => ({ ...prev, website: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <textarea
                  placeholder="Company Information"
                  value={employerProfile.about}
                  onChange={(e) =>
                    setEmployerProfile((prev) => ({ ...prev, about: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm h-24 outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="text-rose-400" size={18} /> Job Listings
            </h2>

            <p className="text-sm text-slate-300">
              Employers can create, edit, and remove listings. Job seekers can view and apply.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <input
                value={newJob.title}
                onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Job Title"
                className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
              />
              <input
                value={newJob.company}
                onChange={(e) => setNewJob((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
                className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newJob.location}
                  onChange={(e) =>
                    setNewJob((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Location"
                  className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                />
                <select
                  value={newJob.type}
                  onChange={(e) =>
                    setNewJob((prev) => ({ ...prev, type: e.target.value as JobType }))
                  }
                  className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <input
                value={newJob.salaryRange}
                onChange={(e) =>
                  setNewJob((prev) => ({ ...prev, salaryRange: e.target.value }))
                }
                placeholder="Salary Range"
                className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none focus:border-rose-400"
              />
              <textarea
                value={newJob.qualifications}
                onChange={(e) =>
                  setNewJob((prev) => ({ ...prev, qualifications: e.target.value }))
                }
                placeholder="Qualifications"
                className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm h-16 outline-none focus:border-rose-400"
              />
              <textarea
                value={newJob.responsibilities}
                onChange={(e) =>
                  setNewJob((prev) => ({ ...prev, responsibilities: e.target.value }))
                }
                placeholder="Responsibilities"
                className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm h-16 outline-none focus:border-rose-400"
              />
              <button
                onClick={addJobListing}
                disabled={role !== "employer"}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={14} /> Add Job Listing
                </span>
              </button>
              {role !== "employer" && (
                <p className="text-xs text-slate-400">Switch to Employer role to add listings.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>

          {role === "jobseeker" ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Applied Jobs</p>
                  <p className="text-2xl font-bold mt-1">{seekerDashboard.appliedCount}</p>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Open Listings</p>
                  <p className="text-2xl font-bold mt-1">{seekerDashboard.totalOpenings}</p>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Profile Completion</p>
                  <p className="text-2xl font-bold mt-1">
                    {[
                      seekerProfile.name,
                      seekerProfile.email,
                      seekerProfile.phone,
                      seekerProfile.headline,
                      seekerProfile.resumeName,
                    ].filter(Boolean).length * 20}
                    %
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <p className="text-sm font-medium mb-2">Recent Applications</p>
                {seekerDashboard.recentApplications.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-300">
                    {seekerDashboard.recentApplications.map((job) => (
                      <li key={job.id}>
                        {job.title} at {job.company} ({job.location})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No applications yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <p className="text-xs text-slate-400">Total Job Listings</p>
                <p className="text-2xl font-bold mt-1">{employerDashboard.totalListings}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <p className="text-xs text-slate-400">Applications Received</p>
                <p className="text-2xl font-bold mt-1">{employerDashboard.applicationCount}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <p className="text-xs text-slate-400">Candidates Managed</p>
                <p className="text-2xl font-bold mt-1">{employerDashboard.managedCandidates}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
