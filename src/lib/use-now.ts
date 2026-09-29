import { useSyncExternalStore } from "react";

// 现在的时间（毫秒），每 30 秒更新一次；从后台切回来时马上更新。“今天”模式算“还有多久日落”“晚了多少”用。
// 放在模块里的一个值：渲染时只读它，不在渲染里调 Date.now()。

const TICK_MS = 30 * 1000;
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function refresh() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function onVisible() {
  if (document.visibilityState === "visible") refresh();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(refresh, TICK_MS);
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

/** 现在的时间戳；服务端渲染、还没订阅上时是 null */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => now || null,
    () => null,
  );
}
