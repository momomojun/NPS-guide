"use client";

import { useRef } from "react";

export interface MenuAction {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
}

/** 行程里每个景点的“更多操作”下拉菜单，用原生 details 实现，选完自动收起 */
export function ActionMenu({ label, actions }: { label: string; actions: MenuAction[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={ref} className="relative">
      <summary
        aria-label={label}
        title={label}
        className="flex size-7 cursor-pointer list-none items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 [&::-webkit-details-marker]:hidden"
      >
        ⋯
      </summary>
      <ul className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 text-sm shadow-lg dark:border-stone-700 dark:bg-stone-900">
        {actions.map((action) => (
          <li key={action.label}>
            <button
              type="button"
              disabled={action.disabled}
              onClick={() => {
                action.onSelect();
                if (ref.current) ref.current.open = false;
              }}
              className={`block w-full px-3 py-1.5 text-left hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-800 ${
                action.danger ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
