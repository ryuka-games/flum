"use client";

import { useSyncExternalStore } from "react";

/** useSyncExternalStore 用: 購読不要（静的スナップショット） */
const noopSubscribe = () => () => {};

/**
 * クライアント専用の現在時刻。
 * getSnapshot はキャッシュ必須（毎回異なる値を返すと無限ループ）。
 * モジュールロード時に一度だけ Date.now() を計算して以降は同じ値を返す。
 *
 * getServerSnapshot = 0 → SSR/ハイドレーション時はdecay/timeAgoなし（安定HTML）
 * getSnapshot = cachedNow → ハイドレーション後に同期再レンダリング
 */
let cachedNow = 0;
function getClientNow(): number {
  if (!cachedNow) cachedNow = Date.now();
  return cachedNow;
}

export function useClientNow(): number {
  return useSyncExternalStore(noopSubscribe, getClientNow, () => 0);
}
