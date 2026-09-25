"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const STORAGE_KEY = "nps-intro";
const SEEN_CLASS = "intro-seen";
/** 播放期间 html 带这个 class，首屏文字的动画先暂停，幕布拉开时再一起出来 */
const PLAYING_CLASS = "intro-playing";
/** 最早什么时候拉开幕布：公园名刚好闪完 */
const MIN_LIFT_MS = 1500;
/** 首屏大图还没加载好，最晚也在这时候拉开 */
const MAX_LIFT_MS = 2600;
/** 幕布上拉的时长，和 globals.css 的 .intro-lift 一致 */
const LIFT_MS = 850;

type Phase = "playing" | "lifting" | "done";

function markSeen() {
  document.documentElement.classList.add(SEEN_CLASS);
  document.documentElement.classList.remove(PLAYING_CLASS);
}

/**
 * 开场动画：墨色幕布上闪过几座公园的名字，首屏大图加载好就把幕布上拉，首屏文字同时出来。
 * 每次打开网站只播一次：layout 里的脚本在绘制前检查 sessionStorage，播过就给 html 加 intro-seen，
 * CSS 直接隐藏幕布；没播过就加 intro-playing，让首屏文字先停在起点。
 * 点一下、按任意键、滚动都会跳过；系统开了“减弱动态效果”时不播。样式在 globals.css 的 .intro。
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
  const [phase, setPhase] = useState<Phase>("playing");
  // 开发模式的 StrictMode 会把 effect 跑两遍，用 ref 记住这次已经开始播，第二遍不当成“播过了”
  const started = useRef(false);
  /** 整页打开时 layout 的脚本已经加了 intro-playing，公园名从首次绘制就开始闪了 */
  const fromBoot = useRef(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (!started.current) {
      fromBoot.current = html.classList.contains(PLAYING_CLASS);
      let seen = html.classList.contains(SEEN_CLASS) || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      try {
        seen ||= Boolean(sessionStorage.getItem(STORAGE_KEY));
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // 隐私模式下存不了，下次还会播
      }
      // 播过了：html 带上 intro-seen，CSS 直接把幕布藏起来
      if (seen) {
        markSeen();
        return;
      }
      started.current = true;
    }
    html.classList.add(PLAYING_CLASS);
    // 播到一半离开首页：别让首屏文字一直停着
    return () => html.classList.remove(PLAYING_CLASS);
  }, []);

  // 名字闪完、大图也加载好了就拉开；等不到大图最晚 MAX_LIFT_MS；用户想跳过就马上拉开
  useEffect(() => {
    if (phase !== "playing" || !started.current) return;
    const lift = () => setPhase((current) => (current === "playing" ? "lifting" : current));
    const heroReady = () => document.documentElement.dataset.heroReady === "1";
    let minPassed = false;
    const onHeroReady = () => {
      if (minPassed) lift();
    };
    // 整页打开时，从首次绘制算起（等 React 接手要一会儿，这段时间公园名已经在闪了）
    const paintedAt =
      performance.getEntriesByName("first-contentful-paint")[0]?.startTime ??
      (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.domInteractive;
    const elapsed = fromBoot.current && paintedAt !== undefined ? performance.now() - paintedAt : 0;
    const minTimer = setTimeout(
      () => {
        minPassed = true;
        if (heroReady()) lift();
      },
      Math.max(0, MIN_LIFT_MS - elapsed),
    );
    const maxTimer = setTimeout(lift, MAX_LIFT_MS);
    const skipEvents = ["keydown", "wheel", "touchmove"] as const;
    window.addEventListener("nps:hero-ready", onHeroReady);
    skipEvents.forEach((type) => window.addEventListener(type, lift, { passive: true }));
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener("nps:hero-ready", onHeroReady);
      skipEvents.forEach((type) => window.removeEventListener(type, lift));
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "lifting") return;
    // 首屏文字跟着幕布一起出来
    document.documentElement.classList.remove(PLAYING_CLASS);
    const timer = setTimeout(() => {
      markSeen();
      setPhase("done");
    }, LIFT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`intro fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-ink text-paper ${
        phase === "lifting" ? "intro-lift" : ""
      }`}
      onClick={() => setPhase((current) => (current === "playing" ? "lifting" : current))}
      aria-hidden
    >
      <p
        className="font-serif text-2xl tracking-[0.5em] uppercase sm:text-3xl"
        style={{ animation: "fade 0.9s var(--ease-expo) 0.05s both" }}
      >
        {wordmark}
      </p>
      <span
        className="mt-7 block h-px w-64 origin-center bg-paper/35"
        style={{ animation: "grow-x 1.1s var(--ease-expo) 0.15s both" }}
      />
      <div className="relative mt-7 h-20 w-80 overflow-hidden text-center">
        {words.map((word, i) => {
          const last = i === words.length - 1;
          const delay = 0.35 + i * 0.2;
          return (
            <p
              key={word.en}
              className="absolute inset-0 opacity-0"
              style={{
                animation: last
                  ? `rise 0.5s var(--ease-expo) ${delay}s both, fade 0.5s ease ${delay}s both`
                  : `intro-word 0.26s ease ${delay}s both`,
              }}
            >
              <span className="block font-serif text-3xl sm:text-4xl">{word.zh}</span>
              <span className="eyebrow mt-2 block text-paper/45">{word.en}</span>
            </p>
          );
        })}
      </div>
      <p className="eyebrow mt-6 text-paper/40" style={{ animation: "fade 0.9s ease 0.6s both" }}>
        {tagline}
      </p>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setPhase((current) => (current === "playing" ? "lifting" : current));
        }}
        className="eyebrow absolute right-6 bottom-6 text-paper/45 transition-colors hover:text-paper sm:right-10 sm:bottom-8"
      >
        {skipLabel}
      </button>
    </div>
  );
}
