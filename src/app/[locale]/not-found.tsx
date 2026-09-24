import Link from "next/link";

// not-found 拿不到 locale 参数，简繁各写一行；回首页由 proxy 按浏览器语言跳转
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1600px] flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow text-mute">404</p>
      <h1 className="mt-6 font-serif text-4xl">找不到这个页面</h1>
      <p className="mt-2 font-serif text-xl text-mute">找不到這個頁面</p>
      <Link href="/" className="link-line mt-10 text-xs tracking-[0.14em]">
        NPS Guide
      </Link>
    </div>
  );
}
