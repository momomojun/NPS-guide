// 认亚洲店的规则：OSM（build-services.mjs）和 Overture（build-asian-groceries.py 通过 node 读这里）共用
/** 中日韩文字：店名里有就基本是亚洲店 */
export const CJK = /[぀-ヿ㐀-鿿가-힯]/;
/** 去掉重音再比，Phở → pho */
export const plain = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "");
/** 美国西部很多地名带 China / Chinese / Indian，不是亚洲店 */
export const PLACE_NAME =
  /chinese camp|china (peak|ranch|flat|lake|camp|creek|gulch|springs?|grade|hat|bar|mountain|basin)|indian (springs|valley|village|creek|wells|head|hill|lake|river|trading|country)/i;

/** 亚洲超市：OSM 里一般不标卖什么，只能按店名认 */
export const ASIAN_SHOP_NAME = new RegExp(
  `\\b(${[
    "asian?",
    "oriental",
    "chinese",
    "china",
    "korean?",
    "japan(ese)?",
    "vietnam(ese)?",
    "thai",
    "filipino",
    "pinoy",
    "philippines?",
    "taiwan(ese)?",
    "hmong",
    "laos?",
    "khmer",
    "cambodian",
    "indonesian?",
    "malaysian?",
    "india",
    "indian (grocery|grocers|store|bazaa?r|market|spices?|foods?|supermarket)",
    "desi",
    "apna",
    "patel",
    "h ?mart",
    "99 ranch",
    "ranch 99",
    "mitsuwa",
    "uwajimaya",
    "lotte",
    "nijiya",
    "tokyo central",
    "marukai",
    "seafood city",
    "seoul",
    "tokyo",
    "saigon",
    "manila",
    "hong kong",
    "bangkok",
    "mekong",
    "lee lee",
    "great wall",
    "hankook",
    "arirang",
  ].join("|")})\\b`,
  "i",
);
