"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ViewTransition, type CSSProperties, type ReactNode } from "react";
import { CommonsImage } from "@/components/commons-image";
import { IconArrowRight } from "@/components/icons";
import { buttonLarge } from "@/components/ui";
import { usePastHero } from "./use-past-hero";

export interface HeroSlide {
  code: string;
  href: string;
  nameZh: string;
  nameEn: string;
  stateEn: string;
  tagline: string;
  /** 1920 宽的大图 */
  image: string;
  credit: string;
  creditHref: string;
}

/** 第一张多停一会儿，给开场动画留时间 */
const FIRST_MS = 7500;

/** 第一张大图加载好了：告诉开场动画可以拉开幕布了 */
function announceReady() {
  document.documentElement.dataset.heroReady = "1";
  window.dispatchEvent(new Event("nps:hero-ready"));
}
const SLIDE_MS = 6500;

const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** 首屏：各公园的大图轮播，慢速推近 + 交叉淡入；左下是标语，底部一条是当前公园和进度 */
export function Hero({
  slides,
  planHref,
  text,
  aside,
}: {
  slides: HeroSlide[];
  planHref: string;
  text: {
    eyebrow: string;
    title: string[];
    subtitle: string;
    planCta: string;
    browseCta: string;
    explore: string;
    previous: string;
    next: string;
  };
  /** 右下角的内容，比如“继续你的行程” */
  aside?: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const firstImage = useRef<HTMLImageElement>(null);
  const pastHero = usePastHero();

  // 第一张图在 React 接手之前就从缓存里加载好了的话，onLoad 不会再触发，这里补一次
  useEffect(() => {
    const image = firstImage.current;
    if (image?.complete && image.naturalWidth > 0) announceReady();
  }, []);
  const count = slides.length;
  const current = slides[index];

  const show = (next: number) => {
    if (next === index) return;
    setPrevious(index);
    setIndex(next);
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setPrevious(index);
        setIndex((index + 1) % count);
      },
      previous === null ? FIRST_MS : SLIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [index, previous, count]);

  // 只挂载当前、上一张（正在淡出）和下一张（预加载），其余不下载
  const mounted = (i: number) => i === index || i === previous || i === (index + 1) % count;
  const animated = (i: number) => i === index || i === previous;

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-white">
      {slides.map((slide, i) => (
        // 点“进入公园”时，当前这张大图过渡成公园页的首图（公园页上有同名的 ViewTransition）
        <ViewTransition
          key={slide.code}
          name={i === index && !pastHero ? `park-photo-${slide.code}` : undefined}
          share="park-morph"
          default="none"
        >
          <div
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            {mounted(i) && (
              <CommonsImage
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                ref={i === 0 ? firstImage : undefined}
                onLoad={i === 0 ? announceReady : undefined}
                sizes="100vw"
                className={`object-cover ${animated(i) ? "animate-kenburns" : ""}`}
              />
            )}
          </div>
        </ViewTransition>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />
      <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/40 to-transparent" />

      {/* 右侧竖排的公园名，跟着轮播换 */}
      <p
        key={`v-${current.code}`}
        className="vertical absolute top-28 right-10 hidden font-serif text-[clamp(2.4rem,4vw,4rem)] leading-none tracking-[0.35em] text-white/90 lg:block"
        style={{ animation: "fade 1.6s var(--ease-expo) both" }}
      >
        {current.nameZh}
      </p>

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-8 sm:px-10 lg:pb-10">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-3xl">
            <p className="eyebrow overflow-hidden text-white/80">
              <span className="hero-rise block" style={order(0)}>
                {text.eyebrow}
              </span>
            </p>
            <h1 className="mt-6 font-serif text-[clamp(2.6rem,6.2vw,6rem)] leading-[1.14] font-normal tracking-[0.02em]">
              {text.title.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span className="hero-rise block" style={order(i + 1)}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-7 max-w-md text-[15px] leading-7 text-white/80" style={order(0)}>
              {text.subtitle}
            </p>
            <div className="hero-fade mt-10 flex flex-wrap items-center gap-8" style={order(1)}>
              <Link href={planHref} className={`${buttonLarge} bg-paper text-ink hover:bg-white`}>
                {text.planCta}
                <IconArrowRight className="text-base" />
              </Link>
              <a href="#parks" className="link-line text-[13px] tracking-[0.14em]">
                {text.browseCta}
              </a>
            </div>
          </div>
          {aside && (
            <div className="hero-fade hidden lg:block" style={order(2)}>
              {aside}
            </div>
          )}
        </div>

        <div className="hero-fade mt-14 grid items-center gap-5 border-t border-white/25 pt-5 md:grid-cols-[1fr_auto]" style={order(3)}>
          <Link key={current.code} href={current.href} className="group flex flex-wrap items-baseline gap-x-4 gap-y-1" style={{ animation: "fade 1.2s var(--ease-expo) both" }}>
            <span className="font-serif text-sm text-white/60 tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <span className="font-serif text-xl">{current.nameZh}</span>
            <span className="eyebrow text-white/60">
              {current.nameEn} · {current.stateEn}
            </span>
            <span className="text-sm text-white/70">{current.tagline}</span>
            <span className="eyebrow inline-flex items-center gap-2 text-white/80 group-hover:text-white">
              {text.explore}
              <IconArrowRight className="transition-transform duration-500 group-hover:translate-x-1" />
            </span>
          </Link>
          {/* 四十座公园放不下一排小横条：只留一条进度线和前后翻页 */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={text.previous}
              onClick={() => show((index - 1 + count) % count)}
              className="grid size-10 place-items-center border border-white/30 transition-colors duration-500 hover:border-white hover:bg-white hover:text-ink"
            >
              <IconArrowRight className="rotate-180" />
            </button>
            <span className="relative block h-px w-32 bg-white/25 sm:w-48" aria-hidden>
              <span
                key={`p-${index}`}
                className="absolute inset-0 origin-left bg-white"
                style={{ animation: `grow-x ${previous === null ? FIRST_MS : SLIDE_MS}ms linear both` }}
              />
            </span>
            <button
              type="button"
              aria-label={text.next}
              onClick={() => show((index + 1) % count)}
              className="grid size-10 place-items-center border border-white/30 transition-colors duration-500 hover:border-white hover:bg-white hover:text-ink"
            >
              <IconArrowRight />
            </button>
          </div>
        </div>
        <a
          href={current.creditHref}
          target="_blank"
          rel="noreferrer"
          className="mt-3 self-end text-[10px] text-white/45 hover:text-white/80"
        >
          {current.credit}
        </a>
      </div>
    </section>
  );
}
