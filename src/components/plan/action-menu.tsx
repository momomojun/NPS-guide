"use client";

import { useRef } from "react";
import { IconMore } from "@/components/icons";

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
        className="flex size-7 cursor-pointer list-none items-center justify-center text-mute hover:text-ink [&::-webkit-details-marker]:hidden"
      >
        <IconMore className="text-base" />
      </summary>
      <ul className="absolute right-0 z-20 mt-1 w-44 border border-line bg-paper py-1 text-sm shadow-[0_12px_32px_rgba(28,27,24,0.14)]">
        {actions.map((action) => (
          <li key={action.label}>
            <button
              type="button"
              disabled={action.disabled}
              onClick={() => {
                action.onSelect();
                if (ref.current) ref.current.open = false;
              }}
              className={`block w-full px-4 py-2 text-left hover:bg-paper-deep disabled:opacity-40 ${
                action.danger ? "text-clay-700" : ""
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
