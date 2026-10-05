import type { ReactNode } from "react";
import { CommonsImage } from "@/components/commons-image";
import { Reveal } from "@/components/site/reveal";

export interface HeaderPhoto {
  /** Commons 缩略图地址（1280 宽） */
  src: string;
  /** Commons 文件页，署名链接到这里 */
  href: string;
  /** “照片：作者 · 授权” */
  credit: string;
  /** 照片拍的是哪里 */
  caption: string;
}

/**
 * 内页的页头：左边小标签、大标题和说明，右边一张照片（从下往上揭开）。
 * 手机上不放照片，工具页往下就是内容。
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  photo,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  photo?: HeaderPhoto;
  /** 标题下面的其他内容，比如数字 */
  children?: ReactNode;
}) {
  return (
    <header className="grid gap-10 pb-10 lg:grid-cols-12 lg:gap-16 lg:pb-14">
      <div className="flex flex-col justify-end lg:col-span-7">
        <p className="eyebrow text-mute">{eyebrow}</p>
        {/* 中文标题只在标点处换行，不会剩一个字在下一行 */}
        <h1 className="mt-6 font-serif text-[clamp(2.4rem,4.8vw,4.4rem)] leading-[1.12] text-balance [word-break:keep-all]">{title}</h1>
        {intro && <div className="mt-6 max-w-2xl text-[15px] leading-8 text-ink-soft">{intro}</div>}
        {children}
      </div>
      {photo && (
        <figure className="hidden sm:block lg:col-span-5">
          <Reveal image className="relative aspect-[16/9] overflow-hidden bg-paper-deep lg:aspect-[4/3]">
            <CommonsImage
              src={photo.src}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[11px] text-mute">
            <span className="tracking-[0.08em]">{photo.caption}</span>
            <a href={photo.href} target="_blank" rel="noreferrer" className="hover:text-ink">
              {photo.credit}
            </a>
          </figcaption>
        </figure>
      )}
    </header>
  );
}
