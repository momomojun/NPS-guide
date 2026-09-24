"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * 进入视野时渐显（样式在 globals.css 的 .reveal / .reveal-image）。
 * image：图片从下往上揭开，同时轻微缩放。as="li" 用在列表里。
 */
export function Reveal({
  children,
  as = "div",
  className = "",
  delay = 0,
  image = false,
  style,
}: {
  children: ReactNode;
  as?: "div" | "li";
  className?: string;
  /** 毫秒，用来让同一排的元素依次出现 */
  delay?: number;
  image?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.shown = "";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`${image ? "reveal-image" : "reveal"} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
