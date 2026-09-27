import { getGasPrices } from "@/lib/prices/gas";

/** 各州油价（AAA）：GET /api/prices/gas；自用阶段 12 小时读一次，否则是快照 */
export async function GET() {
  return Response.json(await getGasPrices());
}
