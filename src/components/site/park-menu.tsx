"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { IconArrowRight, IconChevronRight, IconClose, IconMenu } from "@/components/icons";

export interface MenuRegion {
  id: string;
  label: string;
  parks: { code: string; nameZh: string; nameEn: string; bestMonths: number[] }[];
}

export interface MenuText {
  parks: string;
  plan: string;
  when: string;
  routes: string;
  prices: string;
  start: string;
  allParks: string;
  inSeason: string;
  menu: string;
  close: string;
}

const noSubscribe = () => () => {};
/** 当前月份只在浏览器里算（页面是静态生成的），服务端渲染时不显示“当季” */
const useMonth = () =>
  useSyncExternalStore(
    noSubscribe,
    () => new Date().getMonth() + 1,
    () => null,
  );

function ParkLink({
  locale,
  park,
  month,
  inSeasonLabel,
  onNavigate,
}: {
  locale: string;
  park: MenuRegion["parks"][number];
  month: number | null;
  inSeasonLabel: string;
  onNavigate: () => void;
}) {
  return (
    <Link href={`/${locale}/parks/${park.code}`} onClick={onNavigate} className="group block py-1">
      <span className="font-serif text-lg leading-tight transition-colors group-hover:text-clay-700">{park.nameZh}</span>
      {month !== null && park.bestMonths.includes(month) && (
        <span className="ml-2 align-middle text-[10px] tracking-[0.1em] text-clay-700">{inSeasonLabel}</span>
      )}
      <span className="block text-[10px] tracking-[0.14em] text-mute uppercase">{park.nameEn}</span>
    </Link>
  );
}

/** 宽屏页头的“公园”：悬停或点击展开，按片区列出所有公园，不用回首页往下翻 */
export function ParksMenu({
  locale,
  regions,
  text,
  onOpenChange,
}: {
  locale: string;
  regions: MenuRegion[];
  text: MenuText;
  /** 展开时页头改成实色，免得透明页头压在大图上看不清 */
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpenState] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const month = useMonth();
  const setOpen = (value: boolean) => {
    clearTimeout(closeTimer.current);
    setOpenState(value);
    onOpenChange(value);
  };

  // 按 Esc 关掉
  const closeOnEscape = useEffectEvent(() => setOpen(false));
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOnEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        // 鼠标从按钮移到面板中间有段空隙，稍等一下再关
        closeTimer.current = setTimeout(() => setOpen(false), 180);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 hover:opacity-60"
      >
        {text.parks}
        <IconChevronRight className={`text-[10px] transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>
      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-line bg-paper text-ink shadow-[0_18px_40px_-24px_rgb(28_27_24/0.45)]">
          <div className="mx-auto grid max-w-[1600px] grid-cols-4 gap-x-10 gap-y-8 px-10 pt-9 pb-6 tracking-normal whitespace-normal xl:grid-cols-7">
            {regions.map((region) => (
              <div key={region.id}>
                <p className="eyebrow text-mute">{region.label}</p>
                <ul className="mt-3 space-y-2">
                  {region.parks.map((park) => (
                    <li key={park.code}>
                      <ParkLink
                        locale={locale}
                        park={park}
                        month={month}
                        inSeasonLabel={text.inSeason}
                        onNavigate={() => setOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mx-auto flex max-w-[1600px] justify-end px-10 pb-7">
            <Link
              href={`/${locale}#parks`}
              onClick={() => setOpen(false)}
              className="link-line inline-flex items-center gap-2 text-xs tracking-[0.12em]"
            >
              {text.allParks}
              <IconArrowRight />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** 手机页头的菜单：全屏展开，行程、开始规划和所有公园 */
export function MobileMenu({
  locale,
  wordmark,
  regions,
  text,
}: {
  locale: string;
  wordmark: string;
  regions: MenuRegion[];
  text: MenuText;
}) {
  const [open, setOpen] = useState(false);
  const month = useMonth();

  // 菜单打开时后面的页面不跟着滚
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button type="button" aria-label={text.menu} aria-expanded={open} onClick={() => setOpen(true)} className="text-xl sm:hidden">
        <IconMenu />
      </button>
      {/* 页头有 backdrop-filter，会把 fixed 的子元素限制在页头里，所以菜单挂到 body 上 */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-paper text-ink tracking-normal whitespace-normal sm:hidden">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Link href={`/${locale}`} onClick={close} className="font-serif text-base tracking-[0.3em] uppercase">
              {wordmark}
            </Link>
            <button type="button" aria-label={text.close} onClick={close} className="text-xl">
              <IconClose />
            </button>
          </div>
          <nav className="space-y-9 px-5 pt-7 pb-16">
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/${locale}/plan`} onClick={close} className="bg-ink px-4 py-3 text-center text-sm tracking-[0.12em] text-paper">
                {text.start}
              </Link>
              <Link href={`/${locale}/plan`} onClick={close} className="border border-ink/25 px-4 py-3 text-center text-sm tracking-[0.12em]">
                {text.plan}
              </Link>
              <Link href={`/${locale}/when`} onClick={close} className="border border-ink/25 px-4 py-3 text-center text-sm tracking-[0.12em]">
                {text.when}
              </Link>
              <Link href={`/${locale}/routes`} onClick={close} className="border border-ink/25 px-4 py-3 text-center text-sm tracking-[0.12em]">
                {text.routes}
              </Link>
              <Link href={`/${locale}/prices`} onClick={close} className="border border-ink/25 px-4 py-3 text-center text-sm tracking-[0.12em]">
                {text.prices}
              </Link>
            </div>
            {regions.map((region) => (
              <div key={region.id}>
                <p className="eyebrow border-b border-line pb-2 text-mute">{region.label}</p>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {region.parks.map((park) => (
                    <li key={park.code}>
                      <ParkLink locale={locale} park={park} month={month} inSeasonLabel={text.inSeason} onNavigate={close} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>,
          document.body,
        )}
    </>
  );
}
