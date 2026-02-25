"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { parseOpml, type OpmlChannel } from "@/lib/opml";
import { importOpml, type ImportResult } from "@/app/actions/opml";

type Phase = "idle" | "preview" | "importing" | "done";

export function OpmlImport() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [channels, setChannels] = useState<OpmlChannel[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseOpml(reader.result as string);
        if (parsed.length === 0) {
          setError("フィードが見つかりませんでした");
          return;
        }
        setChannels(parsed);
        setPhase("preview");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ファイルを読み込めませんでした",
        );
      }
    };
    reader.readAsText(file);

    // 同じファイルを再選択できるようにリセット
    e.target.value = "";
  }

  async function handleImport() {
    setPhase("importing");
    try {
      const res = await importOpml(channels);
      setResult(res);
      setPhase("done");
    } catch {
      setError("インポートに失敗しました");
      setPhase("preview");
    }
  }

  function handleClose() {
    setPhase("idle");
    setChannels([]);
    setResult(null);
    setError(null);
  }

  const totalFeeds = channels.reduce((sum, ch) => sum + ch.feeds.length, 0);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".opml,.xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {phase === "idle" && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-river-surface hover:text-[var(--text-primary)]"
        >
          <Upload size={12} />
          OPML インポート
        </button>
      )}

      {error && phase === "idle" && (
        <p className="mt-1 px-3 text-xs text-red-400">{error}</p>
      )}

      {/* プレビュー / 結果モーダル */}
      {phase !== "idle" && (
        <div className="mt-2 rounded-xl bg-river-surface p-3">
          {phase === "preview" && (
            <>
              <p className="mb-2 text-xs font-bold text-[var(--text-primary)]">
                {channels.length} チャンネル / {totalFeeds} フィード
              </p>
              <ul className="mb-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                {channels.map((ch) => (
                  <li key={ch.name} className="text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">
                      {ch.name}
                    </span>{" "}
                    — {ch.feeds.length} フィード
                  </li>
                ))}
              </ul>
              {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleImport}
                  className="rounded-full border-2 border-neon-pink bg-neon-pink px-3 py-1 text-xs font-bold text-white shadow-[2px_2px_0_var(--accent-cyan)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--accent-cyan)]"
                >
                  インポート
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  キャンセル
                </button>
              </div>
            </>
          )}

          {phase === "importing" && (
            <p className="text-xs text-[var(--text-secondary)]">
              インポート中...
            </p>
          )}

          {phase === "done" && result && (
            <>
              <p className="mb-2 text-xs text-[var(--text-primary)]">
                {result.channelsCreated > 0 && (
                  <>
                    <span className="font-bold text-neon-pink">
                      {result.channelsCreated}
                    </span>{" "}
                    チャンネル作成
                    {result.feedsAdded > 0 && "、"}
                  </>
                )}
                {result.feedsAdded > 0 && (
                  <>
                    <span className="font-bold text-neon-pink">
                      {result.feedsAdded}
                    </span>{" "}
                    フィード追加
                  </>
                )}
                {result.feedsSkipped > 0 && (
                  <>
                    （{result.feedsSkipped} スキップ）
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                閉じる
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
