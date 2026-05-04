import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Users, ShieldAlert, MousePointerClick, TrendingUp, TrendingDown } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

const getColor = (type, val) => {
  if (type === 'volatility') {
    if (val === 'Low')    return 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10';
    if (val === 'Medium') return 'text-amber-600   dark:text-amber-400   border-amber-500/30   bg-amber-50   dark:bg-amber-500/10';
    if (val === 'High')   return 'text-rose-600    dark:text-rose-400    border-rose-500/30    bg-rose-50    dark:bg-rose-500/10';
  }
  if (type === 'ada') {
    return val === 'Positive'
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
      : 'text-rose-600    dark:text-rose-400    border-rose-500/30    bg-rose-50    dark:bg-rose-500/10';
  }
  return 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-50 dark:bg-blue-500/10';
};

const getProgressColor = (type, val) => {
  if (type === 'volatility') {
    if (val === 'Low')    return 'bg-emerald-500';
    if (val === 'Medium') return 'bg-amber-500';
    if (val === 'High')   return 'bg-rose-500';
  }
  return val === 'Positive' ? 'bg-emerald-500' : 'bg-rose-500';
};

export const PredictionCards = ({ results, simulationParams, datasetInfo }) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!results) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 min-h-[140px] transition-colors">
        <Activity className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">Click "Predict Next Day" or "Forecast Nd" to view ML results</p>
      </div>
    );
  }

  const isPositive = results.ada_signal === 'Positive';
  const lastKnownPrice = results.last_known_price || datasetInfo?.latest_close;

  let simulationContent = null;
  if (simulationParams && lastKnownPrice) {
    const predictedReturn = (results.price - lastKnownPrice) / lastKnownPrice;
    const predictedReturnPct = predictedReturn * 100;
    const targetReturnPct = simulationParams.targetReturn;
    const isTargetMet = predictedReturnPct >= targetReturnPct;
    
    const finalAmount = simulationParams.investmentAmount * (1 + predictedReturn);
    const profit = finalAmount - simulationParams.investmentAmount;

    simulationContent = (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-5 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
          isTargetMet 
            ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30' 
            : 'bg-rose-50/80 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isTargetMet ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-800/50 text-rose-600 dark:text-rose-400'}`}>
            {isTargetMet ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isTargetMet ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
              {isTargetMet ? 'Target Achieved' : 'Target Missed'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Predicted return: <strong className={isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{predictedReturnPct.toFixed(2)}%</strong> vs Target: <strong>{targetReturnPct}%</strong>
            </p>
          </div>
        </div>

        <div className="flex gap-6 text-center md:text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Final Value</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">${finalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Est. Profit/Loss</p>
            <p className={`text-xl font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {simulationContent}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Price Card */}
        <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors">
          <div className="absolute top-0 w-full h-1 bg-emerald-500" />
          <DollarSign className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Predicted Price</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            ${results.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          {lastKnownPrice && (
            <div className="flex items-center gap-1 mt-1 text-xs font-medium">
              {results.price >= lastKnownPrice
                ? <TrendingUp size={12} className="text-emerald-500" />
                : <TrendingDown size={12} className="text-rose-500" />}
              <span className={results.price >= lastKnownPrice ? 'text-emerald-500' : 'text-rose-500'}>
                {(((results.price - lastKnownPrice) / lastKnownPrice) * 100).toFixed(2)}% vs last close
              </span>
            </div>
          )}
        </motion.div>

        {/* Volatility Card */}
        <motion.div whileHover={{ y: -4 }} className={`bg-white dark:bg-slate-900/80 backdrop-blur-md border rounded-xl p-5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors ${getColor('volatility', results.volatility)}`}>
          <Activity className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-xs opacity-70 uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-400">Volatility Level</p>
          <h3 className="text-2xl font-bold mt-1">{results.volatility}</h3>
          <div className="w-full mt-3 flex flex-col items-center">
            <div className="flex justify-between w-full text-[10px] mb-1 font-medium opacity-70">
              <span>Confidence</span>
              <span>{((results.volatility_confidence || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(results.volatility_confidence || 0) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${getProgressColor('volatility', results.volatility)}`}
              />
            </div>
          </div>
        </motion.div>

        {/* AdaBoost Card */}
        <motion.div whileHover={{ y: -4 }} className={`bg-white dark:bg-slate-900/80 backdrop-blur-md border rounded-xl p-5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors ${getColor('ada', results.ada_signal)}`}>
          <ShieldAlert className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-xs opacity-70 uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-400">Trend Signal</p>
          <h3 className="text-2xl font-bold mt-1">{results.ada_signal}</h3>
          <div className="w-full mt-3 flex flex-col items-center">
            <div className="flex justify-between w-full text-[10px] mb-1 font-medium opacity-70">
              <span>Confidence</span>
              <span>{((results.ada_confidence || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(results.ada_confidence || 0) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${getProgressColor('ada', results.ada_signal)}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Cluster Card */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-purple-200 dark:border-purple-500/30 bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-900/80 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer transition-all group"
        >
          <div className="absolute top-0 w-full h-1 bg-purple-500" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500">
            <MousePointerClick size={16} />
          </div>
          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Investor Profile</p>
          <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
            Cluster {results.cluster}
          </h3>
          <p className="text-[10px] mt-2 text-purple-500 dark:text-purple-400/70 font-medium">Click to view strategy details</p>
        </motion.button>
      </motion.div>

      <ProfileModal isOpen={modalOpen} onClose={() => setModalOpen(false)} clusterId={results.cluster} />
    </>
  );
};
