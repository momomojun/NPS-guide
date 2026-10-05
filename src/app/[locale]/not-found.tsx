import Link from "next/link";

// not-found 拿不到 locale 参数，简繁各写一行；回首页由 proxy 按浏览器语言跳转
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1600px] flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow text-mute">Trail Ends · 此路不通</p>
      <p className="mt-8 font-serif text-[clamp(6rem,18vw,13rem)] leading-[0.85] text-clay-700" aria-hidden>
        404
      </p>
      <h1 className="mt-10 font-serif text-3xl sm:text-4xl">步道到这里就断了</h1>
      <p className="mt-3 font-serif text-xl text-mute">步道到這裡就斷了</p>
      <p className="mt-6 max-w-sm text-sm leading-7 text-ink-soft">这个页面不存在，或者已经搬走了。回到首页，从公园目录重新出发。</p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-3 bg-ink px-7 py-3.5 text-xs tracking-[0.16em] text-paper transition-colors hover:bg-clay-700"
      >
        回到首页 · 回到首頁
      </Link>
    </div>
  );
}
