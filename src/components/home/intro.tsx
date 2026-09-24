"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nps-intro";
const SEEN_CLASS = "intro-seen";

/** 播完或跳过：html 加上 intro-seen，之后回到首页不再播，首屏文字也不再等 */
function markSeen() {
  document.documentElement.classList.add(SEEN_CLASS);
}

/**
 * 开场动画：墨色幕布上依次闪过七座公园的名字，然后幕布上拉，露出首屏大图。
 * 每次打开网站只播一次：layout 里的脚本在绘制前检查 sessionStorage，播过就给 html 加
 * intro-seen，CSS 直接隐藏幕布。点一下可以跳过；系统开了“减弱动态效果”时不播。
 * 样式和时间轴在 globals.css 的 .intro。
 */
export function Intro({
  wordmark,
  tagline,
  words,
  skipLabel,
}: {
  wordmark: string;
  tagline: string;
  words: { zh: string; en: string }[];
  skipLabel: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains(SEEN_CLASS)) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 隐私模式下存不了，下次还会播
    }
    const timer = setTimeout(() => {
      markSeen();
      setDone(true);
    }, 3700);
    return () => clearTimeout(timer);
  }, []);

  if (done) return null;

  const skip = () => {
    markSeen();
    setDone(true);
  };

  return (
    <div
      className="intro fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-ink text-paper"
      onClick={skip}
      aria-hidden
    >
      <p
        className="font-serif text-2xl tracking-[0.5em] uppercase sm:text-3xl"
        style={{ animation: "fade 1.4s var(--ease-expo) 0.1s both" }}
      >
        {wordmark}
      </p>
      <span
        className="mt-7 block h-px w-64 bg-paper/35"
        style={{ animation: "grow-x 1.6s var(--ease-expo) 0.3s both" }}
      />
      <div className="relative mt-7 h-20 w-80 overflow-hidden text-center">
        {words.map((word, i) => {
          const last = i === words.length - 1;
          return (
            <p
              key={word.en}
              className="absolute inset-0 opacity-0"
              style={{
                animation: last
                  ? `rise 0.6s var(--ease-expo) ${0.6 + i * 0.26}s both, fade 0.6s ease ${0.6 + i * 0.26}s both`
                  : `intro-word 0.34s ease ${0.6 + i * 0.26}s both`,
              }}
            >
              <span className="block font-serif text-3xl sm:text-4xl">{word.zh}</span>
              <span className="eyebrow mt-2 block text-paper/45">{word.en}</span>
            </p>
          );
        })}
      </div>
      <p className="eyebrow mt-6 text-paper/40" style={{ animation: "fade 1.2s ease 0.9s both" }}>
        {tagline}
      </p>
      <button
        type="button"
        onClick={skip}
        className="eyebrow absolute right-6 bottom-6 text-paper/45 transition-colors hover:text-paper sm:right-10 sm:bottom-8"
      >
        {skipLabel}
      </button>
    </div>
  );
}
