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
    <div className="border-l border-clay-600 pl-5 text-sm leading-7 text-ink-soft">
      <p>{dict.common.dataUnavailable}</p>
      {detail && <p className="mt-1 text-xs opacity-80">{detail}</p>}
    </div>
  );
}
