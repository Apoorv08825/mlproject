import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

const clusterData = {
  0: {
    title: 'Conservative Investor',
    risk: 'Low Risk',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'This profile prefers stability over high returns. It typically aligns with low volatility periods and stable trends. The focus is on capital preservation rather than aggressive growth.',
    strategy: 'Focus on stable assets, dollar-cost averaging, and preserving capital. Avoid high-leverage trades.'
  },
  1: {
    title: 'Moderate Investor',
    risk: 'Medium Risk',
    icon: TrendingUp,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'This profile balances risk and reward. It emerges during periods of moderate volatility with clear, steady market trends. Capitalizing on strong signals while maintaining stop-losses is key.',
    strategy: 'Diversify portfolio, utilize trend-following strategies, and maintain a balanced risk-to-reward ratio.'
  },
  2: {
    title: 'Aggressive / High-Frequency',
    risk: 'High Risk',
    icon: Zap,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    description: 'This profile thrives in highly volatile markets. It typically signifies erratic price swings where significant short-term gains (or losses) are possible.',
    strategy: 'Active trading, strict stop-loss management, and leveraging momentum breakouts. Not suitable for passive holding.'
  }
};

export const ProfileModal = ({ isOpen, onClose, clusterId }) => {
  if (clusterId === null || clusterId === undefined) return null;
  
  // Default to 1 if out of bounds
  const profile = clusterData[clusterId] || clusterData[1];
  const Icon = profile.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className={`p-6 border-b dark:border-slate-800 ${profile.bg}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white dark:bg-slate-950 shadow-sm ${profile.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-semibold ${profile.bg} ${profile.color} ${profile.border} border`}>
                      {profile.risk}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle size={16} className="text-slate-400" /> Market Interpretation
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {profile.description}
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wide">
                  Suggested Strategy
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {profile.strategy}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
