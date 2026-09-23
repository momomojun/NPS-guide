import "server-only";

// NPS 和 NLR（原 NREL）都走 api.data.gov，一个 key 通用。
// 没配置时退回 DEMO_KEY：每个 IP 每小时 30 次、每天 50 次。
export function dataGovHeaders(): HeadersInit {
  return { "X-Api-Key": process.env.DATA_GOV_API_KEY || "DEMO_KEY" };
}

export function isUsingDemoKey(): boolean {
  return !process.env.DATA_GOV_API_KEY;
}
