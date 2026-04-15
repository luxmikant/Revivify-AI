"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Command as CommandIcon, FileSearch, History, Home, Briefcase, BadgeCheck } from "lucide-react";
import { useUIAudio } from "@/components/GlobalAudioController";

type PaletteCommand = {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
};

export default function GlobalCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { play } = useUIAudio();

  const navigate = useCallback(
    (path: string) => {
      play("confirm");
      router.push(path);
      setOpen(false);
    },
    [play, router]
  );

  const commands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "home",
        label: "Go to home",
        shortcut: "H",
        action: () => navigate("/"),
      },
      {
        id: "analyze",
        label: "Analyze a resume",
        shortcut: "A",
        action: () => navigate("/analyze"),
      },
      {
        id: "history",
        label: "Open analysis history",
        shortcut: "Y",
        action: () => navigate("/history"),
      },
      {
        id: "jobs",
        label: "Open job portal",
        shortcut: "J",
        action: () => navigate("/job-portal"),
      },
      {
        id: "certificates",
        label: "Open certificate verification",
        shortcut: "C",
        action: () => navigate("/certificate-verification"),
      },
    ],
    [navigate]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCommandKey = event.metaKey || event.ctrlKey;
      if (isCommandKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        play("open");
        setOpen((previous) => !previous);
      }

      if (!open || !event.altKey) return;

      const matching = commands.find(
        (command) => command.shortcut?.toLowerCase() === event.key.toLowerCase()
      );

      if (matching) {
        event.preventDefault();
        matching.action();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commands, open, play]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          play("open");
          setOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-rose-300/60 hover:text-white"
      >
        <CommandIcon size={14} className="text-amber-300" />
        Command Menu
        <span className="rounded-md border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300">
          Ctrl/Cmd+K
        </span>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global command palette"
        className="fixed left-1/2 top-[15vh] z-50 w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#09090b]/95 shadow-[0_40px_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      >
        <div className="border-b border-white/10 px-4 py-2">
          <Command.Input
            autoFocus
            placeholder="Search routes and actions..."
            className="w-full bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-4 text-sm text-slate-400">
            No matching commands.
          </Command.Empty>

          <Command.Group heading="Navigate" className="text-xs text-slate-400">
            <Command.Item
              value="Go to home"
              onSelect={() => navigate("/")}
              data-command-item="true"
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 transition data-[selected=true]:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <Home size={14} className="text-slate-300" /> Home
              </span>
              <span className="text-[10px] text-slate-500">Alt+H</span>
            </Command.Item>

            <Command.Item
              value="Analyze a resume"
              onSelect={() => navigate("/analyze")}
              data-command-item="true"
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 transition data-[selected=true]:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <FileSearch size={14} className="text-rose-300" /> Analyze
              </span>
              <span className="text-[10px] text-slate-500">Alt+A</span>
            </Command.Item>

            <Command.Item
              value="Open analysis history"
              onSelect={() => navigate("/history")}
              data-command-item="true"
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 transition data-[selected=true]:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <History size={14} className="text-amber-300" /> History
              </span>
              <span className="text-[10px] text-slate-500">Alt+Y</span>
            </Command.Item>

            <Command.Item
              value="Open job portal"
              onSelect={() => navigate("/job-portal")}
              data-command-item="true"
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 transition data-[selected=true]:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <Briefcase size={14} className="text-rose-300" /> Job Portal
              </span>
              <span className="text-[10px] text-slate-500">Alt+J</span>
            </Command.Item>

            <Command.Item
              value="Open certificate verification"
              onSelect={() => navigate("/certificate-verification")}
              data-command-item="true"
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 transition data-[selected=true]:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={14} className="text-amber-300" /> Certificate Verification
              </span>
              <span className="text-[10px] text-slate-500">Alt+C</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
