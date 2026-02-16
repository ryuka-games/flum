"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

const STORAGE_KEY = "flum-theme";
type ThemeChoice = "dark" | "light" | "system";

function getChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "dark" || v === "light") return v;
  return "system";
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function applyTheme(choice: ThemeChoice) {
  let resolved: "dark" | "light";
  if (choice === "system") {
    resolved = matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  } else {
    resolved = choice;
  }
  document.documentElement.dataset.theme = resolved;
}

const CYCLE: ThemeChoice[] = ["dark", "light", "system"];
const ICONS = { dark: Moon, light: Sun, system: Monitor } as const;
const LABELS = { dark: "ダーク", light: "ライト", system: "システム" } as const;

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, getChoice, () => "system" as ThemeChoice);
  const Icon = ICONS[choice];

  const toggle = () => {
    const idx = CYCLE.indexOf(choice);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    // trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent("storage"));
  };

  return (
    <button
      onClick={toggle}
      className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      title={`テーマ: ${LABELS[choice]}`}
    >
      <Icon size={18} />
    </button>
  );
}
