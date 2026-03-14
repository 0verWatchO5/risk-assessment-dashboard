"use client";

import { useState } from "react";

type InfoTooltipProps = {
  term: string;
  definition: string;
};

export default function InfoTooltip({ term, definition }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label={`Learn about ${term}`}
        className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold
                   flex items-center justify-center hover:bg-indigo-600 hover:text-white
                   transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        i
      </button>

      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                     w-60 rounded-lg bg-slate-800 border border-slate-600
                     shadow-xl p-3 pointer-events-none"
        >
          <p className="text-xs font-semibold text-indigo-400 mb-1">{term}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{definition}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2
                          border-b border-r border-slate-600 bg-slate-800 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
