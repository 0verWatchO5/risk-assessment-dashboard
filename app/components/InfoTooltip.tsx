"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";

type InfoTooltipProps = {
  term: string;
  definition: string;
};

export default function InfoTooltip({ term, definition }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label={`Learn about ${term}`}
        className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold
                   flex items-center justify-center hover:bg-sky-600 hover:text-white
                   transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        i
      </button>

      {visible && (
        <span
          role="tooltip"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                     w-60 rounded-xl border border-slate-200
                     shadow-xl p-3 pointer-events-none"
          style={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)" }}
        >
          <span className="block text-xs font-semibold text-sky-700 mb-1">{term}</span>
          <span className="block text-xs text-slate-600 leading-relaxed">{definition}</span>
          {/* Arrow */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2
                           border-t border-l border-slate-200 rotate-45 mb-[-4px]"
                style={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.98)" : "rgba(255, 255, 255, 0.98)" }}
          />
        </span>
      )}
    </span>
  );
}
