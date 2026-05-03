import React from 'react';
import { Activity, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

export const ModelInsights = ({ featureImportance, metrics }) => {
  const { isDark } = useTheme();

  const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 vs slate-500
  const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 vs slate-200
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'; // slate-900 vs white
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Feature Importance Bar Chart */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-colors">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
          <BarChart3 className="text-blue-500 dark:text-blue-400" />
          RandomForest Feature Importance
        </h2>
        <div className="h-[400px] w-full">
          {featureImportance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="feature" type="category" stroke={isDark ? '#e2e8f0' : '#334155'} fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: isDark ? '#1e293b' : '#f1f5f9'}}
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                  formatter={(value) => [(value * 100).toFixed(2) + '%', 'Importance']}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#8b5cf6' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>
          )}
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl transition-colors">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
          <Activity className="text-emerald-500 dark:text-emerald-400" />
          Model Performance Metrics
        </h2>
        
        {metrics ? (
          <div className="space-y-6">
            {/* RF Classifier */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Volatility: RandomForest</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Accuracy</p><p className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{(metrics.RandomForestClassifier.Accuracy * 100).toFixed(1)}%</p></div>
                <div className="text-center border-x border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">F1 Score</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{(metrics.RandomForestClassifier.F1_Score * 100).toFixed(1)}%</p></div>
                <div className="text-center"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Precision</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{(metrics.RandomForestClassifier.Precision * 100).toFixed(1)}%</p></div>
              </div>
            </div>

            {/* AdaBoost Classifier */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Trend: AdaBoost</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Accuracy</p><p className="text-lg font-bold text-blue-500 dark:text-blue-400">{(metrics.AdaBoostClassifier.Accuracy * 100).toFixed(1)}%</p></div>
                <div className="text-center border-x border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">F1 Score</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{(metrics.AdaBoostClassifier.F1_Score * 100).toFixed(1)}%</p></div>
                <div className="text-center"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Precision</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{(metrics.AdaBoostClassifier.Precision * 100).toFixed(1)}%</p></div>
              </div>
            </div>

            {/* RF Regressor */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Price: RF Regressor</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">R² Score</p><p className="text-lg font-bold text-purple-500 dark:text-purple-400">{(metrics.RandomForestRegressor.R2_Score * 100).toFixed(1)}%</p></div>
                <div className="text-center border-x border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">RMSE</p><p className="text-lg font-bold text-rose-500 dark:text-rose-300">{metrics.RandomForestRegressor.RMSE}</p></div>
                <div className="text-center"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">MAE</p><p className="text-lg font-bold text-rose-500 dark:text-rose-300">{metrics.RandomForestRegressor.MAE}</p></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>
        )}
      </div>
    </div>
  );
};
