import type { Dictionary } from "@/i18n/dictionaries";
import { isUsingDemoKey } from "@/lib/datagov";
import { ApiError } from "@/lib/fetch-json";

export function ApiUnavailable({ error, dict }: { error: unknown; dict: Dictionary }) {
  console.error(error);
  const limited = error instanceof ApiError && error.status === 429;
  const detail = limited
    ? isUsingDemoKey()
      ? dict.common.demoKeyLimited
      : dict.common.rateLimited
    : null;

  return (
    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
      <p>{dict.common.dataUnavailable}</p>
      {detail && <p className="mt-1 text-xs opacity-80">{detail}</p>}
    </div>
  );
}
