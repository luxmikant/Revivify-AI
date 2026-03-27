"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, History, Briefcase, BadgeCheck } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      pathname === path
        ? "bg-rose-600 text-white"
        : "text-slate-300 hover:bg-white/10"
    }`;

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-white/10 backdrop-blur-md bg-white/5">
      <Link
        href="/"
        className="text-lg font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent"
      >
        CareerSpring Platform
      </Link>

      <div className="flex items-center gap-2">
        <Link href="/analyze" className={linkClass("/analyze")}>
          <FileSearch size={16} /> Analyze
        </Link>
        <Link href="/history" className={linkClass("/history")}>
          <History size={16} /> History
        </Link>
        <Link href="/job-portal" className={linkClass("/job-portal")}>
          <Briefcase size={16} /> Job Portal
        </Link>
        <Link
          href="/certificate-verification"
          className={linkClass("/certificate-verification")}
        >
          <BadgeCheck size={16} /> Certificates
        </Link>
        <div className="ml-3">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
