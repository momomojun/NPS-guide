/** 各公园常用机场（parks.ts 里的 airports）的位置，自动生成攻略时当出发地 / 回程地 */
export interface Airport {
  code: string;
  nameZh: string;
  city: string;
  lat: number;
  lon: number;
}

export const airports: Record<string, Airport> = {
  SFO: { code: "SFO", nameZh: "旧金山国际机场", city: "旧金山", lat: 37.6213, lon: -122.379 },
  OAK: { code: "OAK", nameZh: "奥克兰国际机场", city: "奥克兰", lat: 37.7126, lon: -122.2197 },
  SJC: { code: "SJC", nameZh: "圣何塞国际机场", city: "圣何塞", lat: 37.3639, lon: -121.9289 },
  FAT: { code: "FAT", nameZh: "弗雷斯诺机场", city: "弗雷斯诺", lat: 36.7762, lon: -119.7181 },
  LAX: { code: "LAX", nameZh: "洛杉矶国际机场", city: "洛杉矶", lat: 33.9416, lon: -118.4085 },
  LAS: { code: "LAS", nameZh: "拉斯维加斯机场", city: "拉斯维加斯", lat: 36.084, lon: -115.1537 },
  SGU: { code: "SGU", nameZh: "圣乔治机场", city: "圣乔治", lat: 37.0364, lon: -113.5103 },
  SLC: { code: "SLC", nameZh: "盐湖城国际机场", city: "盐湖城", lat: 40.7899, lon: -111.9791 },
  PHX: { code: "PHX", nameZh: "凤凰城机场", city: "凤凰城", lat: 33.4352, lon: -112.0101 },
  FLG: { code: "FLG", nameZh: "弗拉格斯塔夫机场", city: "弗拉格斯塔夫", lat: 35.1385, lon: -111.6712 },
  ANC: { code: "ANC", nameZh: "安克雷奇国际机场", city: "安克雷奇", lat: 61.1743, lon: -149.9962 },
  FAI: { code: "FAI", nameZh: "费尔班克斯国际机场", city: "费尔班克斯", lat: 64.8151, lon: -147.8563 },
  BUR: { code: "BUR", nameZh: "好莱坞伯班克机场", city: "伯班克", lat: 34.2036, lon: -118.3596 },
  SBA: { code: "SBA", nameZh: "圣巴巴拉机场", city: "圣巴巴拉", lat: 34.427, lon: -119.8423 },
  ACV: { code: "ACV", nameZh: "洪堡县机场", city: "阿克塔 / 尤里卡", lat: 40.9764, lon: -124.1085 },
  CEC: { code: "CEC", nameZh: "德尔诺特县机场", city: "新月城", lat: 41.7814, lon: -124.2366 },
  MFR: { code: "MFR", nameZh: "梅德福机场", city: "梅德福（俄勒冈）", lat: 42.3729, lon: -122.8738 },
  RDD: { code: "RDD", nameZh: "雷丁机场", city: "雷丁", lat: 40.5113, lon: -122.2921 },
  SMF: { code: "SMF", nameZh: "萨克拉门托国际机场", city: "萨克拉门托", lat: 38.693, lon: -121.5931 },
  RNO: { code: "RNO", nameZh: "里诺-太浩国际机场", city: "里诺", lat: 39.4981, lon: -119.7684 },
  RDM: { code: "RDM", nameZh: "雷德蒙德机场", city: "雷德蒙德（本德）", lat: 44.2536, lon: -121.1497 },
  EUG: { code: "EUG", nameZh: "尤金机场", city: "尤金", lat: 44.1245, lon: -123.2146 },
  PDX: { code: "PDX", nameZh: "波特兰国际机场", city: "波特兰", lat: 45.5872, lon: -122.5973 },
  SEA: { code: "SEA", nameZh: "西雅图-塔科马国际机场", city: "西雅图", lat: 47.4475, lon: -122.3084 },
  PAE: { code: "PAE", nameZh: "佩恩机场", city: "埃弗里特", lat: 47.9084, lon: -122.28 },
  BLI: { code: "BLI", nameZh: "贝灵汉国际机场", city: "贝灵汉", lat: 48.7943, lon: -122.5388 },
  BZN: { code: "BZN", nameZh: "博兹曼黄石国际机场", city: "博兹曼", lat: 45.7821, lon: -111.1567 },
  JAC: { code: "JAC", nameZh: "杰克逊霍尔机场", city: "杰克逊", lat: 43.609, lon: -110.7364 },
  WYS: { code: "WYS", nameZh: "西黄石机场", city: "西黄石", lat: 44.6865, lon: -111.1196 },
  COD: { code: "COD", nameZh: "科迪机场", city: "科迪", lat: 44.5207, lon: -109.0239 },
  IDA: { code: "IDA", nameZh: "爱达荷福尔斯机场", city: "爱达荷福尔斯", lat: 43.5146, lon: -112.0708 },
  BIL: { code: "BIL", nameZh: "比灵斯机场", city: "比灵斯", lat: 45.8077, lon: -108.5429 },
};
