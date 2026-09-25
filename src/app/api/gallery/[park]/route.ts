import { gallery } from "@/data/attractions/gallery.generated";
import { parks } from "@/data/parks";

// 行程页点开景点详情时才按公园取图集，页面本身不带照片；构建时每个公园生成一个静态 JSON
export const dynamic = "force-static";

export function generateStaticParams() {
  return parks.map((park) => ({ park: park.code }));
}

export async function GET(_request: Request, { params }: RouteContext<"/api/gallery/[park]">) {
  const { park } = await params;
  const photos = Object.fromEntries(Object.entries(gallery).filter(([id]) => id.startsWith(`${park}-`)));
  return Response.json(photos);
}
