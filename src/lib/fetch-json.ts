import "server-only";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    url: string,
  ) {
    super(`HTTP ${status} ${url}`);
    this.name = "ApiError";
  }
}

type Entry = { expires: number; value: Promise<unknown> };

const memo = new Map<string, Entry>();

/**
 * GET 一个 JSON 接口。生产环境靠 Next 的 fetch 缓存（只缓存 200 响应）；
 * 开发模式另加一层进程内缓存：页面每次都重新渲染，没有这层 DEMO_KEY 的额度很快用完。
 * 生产环境不加：Next 过期后先返回旧数据、后台再取新的，这层会把旧数据再存一整轮（NPS 公告晚半小时到一小时才更新）。
 */
export function fetchJson<T>(
  url: string,
  options: { headers?: HeadersInit; revalidate: number },
): Promise<T> {
  const now = Date.now();
  const memoize = process.env.NODE_ENV !== "production";
  const hit = memoize ? memo.get(url) : undefined;
  if (hit && hit.expires > now) return hit.value as Promise<T>;

  const value = fetch(url, {
    headers: options.headers,
    next: { revalidate: options.revalidate },
  }).then(async (res) => {
    if (!res.ok) throw new ApiError(res.status, url);
    return (await res.json()) as T;
  });

  if (!memoize) return value;
  memo.set(url, { expires: now + options.revalidate * 1000, value });
  // 失败的请求不缓存，下次重试
  value.catch(() => {
    if (memo.get(url)?.value === value) memo.delete(url);
  });
  return value;
}
