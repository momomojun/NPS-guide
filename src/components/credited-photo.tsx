import Image from "next/image";
import type { Photo } from "@/data/attractions/types";
import { fill } from "@/i18n/format";

// Wikimedia 照片按授权要求署名：作者 + 授权协议，链接到原图页面
export function CreditedPhoto({
  photo,
  alt,
  creditTemplate,
  sizes,
  className = "",
  imageClassName = "",
  linkCredit = true,
}: {
  photo: Photo;
  alt: string;
  creditTemplate: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  /** 外层已经是链接时不能再嵌套链接，改成纯文字 */
  linkCredit?: boolean;
}) {
  const credit = fill(creditTemplate, { author: photo.author, license: photo.license });
  const creditClass =
    "absolute right-0 bottom-0 max-w-[90%] truncate bg-black/45 px-2 py-0.5 text-[10px] text-white/85";

  return (
    <div className={`relative overflow-hidden bg-paper-deep ${className}`}>
      <Image src={photo.url} alt={alt} fill sizes={sizes} className={`object-cover ${imageClassName}`} />
      {linkCredit ? (
        <a href={photo.page} target="_blank" rel="noreferrer" className={`${creditClass} hover:bg-black/70`}>
          {credit}
        </a>
      ) : (
        <span className={creditClass}>{credit}</span>
      )}
    </div>
  );
}
