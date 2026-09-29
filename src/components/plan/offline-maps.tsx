"use client";

import { useState, useSyncExternalStore } from "react";
import { IconDownload } from "@/components/icons";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { fill } from "@/i18n/format";
import { planOfflineDownload, type OfflineArea, type OfflinePlan } from "@/lib/offline-maps";
import type { PlannerText } from "./types";

// 下载过的记录存在 localStorage：什么时候下载的、下载时行程里有哪些地方（行程改了提醒重新下载）
const STORAGE_KEY = "nps-guide:offline-maps";

interface Saved {
  at: string;
  key: string;
  saved: number;
}

const listeners = new Set<() => void>();
const readSaved = () => window.localStorage.getItem(STORAGE_KEY);
const subscribeSaved = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
function writeSaved(value: Saved | null) {
  if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

type State =
  | { step: "idle" }
  | { step: "planning" }
  | { step: "ready"; plan: OfflinePlan }
  | { step: "downloading"; done: number; total: number }
  | { step: "done"; saved: number; failed: number }
  | { step: "error" }
  | { step: "dev" };

/** 和 service worker 通信：发过去，收进度，完了返回结果 */
function send(worker: ServiceWorker, message: object, onProgress?: (done: number, total: number) => void) {
  const channel = new MessageChannel();
  return new Promise<{ done: number; failed: number; total: number }>((resolve) => {
    channel.port1.onmessage = (event) => {
      const data = event.data as { type: string; done: number; failed: number; total: number };
      if (data.type === "progress") onProgress?.(data.done, data.total);
      else resolve(data);
    };
    worker.postMessage(message, [channel.port2]);
  });
}

/** 出发前下载离线地图：行程里每天的范围和景点附近的地图、景点照片 */
export function OfflineMaps({ areas, stopIds, tripKey, text }: { areas: OfflineArea[]; stopIds: string[]; tripKey: string; text: PlannerText }) {
  const t = text.plan.offlineMaps;
  const [state, setState] = useState<State>({ step: "idle" });
  const savedRaw = useSyncExternalStore(subscribeSaved, readSaved, () => null);
  const saved: Saved | null = savedRaw ? (JSON.parse(savedRaw) as Saved) : null;

  const activeWorker = async () =>
    "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistration())?.active ?? null : null;

  const prepare = async () => {
    if (!(await activeWorker())) {
      setState({ step: "dev" });
      return;
    }
    setState({ step: "planning" });
    try {
      setState({ step: "ready", plan: await planOfflineDownload(areas, stopIds) });
    } catch {
      setState({ step: "error" });
    }
  };

  const download = async (plan: OfflinePlan) => {
    const worker = await activeWorker();
    if (!worker) return;
    // 请浏览器别在空间紧张时清掉（装到主屏幕的通常会同意）
    await navigator.storage?.persist?.().catch(() => false);
    setState({ step: "downloading", done: 0, total: plan.urls.length });
    const result = await send(worker, { type: "offline-download", urls: plan.urls }, (done, total) =>
      setState({ step: "downloading", done, total }),
    );
    const savedCount = result.done - result.failed;
    writeSaved({ at: new Date().toISOString().slice(0, 10), key: tripKey, saved: savedCount });
    setState({ step: "done", saved: savedCount, failed: result.failed });
  };

  const clear = async () => {
    const worker = await activeWorker();
    if (worker) await send(worker, { type: "offline-clear" });
    writeSaved(null);
    setState({ step: "idle" });
  };

  const status = saved
    ? fill(saved.key === tripKey ? t.savedOn : t.savedStale, { date: saved.at, n: saved.saved })
    : t.note;

  return (
    <div className="basis-full border-t border-line pt-4 print:hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          className={buttonSecondary}
          onClick={prepare}
          disabled={state.step === "planning" || state.step === "downloading"}
        >
          <IconDownload className="text-sm" />
          {state.step === "planning" ? t.planning : t.button}
        </button>
        {saved && state.step !== "downloading" && (
          <button type="button" className="link-line text-xs text-mute" onClick={clear}>
            {t.clear}
          </button>
        )}
        <p className="text-xs text-mute">{status}</p>
      </div>

      {state.step === "ready" && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-ink-soft">
          <p>{fill(t.estimate, { tiles: state.plan.tiles, photos: state.plan.photos, mb: Math.max(state.plan.megabytes, 1) })}</p>
          <button type="button" className={buttonPrimary} onClick={() => download(state.plan)}>
            {t.start}
          </button>
          <button type="button" className="link-line text-xs text-mute" onClick={() => setState({ step: "idle" })}>
            {t.cancel}
          </button>
        </div>
      )}

      {state.step === "downloading" && (
        <div className="mt-4 max-w-md">
          <div className="h-1 bg-ink/10">
            <div className="h-full bg-clay-600 transition-[width]" style={{ width: `${(state.done / Math.max(state.total, 1)) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-mute">{fill(t.progress, { done: state.done, total: state.total })}</p>
        </div>
      )}

      {state.step === "done" && (
        <p className="mt-3 text-xs leading-6 text-ink-soft">
          {fill(t.done, { n: state.saved })}
          {state.failed > 0 && ` ${fill(t.someFailed, { n: state.failed })}`}
        </p>
      )}
      {state.step === "error" && <p className="mt-3 text-xs text-clay-700">{t.error}</p>}
      {state.step === "dev" && <p className="mt-3 text-xs text-clay-700">{text.plan.tools.offlineDev}</p>}
    </div>
  );
}
