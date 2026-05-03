import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CalendarDays, Cpu, Loader2, Database, Info } from 'lucide-react';

export const PredictionPanel = ({
  onPredictNext,
  onPredictFuture,
  loading,
  futureLoading,
  error,
  datasetInfo,
}) => {
  const [futureDays, setFutureDays] = useState(7);

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Cpu size={18} className="text-blue-500 dark:text-blue-400" />
            Dataset-Based Prediction Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predictions are driven by your historical dataset — no manual input required.
          </p>
        </div>

        {/* Dataset badge */}
        {datasetInfo && (
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400">
            <Database size={13} />
            <span className="font-medium">
              {datasetInfo.total_rows} rows&nbsp;·&nbsp;
              {datasetInfo.date_range?.start} → {datasetInfo.date_range?.end}
            </span>
          </div>
        )}
      </div>

      {/* Latest snapshot row */}
      {datasetInfo?.latest_features && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 transition-colors">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Info size={12} /> Latest Dataset Row (used for prediction)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Daily Return', key: 'return', format: v => `${(v * 100).toFixed(3)}%` },
              { label: 'RSI',          key: 'rsi',    format: v => v.toFixed(1) },
              { label: 'MACD',         key: 'macd',   format: v => v.toFixed(1) },
              { label: 'Volatility',   key: 'volatility', format: v => `${(v * 100).toFixed(2)}%` },
            ].map(({ label, key, format }) => (
              <div key={key} className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                  {datasetInfo.latest_features[key] !== undefined
                    ? format(datasetInfo.latest_features[key])
                    : '—'}
                </span>
              </div>
            ))}
            {datasetInfo.latest_close && (
              <div className="flex flex-col col-span-2 sm:col-span-4">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Close Price</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${datasetInfo.latest_close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Predict Next Day */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPredictNext}
          disabled={loading || futureLoading}
          className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 className="animate-spin w-5 h-5" />
            : <TrendingUp className="w-5 h-5" />}
          {loading ? 'Predicting…' : 'Predict Next Day'}
        </motion.button>

        {/* Predict Future N Days */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPredictFuture(futureDays)}
            disabled={loading || futureLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {futureLoading
              ? <Loader2 className="animate-spin w-5 h-5" />
              : <CalendarDays className="w-5 h-5" />}
            {futureLoading ? 'Forecasting…' : `Forecast ${futureDays}d`}
          </motion.button>

          {/* Days Slider */}
          <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 min-w-[80px]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Days</span>
            <input
              type="range"
              min={1}
              max={30}
              value={futureDays}
              onChange={e => setFutureDays(Number(e.target.value))}
              className="w-16 accent-purple-500 mt-1"
            />
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{futureDays}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-rose-500 dark:text-rose-400 text-xs text-center mt-4 font-medium">{error}</p>
      )}
    </div>
  );
};
