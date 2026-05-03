import React from 'react';
import { History } from 'lucide-react';

const badge = (type, val) => {
  const base = 'px-2 py-1 rounded text-xs border font-medium';
  if (type === 'volatility') {
    if (val === 'Low')    return `${base} text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10`;
    if (val === 'Medium') return `${base} text-amber-600   dark:text-amber-400   border-amber-500/30   bg-amber-50   dark:bg-amber-500/10`;
    if (val === 'High')   return `${base} text-rose-600    dark:text-rose-400    border-rose-500/30    bg-rose-50    dark:bg-rose-500/10`;
  }
  if (type === 'ada') {
    return val === 'Positive'
      ? `${base} text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10`
      : `${base} text-rose-600    dark:text-rose-400    border-rose-500/30    bg-rose-50    dark:bg-rose-500/10`;
  }
  return `${base} text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-50 dark:bg-blue-500/10`;
};

export const HistoryTable = ({ history, clearHistory }) => (
  <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden transition-colors">
    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <History className="text-blue-500 dark:text-blue-400" />
        Prediction History
      </h2>
      {history.length > 0 && (
        <button
          onClick={clearHistory}
          className="w-full sm:w-auto px-4 py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg transition-colors border border-rose-200 dark:border-rose-500/20"
        >
          Clear History
        </button>
      )}
    </div>

    <div className="overflow-x-auto">
      {history.length > 0 ? (
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 transition-colors">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Price / Days</th>
              <th className="px-6 py-4 hidden md:table-cell">Volatility</th>
              <th className="px-6 py-4 hidden md:table-cell">Signal</th>
              <th className="px-6 py-4 hidden md:table-cell">Cluster</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => {
              const isMulti = item.type === 'multi-day';
              return (
                <tr key={item.id} className="bg-white dark:bg-transparent border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs border font-medium ${isMulti
                      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                      : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'}`}>
                      {isMulti ? `${item.output.days}d Forecast` : 'Next Day'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">
                    {isMulti ? `${item.output.days} days` : `$${item.output.price?.toFixed(2) ?? '—'}`}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {!isMulti && item.output.volatility && (
                      <span className={badge('volatility', item.output.volatility)}>{item.output.volatility}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {!isMulti && item.output.ada_signal && (
                      <span className={badge('ada', item.output.ada_signal)}>{item.output.ada_signal}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-purple-600 dark:text-purple-400 font-bold hidden md:table-cell">
                    {!isMulti && item.output.cluster !== undefined ? `Profile ${item.output.cluster}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="p-12 text-center text-slate-500 dark:text-slate-500">
          No prediction history yet. Run a prediction to see it here!
        </div>
      )}
    </div>
  </div>
);
