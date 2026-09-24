import type { ItemStatus, Trip, TripItem, TripLodging } from "./trip-store";

// 行程页上的手动调整，都是返回新行程的纯函数

function editDays(trip: Trip, change: (days: TripItem[][]) => void): Trip {
  const days = trip.days.map((day) => [...day]);
  change(days);
  return { ...trip, days };
}

/** 把一个景点挪到任意一天的任意位置（拖拽、上下移、换天都用它） */
export function moveItem(trip: Trip, fromDay: number, fromIndex: number, toDay: number, toIndex: number): Trip {
  return editDays(trip, (days) => {
    if (toDay < 0 || toDay >= days.length) return;
    const [item] = days[fromDay].splice(fromIndex, 1);
    if (!item) return;
    // 同一天往后挪时，前面删掉一个，目标位置要减一
    const target = fromDay === toDay && toIndex > fromIndex ? toIndex - 1 : toIndex;
    days[toDay].splice(Math.min(Math.max(target, 0), days[toDay].length), 0, item);
  });
}

export function setItemStatus(trip: Trip, day: number, index: number, status: ItemStatus): Trip {
  return editDays(trip, (days) => {
    days[day][index] = { ...days[day][index], status };
  });
}

export function removeItem(trip: Trip, day: number, index: number): Trip {
  return editDays(trip, (days) => {
    days[day].splice(index, 1);
  });
}

/** night = 0 是第 1 天出发前住的地方，night = d 是第 d 天晚上 */
export function setNight(trip: Trip, night: number, lodging: TripLodging | null): Trip {
  const nights = [...trip.nights];
  nights[night] = lodging;
  return { ...trip, nights };
}
