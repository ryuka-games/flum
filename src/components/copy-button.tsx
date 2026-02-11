"use client";

import { useState } from "react";

export function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="cursor-pointer rounded px-1 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-200"
      title="URL をコピー"
    >
      {copied ? "✓" : "URL"}
    </button>
  );
}
