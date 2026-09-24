"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IconArrowRight } from "@/components/icons";

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
 * 公园目录：右边一列大字号的公园名，左边一张跟着悬停切换的大图。
 * 窄屏没有大图，每行带一张小图。
 */
export function ParkIndex({ items, inSeasonLabel }: { items: ParkIndexItem[]; inSeasonLabel: string }) {
  const [active, setActive] = useState(items[0]?.code);
  const activeItem = items.find((item) => item.code === active) ?? items[0];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-24 aspect-[4/5] overflow-hidden bg-paper-deep">
          {items.map((item) => (
            <Image
              key={item.code}
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 38vw, 1px"
              className={`object-cover transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                item.code === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
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

      <ol className="border-t border-line lg:col-span-7">
        {items.map((item, i) => (
          <li key={item.code} className="border-b border-line">
            <Link
              href={item.href}
              onMouseEnter={() => setActive(item.code)}
              onFocus={() => setActive(item.code)}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-7 sm:gap-8 lg:py-9"
            >
              <span className="relative block h-20 w-16 overflow-hidden bg-paper-deep lg:hidden">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="hidden w-10 font-serif text-lg text-mute tabular-nums transition-colors duration-500 group-hover:text-clay-600 lg:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-serif text-[1.75rem] leading-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-[2.6rem]">
                    {item.nameZh}
                  </span>
                  <span className="eyebrow text-mute">{item.nameEn}</span>
                  {item.inSeason && (
                    <span className="eyebrow border border-clay-600/40 px-2 py-0.5 text-clay-700">{inSeasonLabel}</span>
                  )}
                </span>
                {/* 每一段不拆行，换行只发生在分隔线处 */}
                <span className="mt-2 flex flex-wrap gap-x-3 text-sm leading-6 text-ink-soft">
                  {[item.tagline, item.region, item.months, item.attractions].map((part, j) => (
                    <span
                      key={part}
                      className={`whitespace-nowrap ${j > 0 ? "before:mr-3 before:text-line before:content-['|']" : ""} ${
                        j === 3 ? "hidden sm:inline" : ""
                      }`}
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
    </div>
  );
}
