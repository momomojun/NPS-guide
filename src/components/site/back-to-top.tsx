"use client";

import { useSyncExternalStore } from "react";
import { IconArrowUp } from "@/components/icons";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

/** 往下翻了一屏半以上，右下角出现“回到顶部” */
export function BackToTop({ label }: { label: string }) {
  const visible = useSyncExternalStore(subscribe, () => window.scrollY > window.innerHeight * 1.5, () => false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-5 bottom-5 z-40 print:hidden flex size-11 items-center justify-center border border-ink/15 bg-paper/95 text-lg text-ink shadow-sm backdrop-blur transition-[opacity,transform,background-color,color] duration-300 hover:bg-ink hover:text-paper sm:right-8 sm:bottom-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <IconArrowUp />
    </button>
  );
}
