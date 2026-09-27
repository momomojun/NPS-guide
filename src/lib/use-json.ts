import { useEffect, useState, useSyncExternalStore } from "react";

/** GET 一个 JSON 接口；url 为 null 时不请求。还没取到是 undefined，失败是 null */
export function useJson<T>(url: string | null): T | null | undefined {
  const [state, setState] = useState<{ url: string; value: T | null } | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetch(url)
      .then((res) => (res.ok ? (res.json() as Promise<T>) : null))
      .catch(() => null)
      .then((value) => {
        if (!cancelled) setState({ url, value });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return url && state?.url === url ? state.value : undefined;
}

const noSubscribe = () => () => {};

/** 浏览器里的今天（"2026-09-26"，本地时区）；服务端渲染时是 null */
export function useToday(): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    },
    () => null,
  );
}

/** 一次取几个 JSON 接口（比如行程里每个公园一个）；结果按 url 存，还没取到的不在里面，失败是 null */
export function useJsonAll<T>(urls: string[]): Record<string, T | null> {
  const [results, setResults] = useState<Record<string, T | null>>({});
  const key = urls.join("\n");
  useEffect(() => {
    let cancelled = false;
    for (const url of key ? key.split("\n") : []) {
      fetch(url)
        .then((res) => (res.ok ? (res.json() as Promise<T>) : null))
        .catch(() => null)
        .then((value) => {
          if (!cancelled) setResults((current) => (url in current ? current : { ...current, [url]: value }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [key]);
  return results;
}
