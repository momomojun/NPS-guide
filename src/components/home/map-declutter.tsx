"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { LABEL_CLASS, SIDES, type Side } from "./map-sides";

type Box = { left: number; right: number; top: number; bottom: number };

const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const overlapArea = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
/** 名字压到圆点三成以上才算压住，擦个边不要紧 */
const covers = (name: Box, dot: Box) => overlapArea(name, dot) > 0.3 * (dot.right - dot.left) * (dot.bottom - dot.top);
/** 圆点中心到名字方框的距离 */
const gap = (dot: Box, box: Box) => {
  const x = (dot.left + dot.right) / 2;
  const y = (dot.top + dot.bottom) / 2;
  return Math.hypot(Math.max(box.left - x, 0, x - box.right), Math.max(box.top - y, 0, y - box.bottom));
};
const padded = (box: Box, by: number): Box => ({
  left: box.left - by,
  right: box.right + by,
  top: box.top - by,
  bottom: box.bottom + by,
});

/**
 * 文字实际占的地方：按文字本身量（中文名那一行是块元素，宽度会被下面更长的英文名撑开）；
 * 上下各留了行距，按字形算要收进去一点，不然挨着的两行也算压住
 */
function glyphBox(element: HTMLElement | null, inset: number): Box | null {
  if (!element) return null;
  // 只量文字节点：名字里每一行也是块元素，量元素还是会被撑开
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let box: Box | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    box = box
      ? {
          left: Math.min(box.left, rect.left),
          right: Math.max(box.right, rect.right),
          top: Math.min(box.top, rect.top),
          bottom: Math.max(box.bottom, rect.bottom),
        }
      : { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }
  if (!box) return null;
  const dy = (box.bottom - box.top) * inset;
  return { left: box.left + 2, right: box.right - 2, top: box.top + dy, bottom: box.bottom - dy };
}

/**
 * 地图上的公园名按顺序摆（排在前面的、热门的公园先摆），尽量留在 LABEL_SIDE 定的那一侧：手机上压住的是后面冷门得多
 * （热度不到一半）的公园，就让那个公园不显示；出了屏幕、压到前面摆好的名字或者别的公园，才换到右、左、下、上里
 * 完全不碰东西的一侧，还不行就不显示名字、只留圆点。
 * 英文名最次要：压到圆点、名字或者出了屏幕就不显示，后面的中文名要用这块地方时也先让出来。
 * 手机和平板上犹他、科罗拉多一带挤在一起时用得上，大屏上按 LABEL_SIDE 摆好的基本不受影响。窗口大小变了、字体加载完都重新算
 */
export function MapDeclutter({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const arrange = () => {
      // 名字可以伸进页边距，只要别出屏幕
      const screenWidth = document.documentElement.clientWidth;
      // 手机上实在挤，冷门的公园可以整个不显示；平板、电脑上每座公园的圆点都留着，最多不显示名字
      const crowded = screenWidth < 768;
      const inFrame = (box: Box) => box.left >= 2 && box.right <= screenWidth - 2;
      const markers = [...root.querySelectorAll<HTMLElement>("[data-marker]")].flatMap((marker) => {
        const dot = marker.querySelector<HTMLElement>("[data-dot]");
        const label = marker.querySelector<HTMLElement>("[data-label]");
        const zh = marker.querySelector<HTMLElement>("[data-zh]");
        const en = marker.querySelector<HTMLElement>("[data-en]");
        if (!dot || !label || !zh) return [];
        const side = (label.dataset.side ?? "right") as Side;
        return [{ marker, dot, label, zh, en, side, weight: Number(marker.dataset.weight ?? 0) }];
      });
      for (const { marker, label, en, side } of markers) {
        marker.style.visibility = "";
        label.style.visibility = "";
        if (en) en.style.visibility = "";
        label.className = LABEL_CLASS[side];
      }
      const dots = markers.map(({ dot }) => dot.getBoundingClientRect());
      const hidden = new Set<number>();
      const names: Box[] = [];
      let subtitles: { box: Box; element: HTMLElement }[] = [];
      markers.forEach(({ label, zh, en, side, weight }, i) => {
        if (hidden.has(i)) return;
        const coveredDots = (box: Box) =>
          dots.flatMap((dot, j) => (j !== i && !hidden.has(j) && covers(box, dot) ? [j] : []));
        const boxAt = (next: Side) => {
          label.className = LABEL_CLASS[next];
          return glyphBox(zh, 0.2);
        };
        // 1. 首选的一侧放得下（在屏幕里、不压前面的名字和别的圆点）就不动；
        // 2. 手机上只压到后面冷门得多（热度不到一半）的公园的圆点，也不动，让那个公园不显示；
        // 3. 都不行才换到完全不碰别的圆点、和别的名字隔开几像素的一侧；4. 还不行就不显示名字，只留圆点
        // 换过去的名字还要离自己的圆点最近，不然看着像在标旁边的公园（比如峡谷地换到左边，正好落在圆顶礁的圆点上方）
        const clean = (box: Box) =>
          inFrame(box) &&
          !names.some((name) => overlaps(padded(box, 3), name)) &&
          !dots.some((dot, j) => j !== i && !hidden.has(j) && (overlaps(box, dot) || gap(dot, box) < gap(dots[i], box)));
        const preferred = boxAt(side);
        let choice: { side: Side; box: Box } | null = null;
        let pushed: number[] = [];
        if (preferred && inFrame(preferred) && !names.some((name) => overlaps(preferred, name))) {
          const covered = coveredDots(preferred);
          if (covered.every((j) => crowded && j > i && markers[j].weight < weight / 2)) {
            choice = { side, box: preferred };
            pushed = covered;
          }
        }
        if (!choice) {
          for (const next of SIDES.filter((other) => other !== side)) {
            const box = boxAt(next);
            if (box && clean(box)) {
              choice = { side: next, box };
              break;
            }
          }
        }
        label.className = LABEL_CLASS[choice?.side ?? side];
        if (!choice) {
          label.style.visibility = "hidden";
          return;
        }
        for (const j of pushed) {
          hidden.add(j);
          markers[j].marker.style.visibility = "hidden";
        }
        const nameBox = choice.box;
        for (const subtitle of subtitles) if (overlaps(subtitle.box, nameBox)) subtitle.element.style.visibility = "hidden";
        subtitles = subtitles.filter((subtitle) => !overlaps(subtitle.box, nameBox));
        names.push(nameBox);
        const enBox = glyphBox(en, 0.15);
        if (!en || !enBox) return;
        const blocked =
          !inFrame(enBox) ||
          names.some((name) => name !== nameBox && overlaps(enBox, name)) ||
          subtitles.some((subtitle) => overlaps(enBox, subtitle.box)) ||
          coveredDots(enBox).length > 0;
        if (blocked) en.style.visibility = "hidden";
        else subtitles.push({ box: enBox, element: en });
      });
    };
    arrange();
    const observer = new ResizeObserver(arrange);
    observer.observe(root);
    document.fonts?.ready.then(arrange);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
