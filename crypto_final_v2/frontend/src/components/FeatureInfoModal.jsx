import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Calculator, BrainCircuit, Lightbulb } from 'lucide-react';
import { featureDictionary } from '../data/featureDictionary';

export const FeatureInfoModal = ({ isOpen, onClose, featureId }) => {
  if (!featureId || !featureDictionary[featureId]) return null;

  const feature = featureDictionary[featureId];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{feature.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{feature.shortDesc}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-200/50 dark:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Formula & Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Calculator size={14} /> Technical Formula
                  </h4>
                  <code className="text-sm font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                    {feature.formula}
                  </code>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                    Typical Range
                  </h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {feature.range}
                  </p>
                </div>
              </div>

              {/* Meaning / Interpretation */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Lightbulb size={18} className="text-amber-500" /> Market Interpretation
                </h4>
                <div className="space-y-3">
                  {feature.meaning.map((m, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-mono font-semibold whitespace-nowrap border border-slate-200 dark:border-slate-700">
                        {m.condition}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {m.interpretation}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 italic">
                    <span className="font-semibold not-italic mr-1">Example:</span>
                    {feature.example}
                  </p>
                </div>
              </div>

              {/* ML Impact */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <BrainCircuit size={18} className="text-emerald-500" /> Why ML Models Use This
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  {feature.mlImpact}
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
