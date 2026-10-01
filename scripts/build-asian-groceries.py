# 亚洲超市补漏：OpenStreetMap 里漏得多（维塞利亚、克拉马斯福尔斯一家都没有），用 Overture Maps 的地点数据（places）补。
# 每个公园查补给点那块范围（scripts/load-data.mjs 的 serviceBox），再给各公园的常用机场找最近的几家（落地后先去采购）。
# 查的是超市、便利店和各国超市：店名按 scripts/asian-names.mjs 的规则认（和 OSM 一样）；
# Overture 自己标成亚洲 / 韩国 / 日本 / 印度超市的，名字不像餐厅、咖啡馆、加油站就收。只要置信度 ≥ 0.6、没标关门的。
# 输出 scripts/data/asian-groceries.json，npm run data:services 时合并进补给点（和 OSM 重复的去掉）。
#
# 要 Python 3 和 duckdb（pip install duckdb）；读的是 Overture 放在 AWS 上的公开数据，不需要账号，全部跑完约 2 分钟。
# Overture 每月出新版（https://docs.overturemaps.org/release/latest/），改 RELEASE 再跑：npm run data:asian
# 数据许可：Overture places 是 CDLA Permissive 2.0，页面上注明了来源。
import json
import math
import re
import subprocess
import sys
import unicodedata
from datetime import date
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "scripts" / "data" / "asian-groceries.json"
RELEASE = "2026-09-23.1"
SOURCE = f"s3://overturemaps-us-west-2/release/{RELEASE}/theme=places/type=place/*"
MIN_CONFIDENCE = 0.6
# 机场附近：40 公里内最近的 5 家
AIRPORT_KM = 40
AIRPORT_COUNT = 5
# Overture 自己标成亚洲（各国）超市的类别：名字不像别的店就收
ASIAN_CATEGORIES = [
    "asian_grocery_store",
    "chinese_grocery_store",
    "japanese_grocery_store",
    "korean_grocery_store",
    "filipino_grocery_store",
    "vietnamese_grocery_store",
    "thai_grocery_store",
    "indian_grocery_store",
]
# 这些类别要店名像亚洲店才收（大部分亚洲超市在 Overture 里只标了 grocery_store）
NAME_CATEGORIES = ["grocery_store", "supermarket", "convenience_store", "international_grocery_store"]
# Overture 把不少别的店也标成了亚洲超市：餐厅（Genji Sushi、Fresno Sandwich）、咖啡馆、烟店、加油站的小店
NOT_GROCERY = re.compile(
    r"\b(sushi|sandwich(es)?|restaurant|cafe|café|coffee|roasters?|bar|grill|kitchen|bistro|noodles?|pho|bbq|ramen"
    r"|teriyaki|buffet|boba|tea|bakery|donuts?|pizza|burgers?|tacos?|express|wok|smoke(house| shop)?|vape|tobacco"
    r"|liquors?|fuel|gas|chevron|shell|arco|valero|mobil|exxon|texaco|sinclair|maverik|conoco|phillips 66)\b",
    re.I,
)
# 人工看过、不是亚洲超市的：Overture id → 原因
EXCLUDE = {
    "e35c15bc-b305-4839-b171-57979ec48bd5": "日本川越的 7-Eleven，坐标错放在比林斯",
    "a83fb1a3-0203-4438-965a-c5e4fcaad907": "食品厂（Eds Wrap & Roll Foods）",
    "3406dd4f-7f76-4ea0-b73d-8e51658746fb": "Market Cocina，不是亚洲店",
    "9ad7bf7a-ff43-4e2d-a94d-9c66fc41b78f": "进口商（Asia Impex）",
    "a16c5c34-c6d2-4fb2-b42d-e42f30355ad9": "看不出是超市（Allinone Enterprises）",
    "3a95d7c0-ebdf-469a-8e0e-eea798785e0b": "餐厅（Pan-Asian Dishes）",
    "0ec9565c-a42c-4fb7-97db-5048e80713fa": "大创，卖日用品",
    "9e692d89-0550-43d4-a2a5-5210fa4493a3": "日本生活杂货店",
    "a1d207ae-e638-407d-a203-985c6ace667c": "和 Rams Bazaar 是同一家",
}
# 店名太长或者带着别的字：Overture id → 显示的名字
RENAME = {
    "46a56249-87b6-4395-bdf6-3103d2e1b420": "Hong Kong Supermarket",
    "c1314a89-8548-4728-b62e-5aa8b86a4005": "Asian Grocery Centre",
}
# 同一家店的两条记录（不同来源）：名字或品牌一样、相距这么近的只留置信度高的
TWIN_KM = 1.0


