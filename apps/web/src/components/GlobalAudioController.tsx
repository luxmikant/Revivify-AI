"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

type AudioCue = "tick" | "open" | "confirm";

type UIAudioContextType = {
  enabled: boolean;
  toggle: () => void;
  play: (cue?: AudioCue) => void;
};

const UIAudioContext = createContext<UIAudioContextType | null>(null);

const STORAGE_KEY = "careerspring.audio.enabled";

function cueConfig(cue: AudioCue) {
  if (cue === "open") {
    return {
      frequencies: [320, 460],
      gain: 0.022,
      duration: 0.08,
      type: "triangle" as OscillatorType,
    };
  }

  if (cue === "confirm") {
    return {
      frequencies: [390, 560],
      gain: 0.026,
      duration: 0.1,
      type: "sine" as OscillatorType,
    };
  }

  return {
    frequencies: [420],
    gain: 0.018,
    duration: 0.06,
    type: "sine" as OscillatorType,
  };
}

export function useUIAudio() {
  const context = useContext(UIAudioContext);
  if (!context) {
    return {
      enabled: false,
      toggle: () => undefined,
      play: () => undefined,
    };
  }
  return context;
}

export default function GlobalAudioController({ children }: PropsWithChildren) {
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const lastInteractionAtRef = useRef(0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setEnabled(stored === "true");
    } catch {
      setEnabled(false);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled, hydrated]);

  const ensureContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioContextRef.current = new Ctx();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const play = useCallback(
    (cue: AudioCue = "tick") => {
      if (!enabled) return;

      const now = Date.now();
      if (now - lastInteractionAtRef.current < 60) return;
      lastInteractionAtRef.current = now;

      const context = ensureContext();
      if (!context) return;

      const config = cueConfig(cue);

      config.frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);

        const startAt = context.currentTime + index * 0.012;
        const endAt = startAt + config.duration;

        gainNode.gain.setValueAtTime(0.0001, startAt);
        gainNode.gain.exponentialRampToValueAtTime(config.gain, startAt + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(startAt);
        oscillator.stop(endAt + 0.015);
      });
    },
    [enabled, ensureContext]
  );

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "button, a, [role='button'], [data-sound='click'], [data-command-item]"
      );

      if (interactive) {
        play("tick");
      }
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [play]);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(() => play("open"));
      }
      return next;
    });
  }, [play]);

  const value = useMemo(
    () => ({ enabled, toggle, play }),
    [enabled, toggle, play]
  );

  return (
    <UIAudioContext.Provider value={value}>
      {children}

      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? "Mute interface audio" : "Enable interface audio"}
        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-amber-300/60 hover:text-white"
      >
        {enabled ? (
          <>
            <Volume2 size={14} className="text-amber-300" /> Audio On
          </>
        ) : (
          <>
            <VolumeX size={14} className="text-slate-400" /> Audio Off
          </>
        )}
      </button>
    </UIAudioContext.Provider>
  );
}
