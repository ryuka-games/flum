"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ChannelLink({ id, name }: { id: string; name: string }) {
  const pathname = usePathname();
  const isActive = pathname === `/channels/${id}`;

  return (
    <Link
      href={`/channels/${id}`}
      className={`mb-1 flex items-center rounded px-2 py-1.5 text-sm hover:bg-river-surface hover:text-[var(--text-primary)] ${
        isActive
          ? "border-l-[3px] border-neon-pink bg-river-surface text-[var(--text-primary)]"
          : "border-l-[3px] border-transparent"
      }`}
    >
      <span className="mr-1.5 text-[var(--text-muted)]">#</span>
      {name}
    </Link>
  );
}
