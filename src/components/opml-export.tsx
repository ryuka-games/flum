"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportOpml } from "@/app/actions/opml";

export function OpmlExport() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const xml = await exportOpml();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flum-subscriptions.opml";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-river-surface hover:text-[var(--text-primary)] disabled:opacity-50"
    >
      <Download size={12} />
      {exporting ? "エクスポート中..." : "OPML エクスポート"}
    </button>
  );
}
