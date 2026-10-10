import React, { useState } from 'react';
import { Info, X, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Platform information"
      className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center p-1 bg-teal-500/20 text-teal-400 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <p className="leading-tight">
            <strong className="text-white font-medium">Independent Study Platform:</strong> ClassMate AI is a self-directed lecture recovery tool. Not affiliated with any official university LMS or authentication. Faculty and students share the live local database.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
