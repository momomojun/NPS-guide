"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { CommonsImage } from "@/components/commons-image";
import { IconChevronLeft, IconChevronRight, IconClose } from "@/components/icons";
import type { Photo } from "@/data/attractions/types";
import { fill } from "@/i18n/format";

export interface LightboxText {
  close: string;
  prevPhoto: string;
  nextPhoto: string;
  photoN: string;
  photoCredit: string;
}

/** 全屏看图：左右键 / 滑动切换，Esc 关闭，打开时页面不滚动 */
export function PhotoLightbox({
  photos,
  index,
  onIndex,
  onClose,
  title,
  text,
}: {
  photos: Photo[];
  index: number;
  onIndex: Dispatch<SetStateAction<number>>;
  onClose: () => void;
  title: string;
  text: LightboxText;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;
  const photo = photos[index];
  const go = (step: number) => onIndex((current) => (current + step + count) % count);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      root.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") onIndex((current) => (current - 1 + count) % count);
      else if (event.key === "ArrowRight") onIndex((current) => (current + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onClose, onIndex]);

  const arrow =
    "absolute inset-y-0 z-10 flex w-14 items-center justify-center text-3xl text-paper/60 transition-colors hover:text-paper sm:w-24";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex animate-[fade_0.4s_var(--ease-expo)] flex-col bg-[#15140f] text-paper"
    >
      <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <p className="min-w-0 truncate font-serif text-xl">{title}</p>
        <div className="flex shrink-0 items-center gap-6">
          <span className="eyebrow text-paper/55 tabular-nums">
            {index + 1} / {count}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={text.close}
            className="-mr-1 p-1 text-2xl text-paper/70 transition-colors hover:text-paper"
          >
            <IconClose />
          </button>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onTouchStart={(event) => {
          touchX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchX.current === null) return;
          const dx = event.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="absolute inset-0 sm:inset-x-24">
          <CommonsImage
            key={photo.url}
            src={photo.large ?? photo.url}
            alt={title}
            fill
            sizes="100vw"
            priority
            className="animate-[fade_0.6s_var(--ease-expo)] object-contain"
          />
        </div>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={text.prevPhoto} className={`${arrow} left-0`}>
              <IconChevronLeft />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={text.nextPhoto} className={`${arrow} right-0`}>
              <IconChevronRight />
            </button>
          </>
        )}
      </div>

      <div className="space-y-4 px-5 pt-4 pb-6 text-center sm:px-8">
        <a
          href={photo.page}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-paper/55 transition-colors hover:text-paper"
        >
          {fill(text.photoCredit, { author: photo.author, license: photo.license })}
        </a>
        {count > 1 && (
          <div className="flex justify-center gap-1.5">
            {photos.map((item, i) => (
              <button
                key={item.url}
                type="button"
                onClick={() => onIndex(i)}
                aria-label={fill(text.photoN, { i: i + 1 })}
                aria-current={i === index}
                className={`relative h-10 w-14 overflow-hidden transition-opacity duration-300 sm:h-12 sm:w-[72px] ${
                  i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-paper/80" : "opacity-40 hover:opacity-80"
                }`}
              >
                <CommonsImage src={item.url} alt="" fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
