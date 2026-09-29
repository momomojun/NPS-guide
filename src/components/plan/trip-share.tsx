"use client";

import qrcode from "qrcode-generator";
import { useRef, useState, useSyncExternalStore } from "react";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { fill } from "@/i18n/format";
import { codeFromHash, encodeTrip, readTripFile, shareUrl, tripFileText, type SharedTrip } from "@/lib/trip-share";
import type { TripPrefs } from "@/lib/trip-prefs";
import type { Trip } from "@/lib/trip-store";
import type { PlannerText } from "./types";

const subscribeHash = (listener: () => void) => {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
};

/** 网址里带着的分享码（#trip=…）；服务端渲染时是 null */
export function useShareCode(): string | null {
  return useSyncExternalStore(subscribeHash, () => codeFromHash(window.location.hash), () => null);
}

/** 导入完（或者不导入）就把 # 后面的分享码去掉，免得刷新又问一次 */
export function clearShareCode() {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/** 二维码的路径：每个深色格子一个 1×1 的方块；内容太长放不下时返回 null */
function qrPath(value: string): { size: number; d: string } | null {
  try {
    const qr = qrcode(0, "L");
    qr.addData(value);
    qr.make();
    const size = qr.getModuleCount();
    let d = "";
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
    }
    return { size, d };
  } catch {
    return null;
  }
}

/** 分享 / 发到手机：二维码、复制链接、手机上的系统分享，导出和导入文件 */
export function TripShare({
  trip,
  prefs,
  locale,
  title,
  shareable,
  onImportFile,
  text,
}: {
  trip: Trip;
  prefs: TripPrefs;
  locale: string;
  /** 行程名字，分享和导出文件用 */
  title: string;
  /** 行程里还没有景点时只能导入 */
  shareable: boolean;
  /** 选好的文件读出来了，交给上层确认要不要导入 */
  onImportFile: (shared: SharedTrip) => void;
  text: PlannerText;
}) {
  const t = text.plan.share;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // 只在展开以后才生成（要用到浏览器里的网址）
  const url = open && shareable ? shareUrl(window.location.origin, locale, encodeTrip({ trip, prefs })) : "";
  const qr = open ? qrPath(url) : null;
  const canShare = Boolean(url) && typeof navigator.share === "function";

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportFile = () => {
    const blob = new Blob([tripFileText({ trip, prefs }, new Date().toISOString())], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `NPS Guide · ${title}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    // 马上释放的话，有的浏览器还没开始下载就取消了
    setTimeout(() => URL.revokeObjectURL(href), 10000);
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const shared = readTripFile(await file.text());
    setFileError(!shared);
    if (shared) onImportFile(shared);
    if (fileInput.current) fileInput.current.value = "";
  };

  const fileControl = (
    <input
      ref={fileInput}
      type="file"
      accept="application/json,.json"
      className="hidden"
      onChange={(event) => importFile(event.target.files?.[0])}
    />
  );

  if (!shareable) {
    return (
      <div className="flex basis-full flex-wrap items-center gap-x-4 gap-y-2 print:hidden">
        <button type="button" className={buttonSecondary} onClick={() => fileInput.current?.click()}>
          {t.import}
        </button>
        {fileControl}
        <p className={`text-xs ${fileError ? "text-clay-700" : "text-mute"}`}>{fileError ? t.badFile : t.importOnly}</p>
      </div>
    );
  }

  return (
    <div className="basis-full print:hidden">
      <button type="button" className={buttonSecondary} onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? t.close : t.button}
      </button>
      {open && (
        <div className="mt-5 grid gap-6 border-t border-line pt-5 sm:grid-cols-[auto_1fr]">
          {qr ? (
            <svg
              viewBox={`-4 -4 ${qr.size + 8} ${qr.size + 8}`}
              className="size-48 bg-white"
              shapeRendering="crispEdges"
              role="img"
              aria-label={t.qrAlt}
            >
              <path d={qr.d} fill="#1c1b18" />
            </svg>
          ) : (
            <p className="max-w-48 text-xs leading-6 text-clay-700">{t.qrTooLong}</p>
          )}
          <div className="min-w-0 space-y-4">
            <div>
              <p className="font-serif text-lg">{t.title}</p>
              <p className="mt-2 text-xs leading-6 text-ink-soft">{t.intro}</p>
            </div>
            <input
              readOnly
              value={url}
              onFocus={(event) => event.currentTarget.select()}
              className="block w-full truncate border-b border-ink/30 bg-transparent py-1.5 text-xs text-ink-soft focus:border-ink focus:outline-none"
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonPrimary} onClick={copy}>
                {copied ? t.copied : t.copy}
              </button>
              {canShare && (
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => navigator.share({ title: `NPS Guide · ${title}`, url }).catch(() => {})}
                >
                  {t.nativeShare}
                </button>
              )}
              <button type="button" className={buttonSecondary} onClick={exportFile}>
                {t.export}
              </button>
              <button type="button" className={buttonSecondary} onClick={() => fileInput.current?.click()}>
                {t.import}
              </button>
              {fileControl}
            </div>
            <p className={`text-xs leading-6 ${fileError ? "text-clay-700" : "text-mute"}`}>{fileError ? t.badFile : t.fileHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** 收到分享的行程（链接或文件）：说明是什么行程，确认后替换当前行程 */
export function TripImportBanner({
  incoming,
  invalid,
  summary,
  currentCount,
  onImport,
  onDismiss,
  text,
}: {
  incoming: SharedTrip | null;
  /** 链接里有分享码但读不出来 */
  invalid: boolean;
  summary: { title: string; dates: string | null; stops: number; done: number } | null;
  /** 这台设备上现在行程里的景点数 */
  currentCount: number;
  onImport: (withPrefs: boolean) => void;
  onDismiss: () => void;
  text: PlannerText;
}) {
  const t = text.plan.share;
  const [withPrefs, setWithPrefs] = useState(true);
  if (!incoming && !invalid) return null;

  return (
    <section className="border border-clay-600 bg-paper-deep p-6 print:hidden" aria-live="polite">
      <p className="eyebrow text-clay-700">{t.eyebrow}</p>
      {invalid || !incoming || !summary ? (
        <p className="mt-3 text-sm text-ink-soft">{t.invalid}</p>
      ) : (
        <>
          <h2 className="mt-3 font-serif text-2xl">{summary.title}</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {[summary.dates, fill(t.stops, { n: summary.stops }), summary.done > 0 ? fill(t.done, { n: summary.done }) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {incoming.prefs && (
            <label className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={withPrefs} onChange={(event) => setWithPrefs(event.target.checked)} />
              {t.withPrefs}
            </label>
          )}
          {currentCount > 0 && <p className="mt-3 text-xs text-clay-700">{fill(t.replaceNote, { n: currentCount })}</p>}
        </>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        {!invalid && incoming && (
          <button type="button" className={buttonPrimary} onClick={() => onImport(withPrefs && Boolean(incoming.prefs))}>
            {t.importButton}
          </button>
        )}
        <button type="button" className={buttonSecondary} onClick={onDismiss}>
          {invalid ? t.close : t.dismiss}
        </button>
      </div>
    </section>
  );
}
