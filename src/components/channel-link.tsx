"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ChannelLink({ id, name }: { id: string; name: string }) {
  const pathname = usePathname();
  const isActive = pathname === `/channels/${id}`;

  return (
    <Link
      href={`/channels/${id}`}
      className={`mb-1 flex items-center rounded px-2 py-1.5 text-sm hover:bg-zinc-800 hover:text-white ${
        isActive ? "bg-zinc-800 text-white" : ""
      }`}
    >
      <span className="mr-1.5 text-zinc-500">#</span>
      {name}
    </Link>
  );
}
