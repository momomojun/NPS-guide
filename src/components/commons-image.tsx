"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { useState, type Ref } from "react";

/** Wikimedia 的标准缩略图宽度：这些宽度 CDN 上多半已经有现成的，别的宽度要现生成、还可能被限流 */
const WIDTHS = [120, 250, 330, 500, 960, 1280, 1920];
const THUMB = /\/(\d+)px-([^/]+)$/;

/**
 * 按浏览器需要的宽度换成最接近的标准缩略图（不超过传进来的那张的宽度），
 * 直接从 Commons 的 CDN 加载。不经过 Next 的图片优化：优化服务要先把原图下载到本机再压缩，
 * 首次打开一张大图要好几秒，还常常超时。
 */
function commonsLoader({ src, width }: ImageLoaderProps): string {
  const match = src.match(THUMB);
  // 本身就是原图（原图比缩略图还小）
  if (!match) return src;
  const wanted = WIDTHS.find((w) => w >= width) ?? WIDTHS[WIDTHS.length - 1];
  return src.replace(THUMB, `/${Math.min(wanted, Number(match[1]))}px-${match[2]}`);
}

/** Wikimedia Commons 照片：按尺寸挑标准缩略图；万一这个宽度的缩略图加载失败，退回传进来的那张 */
export function CommonsImage({ alt, onError, src, ref, ...props }: ImageProps & { ref?: Ref<HTMLImageElement> }) {
  const [fallback, setFallback] = useState(false);
  return (
    <Image
      alt={alt}
      {...props}
      ref={ref}
      src={src}
      loader={fallback ? undefined : commonsLoader}
      unoptimized={fallback}
      onError={(event) => {
        if (!fallback) setFallback(true);
        onError?.(event);
      }}
    />
  );
}
