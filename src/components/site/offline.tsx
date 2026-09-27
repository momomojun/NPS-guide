"use client";

import { useEffect, useSyncExternalStore } from "react";

/** 构建版才注册 service worker：开发模式下缓存会和热更新打架 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);
  return null;
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

/** 断网时底部出现一条提示 */
export function OfflineBanner({ label }: { label: string }) {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 bg-ink px-5 py-2.5 text-center text-xs tracking-[0.08em] text-paper print:hidden"
    >
      {label}
    </div>
  );
}
