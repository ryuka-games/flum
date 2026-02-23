"use client";

import { deleteFeedSource } from "@/app/actions/feed";
import { deleteItemsBySourceId } from "@/lib/feed/store";

export function DeleteFeedSourceButton({
  sourceId,
  channelId,
}: {
  sourceId: string;
  channelId: string;
}) {
  const handleAction = async (formData: FormData) => {
    await deleteFeedSource(formData);
    await deleteItemsBySourceId(sourceId);
  };

  return (
    <form action={handleAction} className="inline">
      <input type="hidden" name="id" value={sourceId} />
      <input type="hidden" name="channel_id" value={channelId} />
      <button
        type="submit"
        className="text-[var(--text-muted)] hover:text-red-400"
        aria-label="ソース削除"
      >
        ×
      </button>
    </form>
  );
}
