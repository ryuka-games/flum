"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
import { CopyButton } from "@/components/copy-button";

export function SharePopover({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [open, setOpen] = useState(false);

  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    transform: false,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="relative z-10 cursor-pointer text-[var(--text-muted)] hover:text-int-accent"
        aria-label="共有"
      >
        <Share2 size={14} />
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="tooltip-pop z-50 rounded-xl border-2 border-neon-pink bg-river-deep px-1 py-1 shadow-[2px_2px_0_var(--accent-cyan)]"
          >
            <div className="flex flex-col gap-0.5 text-xs font-semibold">
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-[var(--text-primary)] hover:bg-white/10 hover:text-int-accent"
              >
                𝕏 に共有
              </a>
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-[var(--text-primary)] hover:bg-white/10 hover:text-int-accent"
              >
                LINE に共有
              </a>
              <div className="rounded-lg px-3 py-1.5 text-[var(--text-primary)] hover:bg-white/10">
                <CopyButton url={url} />
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
