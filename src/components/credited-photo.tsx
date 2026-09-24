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
  linkCredit = true,
}: {
  photo: Photo;
  alt: string;
  creditTemplate: string;
  sizes: string;
  className?: string;
  /** 外层已经是链接时不能再嵌套链接，改成纯文字 */
  linkCredit?: boolean;
}) {
  const credit = fill(creditTemplate, { author: photo.author, license: photo.license });
  const creditClass =
    "absolute right-1 bottom-1 max-w-[90%] truncate rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white";

  return (
    <div className={`relative bg-stone-100 dark:bg-stone-800 ${className}`}>
      <Image src={photo.url} alt={alt} fill sizes={sizes} className="object-cover" />
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
