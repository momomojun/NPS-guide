import { flightProvider } from "@/lib/prices";
import type { FlightLeg } from "@/lib/prices/types";

const LEG = /^([A-Z]{3})\.([A-Z]{3})\.(\d{4}-\d{2}-\d{2})$/;

/** 机票价格：GET ?legs=BOS.SLC.2026-10-09|SLC.BOS.2026-10-16&adults=2（往返写两段，进出不同机场也是两段） */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const legs: FlightLeg[] = [];
  for (const part of (params.get("legs") ?? "").toUpperCase().split("|").slice(0, 4)) {
    const match = LEG.exec(part);
    if (!match) return Response.json({ error: "bad legs" }, { status: 400 });
    legs.push({ from: match[1], to: match[2], date: match[3] });
  }
  if (legs.length === 0) return Response.json({ error: "bad legs" }, { status: 400 });
  const adults = Math.min(Math.max(Math.round(Number(params.get("adults"))) || 1, 1), 9);

  const provider = flightProvider();
  if (!provider) return Response.json({ configured: false, result: null });
  try {
    return Response.json({ configured: true, result: await provider.search({ legs, adults }) });
  } catch {
    return Response.json({ configured: true, result: null, error: "provider failed" }, { status: 502 });
  }
}
