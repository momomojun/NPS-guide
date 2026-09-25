/** Airbnb 搜索链接：地名 + 入住 / 退房日期（没定具体日期时只搜地名） */
export function airbnbUrl(place: string, checkin?: string | null, checkout?: string | null): string {
  const url = new URL(`https://www.airbnb.com/s/${encodeURIComponent(place)}/homes`);
  if (checkin && checkout) {
    url.searchParams.set("checkin", checkin);
    url.searchParams.set("checkout", checkout);
  }
  return url.toString();
}
