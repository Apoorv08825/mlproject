import React from 'react';
import { Info } from 'lucide-react';

export const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <Info size={14} className="text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
    <div className="opacity-0 w-48 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-md py-2 px-3 absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-slate-200 dark:border-slate-700">
      {text}
      <svg className="absolute text-white dark:text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
        <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
      </svg>
    </div>
  </div>
);
