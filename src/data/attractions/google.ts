import type { GooglePlace } from "./types";

// Google Maps 评分和评论数的快照：在浏览器里逐个打开 Google Maps 读下来的，不会自动更新。
// 同一个景点在 Google 上常分成景点本身、步道口、观景台几个条目，评论分散在各处，
// 这里取评论最多、而且确实指这个景点的条目；name 是 Google 上的条目名，搜它能找到同一个条目。
// 更新：在 Google Maps 搜 name，改 rating 和 reviews，再改 googleSnapshotDate。
// 没有收录：布莱斯夜空观星、塔基特纳观光飞行（不是单一地点）。
export const googleSnapshotDate = "2026-09-23";

export const googlePlaces: Record<string, GooglePlace> = {
  "yose-tunnel-view": { name: "Tunnel View", rating: 4.9, reviews: 3604 },
  "yose-bridalveil-fall": { name: "Bridalveil Falls Trailhead", rating: 4.8, reviews: 1034 },
  "yose-el-capitan": { name: "El Capitan", rating: 4.8, reviews: 717 },
  "yose-yosemite-falls": { name: "Lower Yosemite Falls Trailhead", rating: 4.8, reviews: 4328 },
  "yose-mist-trail": { name: "Vernal Fall", rating: 4.9, reviews: 320 },
  "yose-mirror-lake": { name: "Mirror Lake", rating: 4.3, reviews: 300 },
  "yose-half-dome": { name: "Half Dome", rating: 4.9, reviews: 979 },
  "yose-horsetail-fall": { name: "Horsetail Fall", rating: 4.8, reviews: 107 },
  "yose-glacier-point": { name: "Glacier Point", rating: 4.9, reviews: 8517 },
  "yose-taft-point": { name: "Taft Point", rating: 4.9, reviews: 287 },
  "yose-tuolumne-meadows": { name: "Tuolumne Meadows", rating: 4.8, reviews: 328 },
  "yose-olmsted-point": { name: "Olmsted Point", rating: 4.9, reviews: 1904 },
  "yose-tenaya-lake": { name: "Tenaya Lake", rating: 4.9, reviews: 379 },
  "yose-mariposa-grove": { name: "Yosemite - Mariposa Grove of Giant Sequoias", rating: 4.8, reviews: 1127 },

  "seki-giant-forest-museum": { name: "Giant Forest Museum", rating: 4.7, reviews: 2526 },
  "seki-general-sherman": { name: "General Sherman Tree", rating: 4.8, reviews: 12130 },
  "seki-moro-rock": { name: "Moro Rock Trail", rating: 4.9, reviews: 3495 },
  "seki-tunnel-log": { name: "Sequoia National Park's Tunnel Log", rating: 4.8, reviews: 1740 },
  "seki-crescent-meadow": { name: "Crescent Meadow", rating: 4.9, reviews: 45 },
  "seki-tokopah-falls": { name: "Tokopah Trailhead", rating: 4.9, reviews: 222 },
  "seki-general-grant": { name: "General Grant Tree", rating: 4.9, reviews: 5389 },
  "seki-kings-canyon": { name: "Kings Canyon National Park Scenic Byway", rating: 4.9, reviews: 95 },
  "seki-zumwalt-meadow": { name: "Zumwalt Meadows Trailhead", rating: 4.7, reviews: 152 },

  "deva-visitor-center": { name: "Furnace Creek Visitor Center", rating: 4.7, reviews: 5123 },
  "deva-zabriskie": { name: "Zabriskie Point", rating: 4.8, reviews: 7798 },
  "deva-golden-canyon": { name: "Golden Canyon Trailhead", rating: 4.7, reviews: 922 },
  "deva-badwater": { name: "Badwater Basin", rating: 4.8, reviews: 4554 },
  "deva-devils-golf-course": { name: "Devils Golf Course", rating: 4.7, reviews: 252 },
  "deva-artists-palette": { name: "Artists Palette", rating: 4.7, reviews: 1745 },
  "deva-dantes-view": { name: "Dante's View", rating: 4.9, reviews: 870 },
  "deva-mesquite-dunes": { name: "Mesquite Flat Sand Dunes", rating: 4.8, reviews: 2642 },
  "deva-ubehebe": { name: "Ubehebe Crater", rating: 4.8, reviews: 667 },
  "deva-racetrack": { name: "Racetrack Playa", rating: 4.7, reviews: 100 },

  "zion-visitor-center": { name: "Zion Canyon Visitor Center", rating: 4.7, reviews: 8676 },
  "zion-watchman-trail": { name: "Watchman Trail - Trailhead", rating: 4.9, reviews: 146 },
  "zion-canyon-junction": { name: "Canyon Junction Bridge", rating: 4.8, reviews: 303 },
  "zion-patriarchs": { name: "Court of the Patriarchs Viewpoint", rating: 4.8, reviews: 163 },
  "zion-emerald-pools": { name: "Emerald Pools Trailhead", rating: 4.6, reviews: 412 },
  "zion-angels-landing": { name: "Angels Landing", rating: 4.9, reviews: 1036 },
  "zion-narrows": { name: "The Narrows", rating: 4.9, reviews: 747 },
  "zion-canyon-overlook": { name: "Canyon Overlook Trail", rating: 4.8, reviews: 274 },
  "zion-kolob": { name: "Kolob Canyons", rating: 4.8, reviews: 308 },

  "brca-sunrise-point": { name: "Bryce Canyon National Park Sunrise Point", rating: 4.9, reviews: 2062 },
  "brca-sunset-point": { name: "Bryce Canyon National Park Sunset Point", rating: 4.9, reviews: 4459 },
  "brca-navajo-queens": { name: "Queens Garden Trail", rating: 4.9, reviews: 177 },
  "brca-inspiration-point": { name: "Lower Inspiration Point", rating: 4.9, reviews: 1060 },
  "brca-bryce-point": { name: "Bryce Point", rating: 4.9, reviews: 1576 },
  "brca-natural-bridge": { name: "Natural Bridge", rating: 4.9, reviews: 1358 },
  "brca-rainbow-point": { name: "Rainbow Point", rating: 4.8, reviews: 354 },
  "brca-mossy-cave": { name: "Mossy Cave Trailhead", rating: 4.5, reviews: 950 },

  "grca-mather-point": { name: "Mather Point", rating: 4.9, reviews: 14592 },
  "grca-yavapai": { name: "Yavapai Geology Museum", rating: 4.8, reviews: 2472 },
  "grca-bright-angel": { name: "Bright Angel Trailhead", rating: 4.9, reviews: 5964 },
  "grca-south-kaibab": { name: "Ooh Aah Point", rating: 4.9, reviews: 1102 },
  "grca-hopi-point": { name: "Hopi Point", rating: 4.9, reviews: 3614 },
  "grca-hermits-rest": { name: "Hermit's Rest", rating: 4.7, reviews: 2870 },
  "grca-lipan-point": { name: "Lipan Point", rating: 4.9, reviews: 139 },
  "grca-desert-view": { name: "Desert View Watchtower", rating: 4.8, reviews: 15127 },

  "dena-visitor-center": { name: "Denali Visitor Center", rating: 4.7, reviews: 4673 },
  "dena-horseshoe-lake": { name: "Horseshoe Lake Trailhead", rating: 4.8, reviews: 287 },
  "dena-mount-healy": { name: "Mount Healy Overlook Trailhead", rating: 4.8, reviews: 90 },
  "dena-sled-dogs": { name: "Denali Sled Dog Kennels", rating: 4.7, reviews: 902 },
  "dena-mountain-vista": { name: "Mountain Vista Picnic Area", rating: 4.7, reviews: 50 },
  "dena-savage-river": { name: "Savage River Loop Trailhead", rating: 4.8, reviews: 547 },
  "dena-bus": { name: "Denali Bus Depot", rating: 4.6, reviews: 1441 },
  "dena-viewpoint-south": { name: "Denali Viewpoint South", rating: 4.8, reviews: 1037 },
};

/**
 * 在 Google Maps 里搜这个景点。有快照的搜快照里的条目名，打开就是评分和评论数的出处；
 * 其他按英文名搜
 */
export function googleMapsUrl(attraction: { id: string; nameEn: string }, parkNameEn: string): string {
  const name = googlePlaces[attraction.id]?.name ?? attraction.nameEn;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${parkNameEn} National Park`)}`;
}
