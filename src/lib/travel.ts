import {
  interParkTravel,
  parkTravel,
  type TravelTable,
} from "../data/attractions/travel.generated";

// 车程表里没有的组合（比如新加了景点还没重新生成表），先按半小时算
const FALLBACK_MIN = 30;

const indexCache = new WeakMap<TravelTable, Map<string, number>>();

function lookup(table: TravelTable | undefined, from: string, to: string): number | null {
  if (!table) return null;
  let index = indexCache.get(table);
  if (!index) {
    index = new Map(table.nodes.map((node, i) => [node, i]));
    indexCache.set(table, index);
  }
  const i = index.get(from);
  const j = index.get(to);
  if (i === undefined || j === undefined) return null;
  return table.minutes[i][j];
}

/** 公园定位点的节点 id，例如 "zion:gateway" */
export function gatewayNode(park: string): string {
  return `${park}:gateway`;
}

// 景点 id 统一以公园代码开头，例如 "zion-narrows"
const parkOf = (node: string) => node.split(/[-:]/)[0];
const tableNode = (node: string) => (node.endsWith(":gateway") ? "gateway" : node);

/** 两个景点（或公园定位点）之间的开车分钟数；跨公园时经过两边的定位点 */
export function travelMinutes(from: string, to: string): number {
  if (from === to) return 0;
  const fromPark = parkOf(from);
  const toPark = parkOf(to);
  if (fromPark === toPark) {
    return lookup(parkTravel[fromPark], tableNode(from), tableNode(to)) ?? FALLBACK_MIN;
  }
  const toGateway = lookup(parkTravel[fromPark], tableNode(from), "gateway") ?? 0;
  const between = lookup(interParkTravel, fromPark, toPark) ?? FALLBACK_MIN;
  const fromGateway = lookup(parkTravel[toPark], "gateway", tableNode(to)) ?? 0;
  return toGateway + between + fromGateway;
}
