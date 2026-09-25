"use client";

import { useState } from "react";
import { CommonsImage } from "@/components/commons-image";
import { CreditedPhoto } from "@/components/credited-photo";
import { IconExpand } from "@/components/icons";
import { PhotoLightbox, type LightboxText } from "@/components/photo-lightbox";
import type { Photo } from "@/data/attractions/types";
import { fill } from "@/i18n/format";

export interface GalleryText extends LightboxText {
  photos: string;
  viewPhotos: string;
}

/** 景点卡片的照片：大图 + 一排缩略图，点大图全屏看 */
export function PhotoGallery({
  photos,
  title,
  alt,
  text,
}: {
  photos: Photo[];
  title: string;
  alt: string;
  text: GalleryText;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const photo = photos[index];

  return (
    <div>
      <CreditedPhoto
        key={photo.url}
        photo={photo}
        alt={alt}
        creditTemplate={text.photoCredit}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="group/photo aspect-[3/2]"
        imageClassName="animate-[fade_0.7s_var(--ease-expo)] transition-transform duration-[1400ms] ease-expo group-hover:scale-[1.04]"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={text.viewPhotos}
          className="absolute inset-0 cursor-zoom-in"
        />
        <span className="pointer-events-none absolute top-3 left-3 hidden items-center gap-2 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.18em] text-white/90 opacity-0 transition-opacity duration-500 group-hover/photo:opacity-100 sm:inline-flex">
          <IconExpand className="text-xs" />
          {photos.length > 1 ? fill(text.photos, { n: photos.length }) : text.viewPhotos}
        </span>
      </CreditedPhoto>

      {photos.length > 1 && (
        <div className="mt-1.5 grid grid-cols-6 gap-1.5">
          {photos.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={fill(text.photoN, { i: i + 1 })}
              aria-current={i === index}
              className={`relative aspect-[3/2] overflow-hidden bg-paper-deep transition-opacity duration-300 ${
                i === index ? "" : "opacity-45 hover:opacity-100"
              }`}
            >
              <CommonsImage src={item.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <PhotoLightbox
          photos={photos}
          index={index}
          onIndex={setIndex}
          onClose={() => setOpen(false)}
          title={title}
          text={text}
        />
      )}
    </div>
  );
}
