"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

export function Dropdown({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        {trigger}
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-30 max-h-[70vh] overflow-y-auto rounded-2xl border-2 border-neon-pink bg-river-deep p-3 shadow-[4px_4px_0_var(--accent-cyan)] sm:absolute sm:inset-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          {children}
        </div>
      )}
    </div>
  );
}
