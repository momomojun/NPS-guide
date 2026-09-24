import type { ItemStatus, Trip, TripItem } from "./trip-store";

// 行程页上的手动调整，都是返回新行程的纯函数

function editDays(trip: Trip, change: (days: TripItem[][]) => void): Trip {
  const days = trip.days.map((day) => [...day]);
  change(days);
  return { ...trip, days };
}

export function moveWithinDay(trip: Trip, day: number, index: number, delta: number): Trip {
  return editDays(trip, (days) => {
    const target = index + delta;
    if (target < 0 || target >= days[day].length) return;
    [days[day][index], days[day][target]] = [days[day][target], days[day][index]];
  });
}

export function moveToDay(trip: Trip, day: number, index: number, targetDay: number): Trip {
  return editDays(trip, (days) => {
    if (targetDay < 0 || targetDay >= days.length) return;
    const [item] = days[day].splice(index, 1);
    days[targetDay].push(item);
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
