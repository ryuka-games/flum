"use client";

import { useState, useRef, useCallback, type Dispatch, type SetStateAction } from "react";

type UseCardSwipeReturn = {
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  flipped: boolean;
  setFlipped: Dispatch<SetStateAction<boolean>>;
  dragOffset: number;
};

const DEAD_ZONE = 10;
const THRESHOLD = 50;

export function useCardSwipe(): UseCardSwipeReturn {
  const [flipped, setFlipped] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef<"horizontal" | "vertical" | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    locked.current = null;
    setDragOffset(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // デッドゾーン内: まだ方向未確定
    if (!locked.current) {
      if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }

    if (locked.current !== "horizontal") return;

    // 表面: 左スワイプのみ、裏面: 右スワイプのみ
    if (!flipped && dx > 0) return;
    if (flipped && dx < 0) return;

    setDragOffset(dx);
  }, [flipped]);

  const onTouchEnd = useCallback(() => {
    if (locked.current !== "horizontal") {
      setDragOffset(0);
      return;
    }

    const absDrag = Math.abs(dragOffset);
    if (absDrag >= THRESHOLD) {
      setFlipped((prev) => !prev);
    }
    setDragOffset(0);
  }, [dragOffset]);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    flipped,
    setFlipped,
    dragOffset,
  };
}
