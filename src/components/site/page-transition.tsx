"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * 换页时整页淡入淡出：React 只在有 ViewTransition 要动的时候才启动浏览器的换页过渡，
 * 这里放一个看不见的小点，地址一变它就“换一个”，浏览器就把整页（root）交叉淡化一次。
 * 页内的加载（Suspense）、筛选不会触发；同一页里改 #锚点、查询参数也不会。
 */
export function PageTransition() {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-marker" exit="page-marker" default="none">
      <span aria-hidden className="pointer-events-none fixed top-0 left-0 size-px opacity-0" />
    </ViewTransition>
  );
}
