export type Settled<T> = { ok: true; data: T } | { ok: false; error: unknown };

// 把成功和失败都变成普通值，组件不用在 try/catch 里渲染 JSX
export function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  return promise.then(
    (data) => ({ ok: true, data }),
    (error: unknown) => ({ ok: false, error }),
  );
}
