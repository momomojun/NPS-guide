"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

export interface SectionLink {
  /** 页面上对应元素的 id */
  id: string;
  label: string;
  /** 小色条，比如每天的颜色 */
  color?: string;
  /** 只在窄屏显示（比如行程页的地图：宽屏时地图一直在右边） */
  mobileOnly?: boolean;
}

/** 和 Tailwind 的 lg 断点一致 */
const WIDE = 1024;

/** 区块顶部滚过这条线（页头 64px + 本导航条约 44px，再往下一点）就算“正在看这一块” */
const ACTIVE_LINE = 140;

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

/**
 * 长页面上的吸顶导航：点一下跳到对应区块，滚动时高亮当前区块。
 * 区块要带 id，并留出 scroll-mt（页头 + 导航条的高度），跳过去时标题不被挡住。
 */
export function SectionNav({
  items,
  label,
  actions,
  inset = false,
}: {
  items: SectionLink[];
  /** 放在已经有左右内边距的容器里（行程页） */
  inset?: boolean;
  /** 给读屏用的导航名称 */
  label: string;
  /** 右边的按钮，比如“生成这个公园的攻略” */
  actions?: ReactNode;
}) {
  // 宽屏时只在窄屏显示的项不参与高亮
  const ids = items.map((item) => `${item.mobileOnly ? "~" : ""}${item.id}`).join("|");
  const active = useSyncExternalStore(
    subscribe,
    () => {
      // 滚过那条线的区块里，离线最近（最靠下）的那个；吸顶的地图这种一直贴在上面的不算
      let current: string | null = null;
      let best = -Infinity;
      const wide = window.innerWidth >= WIDE;
      for (const entry of ids.split("|")) {
        const mobileOnly = entry.startsWith("~");
        if (mobileOnly && wide) continue;
        const id = mobileOnly ? entry.slice(1) : entry;
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= ACTIVE_LINE && top >= best) {
          best = top;
          current = id;
        }
      }
      return current;
    },
    () => null,
  );

  // 窄屏时导航条可以横向滚动：当前那一项滚到看得见的地方
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const link = active ? list?.querySelector<HTMLElement>(`[data-section="${active}"]`) : null;
    if (!list || !link) return;
    const left = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label={label}
      className={`sticky top-16 z-40 border-b border-line bg-paper/95 backdrop-blur-md print:hidden ${inset ? "-mx-5 px-5 sm:-mx-10 sm:px-10" : ""}`}
    >
      <div className={`flex items-center gap-6 ${inset ? "" : "mx-auto max-w-[1600px] px-5 sm:px-10"}`}>
        <ul ref={listRef} className="no-scrollbar flex min-w-0 flex-1 gap-x-6 overflow-x-auto text-[13px] whitespace-nowrap">
          {items.map((item) => {
            const current = item.id === active;
            return (
              <li key={item.id} className={item.mobileOnly ? "lg:hidden" : undefined}>
                <a
                  href={`#${item.id}`}
                  data-section={item.id}
                  aria-current={current ? "location" : undefined}
                  className={`flex items-center gap-1.5 border-b-2 py-3 transition-colors ${
                    current ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink"
                  }`}
                >
                  {item.color && <span aria-hidden className="inline-block h-[3px] w-3" style={{ backgroundColor: item.color }} />}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
        {actions && <div className="hidden shrink-0 sm:block">{actions}</div>}
      </div>
    </nav>
  );
}
