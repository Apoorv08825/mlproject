import React, { useMemo } from 'react';
import { LineChart as LineChartIcon, TrendingUp, Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

// Custom dot for the boundary between historical and predicted
const PredictionDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload?.isPredicted) return null;
  return <circle cx={cx} cy={cy} r={4} fill="#a855f7" stroke="#fff" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  const bg     = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const text   = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', color: text, fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>${Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
        </p>
      ))}
      {payload[0]?.payload?.isPredicted && (
        <p style={{ color: '#a855f7', fontSize: 10, marginTop: 4 }}>🔮 ML Forecast</p>
      )}
    </div>
  );
};

export const Charts = ({ historicalData, futureData }) => {
  const { isDark } = useTheme();

  const textColor   = isDark ? '#94a3b8' : '#64748b';
  const gridColor   = isDark ? '#334155' : '#e2e8f0';

  // Build combined chart data
  const combinedData = useMemo(() => {
    const hist = (historicalData || []).map(d => ({
      date:        d.date || `Day ${d.day}`,
      historical:  d.price,
      isPredicted: false,
    }));

    if (!futureData?.predictions?.length) return hist;

    const predicted = futureData.predictions.map(d => ({
      date:        d.date,
      predicted:   d.price,
      isPredicted: true,
      volatility:  d.volatility,
      signal:      d.ada_signal,
    }));

    // Stitch: last hist point bridges to first prediction
    const bridge = hist.length
      ? [{ ...hist[hist.length - 1], predicted: hist[hist.length - 1].historical }]
      : [];

    return [...hist, ...bridge, ...predicted];
  }, [historicalData, futureData]);

  // Volatility signal breakdown for future
  const volatilityCounts = useMemo(() => {
    if (!futureData?.predictions?.length) return null;
    const counts = { Low: 0, Medium: 0, High: 0 };
    futureData.predictions.forEach(p => { if (counts[p.volatility] !== undefined) counts[p.volatility]++; });
    return counts;
  }, [futureData]);

  const hasFuture = futureData?.predictions?.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Main Price Chart */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-lg transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            {hasFuture ? 'Historical + Forecast Price' : 'Historical Price (Dataset)'}
          </h3>
          {hasFuture && (
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" /> Historical
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-purple-500 rounded border-dashed border border-purple-500" /> Forecast
              </span>
            </div>
          )}
        </div>

        <div className="w-full" style={{ height: 320 }}>
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={textColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 9 }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke={textColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                  width={52}
                />
                <RechartsTooltip content={<CustomTooltip isDark={isDark} />} />

                {/* Historical line */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  name="Historical"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />

                {/* Forecast line */}
                {hasFuture && (
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    name="Forecast"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    strokeDasharray="6 3"
                    dot={<PredictionDot />}
                    activeDot={{ r: 6, fill: '#a855f7' }}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Forecast breakdown (only when future data exists) */}
      {hasFuture && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Price forecast table */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-lg transition-colors">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Forecast Breakdown
            </h3>
            <div className="overflow-auto max-h-56">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left py-2 pr-3">Date</th>
                    <th className="text-right py-2 pr-3">Price</th>
                    <th className="text-right py-2 pr-3">Volatility</th>
                    <th className="text-right py-2">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {futureData.predictions.map((p, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-1.5 pr-3 text-slate-600 dark:text-slate-400">{p.date}</td>
                      <td className="py-1.5 pr-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ${p.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          p.volatility === 'Low'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          p.volatility === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                      'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        }`}>{p.volatility}</span>
                      </td>
                      <td className="py-1.5 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          p.ada_signal === 'Positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          p.ada_signal === 'Negative' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>{p.ada_signal}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Volatility summary */}
          {volatilityCounts && (
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-lg transition-colors">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4">
                Forecast Signal Summary
              </h3>
              <div className="space-y-4 mt-2">
                {[
                  { label: 'Low Volatility',    count: volatilityCounts.Low,    color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Medium Volatility',  count: volatilityCounts.Medium, color: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400' },
                  { label: 'High Volatility',    count: volatilityCounts.High,   color: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400' },
                ].map(({ label, count, color, text }) => {
                  const total = futureData.predictions.length;
                  const pct   = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{label}</span>
                        <span className={`font-bold ${text}`}>{count} day{count !== 1 ? 's' : ''} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price range */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Min Forecast</p>
                  <p className="text-base font-bold text-rose-500 mt-0.5">
                    ${Math.min(...futureData.predictions.map(p => p.price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Max Forecast</p>
                  <p className="text-base font-bold text-emerald-500 mt-0.5">
                    ${Math.max(...futureData.predictions.map(p => p.price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
