"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { CommonsImage } from "@/components/commons-image";
import { IconArrowRight } from "@/components/icons";
import { usePastHero } from "./use-past-hero";

export interface ParkIndexItem {
  code: string;
  href: string;
  nameZh: string;
  nameEn: string;
  stateEn: string;
  region: string;
  tagline: string;
  /** “最佳 5–10 月” */
  months: string;
  /** “14 个景点” */
  attractions: string;
  inSeason: boolean;
  image: string;
}

/**
 * 公园目录：右边按片区分组、大字号的公园名，左边一张吸顶的大图。
 * 大图跟着悬停切换，也跟着滚动切换（滚到屏幕中线的那一行），上面标着第几座、哪个片区。
 * 窄屏没有大图，每行带一张小图。
 */
export function ParkIndex({ items, inSeasonLabel }: { items: ParkIndexItem[]; inSeasonLabel: string }) {
  const [active, setActive] = useState(items[0]?.code);
  // 大图只加载看到过的公园，不然一打开首页就同时下载几十张
  const [shown, setShown] = useState(() => new Set([items[0]?.code]));
  const list = useRef<HTMLDivElement>(null);
  const pastHero = usePastHero();
  const activeIndex = Math.max(0, items.findIndex((item) => item.code === active));
  const activeItem = items[activeIndex];
  const activate = (code: string) => {
    setActive(code);
    setShown((current) => (current.has(code) ? current : new Set(current).add(code)));
  };

  // 宽屏上滚到屏幕中线的那一行就换图（窄屏没有大图，不用管）
  useEffect(() => {
    const root = list.current;
    if (!root || !window.matchMedia("(min-width: 1024px)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const code = (entry.target as HTMLElement).dataset.code;
          if (!entry.isIntersecting || !code) continue;
          setActive(code);
          setShown((current) => (current.has(code) ? current : new Set(current).add(code)));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    root.querySelectorAll("[data-code]").forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  // 按片区分组，保持原来的先后顺序；编号全目录连续
  const groups: { region: string; items: { item: ParkIndexItem; n: number }[] }[] = [];
  items.forEach((item, i) => {
    const last = groups.at(-1);
    if (last?.region === item.region) last.items.push({ item, n: i + 1 });
    else groups.push({ region: item.region, items: [{ item, n: i + 1 }] });
  });
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-24 aspect-[4/5] max-h-[calc(100svh-8rem)] w-full overflow-hidden bg-paper-deep">
          {/* fill 的图片要放在 absolute / relative 的容器里，sticky 不算 */}
          <div className="absolute inset-0">
            {items
              .filter((item) => item.image && shown.has(item.code))
              .map((item) => (
                // 点进公园页时这张图放大成公园页的首图（公园页上有同名的 ViewTransition）
                <ViewTransition
                  key={item.code}
                  name={pastHero ? `park-photo-${item.code}` : undefined}
                  share="park-morph"
                  default="none"
                >
                  <div
                    className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      item.code === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
                    }`}
                  >
                    <CommonsImage src={item.image} alt="" fill sizes="(min-width: 1024px) 38vw, 1px" className="object-cover" />
                  </div>
                </ViewTransition>
              ))}
          </div>
          <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/45 to-transparent px-7 pt-6 pb-16 text-white">
            <p className="font-serif text-lg tabular-nums">
              <span key={activeItem.code} className="inline-block" style={{ animation: "fade 0.8s var(--ease-expo) both" }}>
                {pad(activeIndex + 1)}
              </span>
              <span className="text-white/55"> / {pad(items.length)}</span>
            </p>
            <p className="eyebrow text-white/75">{activeItem.region}</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-7 pt-24 pb-7 text-white">
            <p key={activeItem.code} className="font-serif text-2xl" style={{ animation: "fade 1s var(--ease-expo) both" }}>
              {activeItem.tagline}
            </p>
            <p className="eyebrow mt-2 text-white/70">
              {activeItem.nameEn} · {activeItem.stateEn}
            </p>
          </div>
        </div>
      </div>

      <div ref={list} className="lg:col-span-7">
        {groups.map((group) => (
          <section key={group.region} className="mb-14 last:mb-0 lg:mb-20">
            <h3 className="flex items-baseline justify-between border-b border-ink pb-3">
              <span className="eyebrow text-ink">{group.region}</span>
              <span className="font-serif text-sm text-mute tabular-nums">
                {pad(group.items[0].n)}
                {group.items.length > 1 && `–${pad(group.items.at(-1)!.n)}`}
              </span>
            </h3>
            <ol>
              {group.items.map(({ item, n }) => (
                <li key={item.code} data-code={item.code} className="border-b border-line">
                  <Link
                    href={item.href}
                    onMouseEnter={() => activate(item.code)}
                    onFocus={() => activate(item.code)}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-6 sm:gap-8 lg:py-7"
                  >
                    <span className="relative block h-20 w-16 overflow-hidden bg-paper-deep lg:hidden">
                      {item.image && <CommonsImage src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <span
                      className={`hidden w-10 font-serif text-lg tabular-nums transition-colors duration-500 group-hover:text-clay-600 lg:block ${
                        item.code === active ? "text-clay-600" : "text-mute"
                      }`}
                    >
                      {pad(n)}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-serif text-[1.75rem] leading-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-[2.4rem]">
                          {item.nameZh}
                        </span>
                        <span className="eyebrow text-mute">{item.nameEn}</span>
                        {item.inSeason && (
                          <span className="eyebrow inline-flex items-center gap-1.5 text-clay-700">
                            <span className="size-1.5 rounded-full bg-clay-600" aria-hidden />
                            {inSeasonLabel}
                          </span>
                        )}
                      </span>
                      {/* 每一段不拆行，换行只发生在分隔线处；片区已经写在组标题上 */}
                      <span className="mt-2 flex flex-wrap gap-x-3 text-sm leading-6 text-ink-soft">
                        {[item.tagline, item.months, item.attractions].map((part, j) => (
                          <span
                            key={part}
                            // 手机上简介单独一行、下一行是最佳月份，分隔线只在同一行里出现
                            className={`whitespace-nowrap ${j === 0 ? "basis-full sm:basis-auto" : ""} ${
                              j > 0 ? "text-mute sm:text-ink-soft sm:before:mr-3 sm:before:text-line sm:before:content-['|']" : ""
                            } ${j === 2 ? "hidden sm:inline" : ""}`}
                          >
                            {part}
                          </span>
                        ))}
                      </span>
                    </span>
                    <IconArrowRight className="text-xl text-ink/30 transition-all duration-500 group-hover:translate-x-1 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
