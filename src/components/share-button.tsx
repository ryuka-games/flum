import { CopyButton } from "@/components/copy-button";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  return (
    <span className="relative z-10 inline-flex gap-1.5">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg px-1 text-[var(--text-faded)] hover:text-int-accent"
        aria-label="X に共有"
      >
        𝕏
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg px-1 text-[var(--text-faded)] hover:text-int-accent"
        aria-label="LINE に共有"
      >
        LINE
      </a>
      <CopyButton url={url} />
    </span>
  );
}
