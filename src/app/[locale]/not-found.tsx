import Link from "next/link";

// not-found 拿不到 locale 参数，简繁各写一行；回首页由 proxy 按浏览器语言跳转
export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold">找不到这个页面</h1>
      <p className="mt-1 text-stone-500">找不到這個頁面</p>
      <Link href="/" className="mt-6 inline-block text-emerald-700 hover:underline dark:text-emerald-400">
        ← park-pilot
      </Link>
    </div>
  );
}
