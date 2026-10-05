import { notFound } from "next/navigation";

// 没有对应页面的地址：交给 [locale]/not-found，带着页头页脚显示 404
export default function MissingPage() {
  notFound();
}