def rules():
    """补给点范围、机场位置和认亚洲店的规则，从项目的 Node 脚本里读，保证和 OSM 那边一致"""
    script = (
        "Promise.all([import('./scripts/load-data.mjs'), import('./scripts/asian-names.mjs'), import('./src/data/airports.ts')])"
        ".then(([data, names, { airports }]) => console.log(JSON.stringify({"
        " boxes: Object.fromEntries(data.parks.map((p) => [p.code, data.serviceBox(p)])),"
        " airports: Object.fromEntries([...new Set(data.parks.flatMap((p) => p.airports))]"
        ".filter((code) => airports[code]).map((code) => [code, [airports[code].lat, airports[code].lon]])),"
        " shop: names.ASIAN_SHOP_NAME.source, place: names.PLACE_NAME.source, cjk: names.CJK.source })))"
    )
    out = subprocess.run(
        ["node", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    return json.loads(out.stdout)


def plain(text: str) -> str:
    """去掉重音再比，Phở → pho（和 asian-names.mjs 的 plain 一样）"""
    return "".join(c for c in unicodedata.normalize("NFD", text) if not 0x300 <= ord(c) <= 0x36F)


def name_key(name: str) -> str:
    return re.sub(r"[\W_]+", "", name.lower())


def display_name(place_id: str, name: str, brand: str | None) -> str:
    """显示的店名：去掉“| 广告语”、“XX Inc. Dba”；只写了分店名的（Las Vegas (Rampart Blvd)）前面加上品牌"""
    if place_id in RENAME:
        return RENAME[place_id]
    name = name.split(" | ")[0].strip()
    name = re.split(r"\s+dba\s+", name, flags=re.I)[-1].strip()
    # Overture 的品牌字段常常不准（拉斯维加斯的店标着 Winnipeg、Carrollton 分店的品牌），只给“地名 (街名)”这种分店名加
    if brand and re.fullmatch(r"[^()]+ \([^()]+\)", name) and name_key(brand) not in name_key(name):
        name = f"{brand} · {name}"
    return name


def km(a, b) -> float:
    rad = math.pi / 180
    h = math.sin((b[0] - a[0]) * rad / 2) ** 2 + math.cos(a[0] * rad) * math.cos(b[0] * rad) * math.sin((b[1] - a[1]) * rad / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    config = rules()
    shop = re.compile(config["shop"], re.I)
    place = re.compile(config["place"], re.I)
    cjk = re.compile(config["cjk"])
    categories = ", ".join(f"'{c}'" for c in ASIAN_CATEGORIES + NAME_CATEGORIES)

    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';")

    def search(south, west, north, east):
        """一块范围里的亚洲超市"""
        rows = con.execute(
            f"""
            SELECT id, names.primary, brand.names.primary, taxonomy.primary, confidence, bbox.ymin, bbox.xmin
            FROM read_parquet('{SOURCE}', hive_partitioning=1)
            WHERE bbox.xmin BETWEEN {west} AND {east} AND bbox.ymin BETWEEN {south} AND {north}
              AND taxonomy.primary IN ({categories})
              AND confidence >= {MIN_CONFIDENCE}
              AND coalesce(operating_status, 'open') NOT IN ('permanently_closed', 'temporarily_closed')
            """
        ).fetchall()
        kept = []
        for place_id, name, brand, category, confidence, lat, lon in rows:
            if not name or place_id in EXCLUDE:
                continue
            label = plain(f"{name} {brand or ''}")
            if place.search(label) or NOT_GROCERY.search(label):
                continue
            if category not in ASIAN_CATEGORIES and not (cjk.search(name) or shop.search(label)):
                continue
            point = {
                "name": display_name(place_id, name, brand),
                "lat": round(lat, 5),
                "lon": round(lon, 5),
                "category": category,
                "confidence": round(confidence, 2),
                "id": place_id,
            }
            keys = {name_key(name), name_key(brand or name)}
            twin = next(
                (
                    k
                    for k in kept
                    if keys & {name_key(k["raw"]), name_key(k["brand"] or k["raw"])} and km((k["lat"], k["lon"]), (lat, lon)) < TWIN_KM
                ),
                None,
            )
            point = {**point, "raw": name, "brand": brand}
            if twin is None:
                kept.append(point)
            elif point["confidence"] > twin["confidence"]:
                kept[kept.index(twin)] = point
        # raw、brand 只是去重时用
        internal = ("raw", "brand")
        return sorted(({k: v for k, v in p.items() if k not in internal} for p in kept), key=lambda p: (p["name"].lower(), p["lat"]))

    parks = {}
    for code, (south, west, north, east) in config["boxes"].items():
        parks[code] = search(south, west, north, east)
        print(f"{code}: {len(parks[code])}  " + "、".join(p["name"] for p in parks[code]))

    airports = {}
    for code, (lat, lon) in config["airports"].items():
        # 纬度 0.4° 约 44 公里，经度按纬度放宽
        dlon = 0.4 / max(math.cos(lat * math.pi / 180), 0.3)
        found = [dict(p, km=round(km((lat, lon), (p["lat"], p["lon"])), 1)) for p in search(lat - 0.4, lon - dlon, lat + 0.4, lon + dlon)]
        airports[code] = sorted((p for p in found if p["km"] <= AIRPORT_KM), key=lambda p: p["km"])[:AIRPORT_COUNT]
        print(f"{code}: " + "、".join(f"{p['name']} {p['km']}km" for p in airports[code]))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "release": RELEASE,
        "updated": date.today().isoformat(),
        "parks": {k: v for k, v in parks.items() if v},
        "airports": {k: v for k, v in airports.items() if v},
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    total = sum(len(v) for v in parks.values()) + sum(len(v) for v in airports.values())
    print(f"→ {OUTPUT.relative_to(ROOT)}：{total} 条")


if __name__ == "__main__":
    main()
