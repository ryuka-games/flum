"use client";

import { useState, useId, cloneElement, isValidElement } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  type Placement,
} from "@floating-ui/react";

/* ─────────────────────────────────────────────
   Tooltip — Flum 共通ツールチップ
   ドーナドーナ準拠: ピンク枠 + シアンシャドウ + ポンッ入場
   パネルのミニ版（rounded-xl, shadow 2px）
   ───────────────────────────────────────────── */

/* グループスキャン: 1つ目の tooltip が開いた後、
   300ms 以内に別の tooltip をホバーすると遅延 0ms で即表示 */
let groupTimeout: ReturnType<typeof setTimeout> | null = null;
let isGroupOpen = false;

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: Placement;
  delayMs?: number;
}

export function Tooltip({
  children,
  content,
  placement = "top",
  delayMs = 150,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      setOpen(next);
      if (next) {
        isGroupOpen = true;
        if (groupTimeout) clearTimeout(groupTimeout);
      } else {
        groupTimeout = setTimeout(() => {
          isGroupOpen = false;
        }, 300);
      }
    },
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: isGroupOpen ? 0 : delayMs, close: 100 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // children に ref + props を注入
  const trigger = isValidElement(children)
    ? cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
        "aria-describedby": open ? id : undefined,
      } as Record<string, unknown>)
    : children;

  return (
    <>
      {trigger}

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            id={id}
            role="tooltip"
            style={floatingStyles}
            {...getFloatingProps()}
            className="tooltip-pop z-50 max-w-[200px] break-all rounded-xl border-2 border-neon-pink bg-river-deep px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-[2px_2px_0_var(--accent-cyan)]"
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
