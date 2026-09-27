import { parks } from "@/data/parks";
import { services } from "@/data/services.generated";

// 行程页的补给点（超市、加油站、快充、亚洲超市和餐厅）按公园取，页面本身不带；构建时每个公园生成一个静态 JSON
export const dynamic = "force-static";

export function generateStaticParams() {
  return parks.map((park) => ({ park: park.code }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ park: string }> }) {
  const { park } = await params;
  return Response.json(services[park] ?? []);
}
