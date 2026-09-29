// 地图用到的瓦片服务，都是免费、不需要 key 的；地图组件和“下载离线地图”共用，保证下载的就是地图会请求的那些地址

/** OpenFreeMap 的 Liberty 样式（矢量底图） */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
/** AWS 上的地形高程瓦片（terrarium 编码），画地形阴影和 3D 地形 */
export const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
/** USGS 卫星图，只覆盖美国 */
export const IMAGERY_TILES =
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}";
/** 美国以外（加拿大）的卫星图：EOX 的 Sentinel-2 无云拼图，2016 年版按 CC BY 4.0 授权，分辨率约 10 米 */
export const EOX_IMAGERY_TILES = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg";
export const EOX_ATTRIBUTION =
  "Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016)";

/** 卫星图用哪一种：美国用 USGS，加拿大用 EOX */
export type Imagery = "usgs" | "eox";
