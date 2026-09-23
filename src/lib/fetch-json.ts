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
 * 另加一层进程内缓存：开发模式下页面每次都重新渲染，没有这层 DEMO_KEY 的额度很快用完。
 */
export function fetchJson<T>(
  url: string,
  options: { headers?: HeadersInit; revalidate: number },
): Promise<T> {
  const now = Date.now();
  const hit = memo.get(url);
  if (hit && hit.expires > now) return hit.value as Promise<T>;

  const value = fetch(url, {
    headers: options.headers,
    next: { revalidate: options.revalidate },
  }).then(async (res) => {
    if (!res.ok) throw new ApiError(res.status, url);
    return (await res.json()) as T;
  });

  memo.set(url, { expires: now + options.revalidate * 1000, value });
  // 失败的请求不缓存，下次重试
  value.catch(() => {
    if (memo.get(url)?.value === value) memo.delete(url);
  });
  return value;
}
