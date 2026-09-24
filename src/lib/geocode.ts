// 搜酒店、地址用 Photon（基于 OpenStreetMap，免费、支持跨域），按公园位置优先返回附近的结果
export interface PlaceResult {
  id: string;
  name: string;
  /** 地址 / 城市 / 州 */
  detail: string;
  lat: number;
  lon: number;
}

const TRANSIT_KEYS = new Set(["highway", "public_transport", "railway"]);

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type: string;
    osm_id: number;
    osm_key?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    countrycode?: string;
  };
}

export async function searchPlaces(
  query: string,
  near: { lat: number; lon: number },
  signal?: AbortSignal,
): Promise<PlaceResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.search = new URLSearchParams({
    q: query,
    limit: "10",
    lat: String(near.lat),
    lon: String(near.lon),
    lang: "en",
  }).toString();
  const res = await fetch(url, { signal });
  const data = (await res.json()) as { features: PhotonFeature[] };

  return data.features
    // 只要美国境内的；公交站、站台这类结果对选住处没用
    .filter((feature) => feature.properties.countrycode === "US")
    .filter((feature) => !TRANSIT_KEYS.has(feature.properties.osm_key ?? ""))
    .map((feature) => {
      const p = feature.properties;
      const street = [p.housenumber, p.street].filter(Boolean).join(" ");
      return {
        id: `${p.osm_type}${p.osm_id}`,
        name: p.name ?? street,
        detail: [p.name ? street : "", p.city, p.state].filter(Boolean).join(", "),
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
      };
    })
    .filter((place) => place.name)
    .slice(0, 6);
}
