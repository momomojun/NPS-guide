// 反复用到的按钮样式：直角、细线、字距略宽，不用圆角和彩色块
const base =
  "inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs tracking-[0.06em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40";

export const buttonPrimary = `${base} bg-ink text-paper hover:bg-clay-700`;

export const buttonSecondary = `${base} border border-ink/20 text-ink hover:border-ink`;

export const buttonAdded = `${base} border border-pine-600/60 text-pine-700 hover:border-pine-700`;

/** 首屏、页尾这类大号按钮 */
export const buttonLarge =
  "inline-flex items-center justify-center gap-3 px-7 py-3.5 text-[13px] tracking-[0.14em] transition-colors duration-300";
