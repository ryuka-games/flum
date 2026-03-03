"use client";

import { useSyncExternalStore } from "react";

const query = "(hover: hover)";

let cachedMql: MediaQueryList | null = null;
function getMql() {
  if (!cachedMql) cachedMql = window.matchMedia(query);
  return cachedMql;
}

function subscribe(cb: () => void) {
  const mql = getMql();
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot() {
  return getMql().matches;
}

function getServerSnapshot() {
  return true; // SSR ではホバー対応とみなす
}

/** ホバー対応デバイスかどうかを返す（matchMedia ベース、リアクティブ） */
export function useIsHoverDevice(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
