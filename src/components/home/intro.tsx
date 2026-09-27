"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** localStorage 里记上次播放的时间：一天之内打开网站（包括新开标签页）不再重播 */
const STORAGE_KEY = "nps-intro";
const REPLAY_MS = 24 * 60 * 60 * 1000;
const SEEN_CLASS = "intro-seen";
/** 播放期间 html 带这个 class，首屏文字的动画先暂停，幕布拉开时再一起出来 */
const PLAYING_CLASS = "intro-playing";
/** 公园名开始滚动的时间和间隔（秒），和最早拉开幕布的时间对应 */
const WORD_START = 0.3;
const WORD_STEP = 0.22;
/** 最早什么时候拉开：最后一个公园名停稳、能看清 */
const MIN_LIFT_MS = 1550;
/** 首屏大图还没加载好，最晚也在这时候拉开 */
const MAX_LIFT_MS = 2600;
/** 拉开的时长：中线先亮开，上下两半再分开，和 globals.css 的 .intro-lift 一致 */
const LIFT_MS = 1150;

type Phase = "playing" | "lifting" | "done";

function markSeen() {
  document.documentElement.classList.add(SEEN_CLASS);
  document.documentElement.classList.remove(PLAYING_CLASS);
}

/** 一天内播过、或者系统开了“减弱动态效果”就不播；网址带 ?intro 时强制重播（演示、截图用） */
function shouldPlay(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (new URLSearchParams(window.location.search).has("intro")) return true;
  try {
    return Date.now() - Number(localStorage.getItem(STORAGE_KEY) ?? 0) >= REPLAY_MS;
  } catch {
    // 隐私模式下读不了，就每次都播
    return true;
  }
}

/**
 * 开场动画：墨色幕布上写着站名，中间一条细线；几座公园的名字在线下滚过，最后停在首屏大图的那座公园。
 * 首屏大图加载好，细线就向两边亮开，幕布从中线上下分开，露出大图，首屏文字同时出来。
 * 一天只播一次：layout 里的脚本在绘制前检查 localStorage，播过就给 html 加 intro-seen，
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
  /** 依次滚过的公园名，最后一个停住（应该是首屏第一张大图的公园） */
  words: { zh: string; en: string }[];
  skipLabel: string;
}) {
  const [phase, setPhase] = useState<Phase>("playing");
  // 开发模式的 StrictMode 会把 effect 跑两遍，用 ref 记住这次已经开始播，第二遍不当成“播过了”
  const started = useRef(false);
  /** 整页打开时 layout 的脚本已经加了 intro-playing，公园名从首次绘制就开始滚了 */
  const fromBoot = useRef(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    if (!started.current) {
      fromBoot.current = html.classList.contains(PLAYING_CLASS);
      const play = shouldPlay();
      try {
        if (play) localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // 存不了就算了，下次还会播
      }
      // 播过了：html 带上 intro-seen，CSS 直接把幕布藏起来
      if (!play) {
        markSeen();
        return;
      }
      html.classList.remove(SEEN_CLASS);
      started.current = true;
    }
    html.classList.add(PLAYING_CLASS);
    // 播到一半离开首页：别让首屏文字一直停着
    return () => html.classList.remove(PLAYING_CLASS);
  }, []);

  // 名字滚完、大图也加载好了就拉开；等不到大图最晚 MAX_LIFT_MS；用户想跳过就马上拉开
  useEffect(() => {
    if (phase !== "playing" || !started.current) return;
    const lift = () => setPhase((current) => (current === "playing" ? "lifting" : current));
    const heroReady = () => document.documentElement.dataset.heroReady === "1";
    let minPassed = false;
    const onHeroReady = () => {
      if (minPassed) lift();
    };
    // 整页打开时，从首次绘制算起（等 React 接手要一会儿，这段时间公园名已经在滚了）
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
    const maxTimer = setTimeout(lift, Math.max(0, MAX_LIFT_MS - elapsed));
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
  const skip = () => setPhase((current) => (current === "playing" ? "lifting" : current));

  return (
    <div className={`intro fixed inset-0 z-[100] cursor-pointer text-paper ${phase === "lifting" ? "intro-lift" : ""}`} onClick={skip} aria-hidden>
      {/* 上半：站名，贴着中线 */}
      <div className="intro-half intro-top absolute inset-x-0 top-0 flex h-[calc(50%+1px)] flex-col items-center justify-end bg-ink pb-8">
        <div className="intro-text">
          <p className="intro-wordmark font-serif text-2xl uppercase sm:text-3xl">{wordmark}</p>
        </div>
      </div>

      {/* 下半：公园名滚过，最后停在首屏那座；下面是一行小字 */}
      <div className="intro-half intro-bottom absolute inset-x-0 bottom-0 flex h-[calc(50%+1px)] flex-col items-center bg-ink pt-4">
        <div className="intro-text flex flex-col items-center">
          <div className="intro-words relative h-24 w-80 overflow-hidden text-center">
            {words.map((word, i) => {
              const last = i === words.length - 1;
              const delay = WORD_START + i * WORD_STEP;
              return (
                <p
                  key={word.en}
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-0"
                  style={{
                    animation: last
                      ? `rise 0.6s var(--ease-expo) ${delay}s both, fade 0.6s ease ${delay}s both`
                      : `intro-roll ${WORD_STEP * 1.7}s var(--ease-expo) ${delay}s both`,
                  }}
                >
                  <span className="block font-serif text-3xl sm:text-4xl">{word.zh}</span>
                  <span className="eyebrow mt-2 block text-paper/45">{word.en}</span>
                </p>
              );
            })}
          </div>
          <p className="eyebrow mt-5 text-paper/40" style={{ animation: "fade 0.9s ease 0.6s both" }}>
            {tagline}
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            skip();
          }}
          className="eyebrow absolute right-6 bottom-6 text-paper/45 transition-colors hover:text-paper sm:right-10 sm:bottom-8"
        >
          {skipLabel}
        </button>
      </div>

      {/* 中线：播放时从中间画出来，拉开时先向两边亮开，再随着幕布分开淡掉 */}
      <span className="intro-seam absolute top-1/2 left-1/2 block h-px w-64 -translate-x-1/2">
        <span className="block h-full w-full origin-center bg-paper/35" style={{ animation: "grow-x 1.1s var(--ease-expo) 0.15s both" }} />
      </span>
    </div>
  );
}
