"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

/**
 * 首页往下滚过了首屏的一半没有。
 * 点进公园页时放大成首图的照片（同名 ViewTransition）一次只能有一张：
 * 还在首屏时是轮播的大图，滚下去以后是公园目录左边的大图。
 */
export function usePastHero() {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY >= window.innerHeight / 2,
    () => false,
  );
}
