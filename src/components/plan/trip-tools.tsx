"use client";

import { useState } from "react";
import { IconDownload, IconPrinter } from "@/components/icons";
import { buttonSecondary } from "@/components/ui";
import type { PlannerText } from "./types";

type SaveState = "idle" | "saving" | "saved" | "failed" | "dev";

/** 打印（浏览器里选“另存为 PDF”就是 PDF）和离线保存（让 service worker 把这个页面和行程数据存下来） */
export function TripTools({ dataUrls, text }: { dataUrls: string[]; text: PlannerText }) {
  const t = text.plan.tools;
  const [state, setState] = useState<SaveState>("idle");

  const saveOffline = async () => {
    const worker = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (!worker?.active) {
      setState("dev");
      return;
    }
    setState("saving");
    // 当前页面、它加载过的脚本 / 样式 / 字体，加上行程用到的接口数据
    const assets = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => {
        const url = new URL(name);
        return url.origin === location.origin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/maplibre/"));
      });
    const urls = [...new Set([location.pathname + location.search, ...assets, ...dataUrls])];
    const channel = new MessageChannel();
    const done = new Promise<{ saved: number; failed: number }>((resolve) => {
      channel.port1.onmessage = (event) => resolve(event.data as { saved: number; failed: number });
    });
    worker.active.postMessage({ type: "precache", urls }, [channel.port2]);
    const result = await done;
    // 个别接口（比如公告额度用完）没存上不影响离线看行程
    setState(result.saved > 0 ? "saved" : "failed");
  };

  const message =
    state === "saved" ? t.offlineSaved : state === "failed" ? t.offlineFailed : state === "dev" ? t.offlineDev : null;

  return (
    <div className="flex basis-full flex-wrap items-center gap-x-4 gap-y-2 print:hidden">
      <button type="button" className={buttonSecondary} onClick={() => window.print()} title={t.printHint}>
        <IconPrinter className="text-sm" />
        {t.print}
      </button>
      <button type="button" className={buttonSecondary} onClick={saveOffline} disabled={state === "saving"}>
        <IconDownload className="text-sm" />
        {state === "saving" ? t.offlineSaving : t.offline}
      </button>
      <p className="text-xs text-mute">{message ?? t.offlineNote}</p>
    </div>
  );
}
