import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { PredictionCards } from './components/PredictionCards';
import { Charts } from './components/Charts';
import { ModelInsights } from './components/ModelInsights';
import { HistoryTable } from './components/HistoryTable';
import { PredictionPanel } from './components/PredictionPanel';

// Uses Vite proxy (/api → http://localhost:8080) so this works in any environment.
// To point at a remote backend, change VITE_API_BASE in your .env file.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

function AppContent() {
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [futureLoading, setFutureLoading] = useState(false);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState('dashboard');

  const [metrics, setMetrics]                 = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [historicalData, setHistoricalData]   = useState([]);
  const [futureData, setFutureData]           = useState(null);
  const [datasetInfo, setDatasetInfo]         = useState(null);
  const [history, setHistory]                 = useState([]);
  const [simulationParams, setSimulationParams] = useState(null);

  // Load static data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [mRes, fRes, hRes, dRes] = await Promise.all([
          axios.get(`${API_BASE}/metrics`),
          axios.get(`${API_BASE}/feature-importance`),
          axios.get(`${API_BASE}/historical-data?limit=120`),
          axios.get(`${API_BASE}/dataset-info`),
        ]);
        setMetrics(mRes.data);
        setFeatureImportance(fRes.data);
        setHistoricalData(hRes.data);
        setDatasetInfo(dRes.data);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    fetchInitialData();

    const saved = localStorage.getItem('ml_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // useCallback + functional setState prevents stale closure over `history`
  const saveToHistory = useCallback((result, type) => {
    const entry = {
      id:        Date.now(),
      timestamp: new Date().toLocaleString(),
      type,
      output:    result,
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      localStorage.setItem('ml_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ml_history');
  };

  // Predict Next Day
  const handlePredictNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFutureData(null);
    try {
      const res = await axios.get(`${API_BASE}/predict-next`);
      setResults(res.data);
      saveToHistory(res.data, 'next-day');
      if (activeTab !== 'dashboard') setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch prediction. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, saveToHistory]);

  // Predict Future N Days
  const handlePredictFuture = useCallback(async (params) => {
    const days = typeof params === 'object' ? params.days : params;
    const targetReturn = typeof params === 'object' ? params.targetReturn : null;
    const investmentAmount = typeof params === 'object' ? params.investmentAmount : null;

    setFutureLoading(true);
    setError(null);
    if (targetReturn !== null && investmentAmount !== null) {
      setSimulationParams({ targetReturn, investmentAmount });
    } else {
      setSimulationParams(null);
    }
    
    try {
      const res = await axios.get(`${API_BASE}/predict-future?days=${days}`);
      setFutureData(res.data);
      // Also set results to latest prediction day
      const last = res.data.predictions[res.data.predictions.length - 1];
      setResults({
        price:                 last.price,
        volatility:            last.volatility,
        volatility_confidence: 0.8,
        ada_signal:            last.ada_signal,
        ada_confidence:        0.75,
        cluster:               last.cluster,
      });
      saveToHistory({ days, targetReturn, investmentAmount, predictions: res.data.predictions }, 'multi-day');
      if (activeTab !== 'dashboard') setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch future predictions. Ensure backend is running.');
    } finally {
      setFutureLoading(false);
    }
  }, [activeTab, saveToHistory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 selection:bg-blue-500/30 relative">

      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-300">
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="block dark:hidden absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Prediction Control Panel */}
              <PredictionPanel
                onPredictNext={handlePredictNext}
                onPredictFuture={handlePredictFuture}
                loading={loading}
                futureLoading={futureLoading}
                error={error}
                datasetInfo={datasetInfo}
              />

              {/* Result Cards */}
              <PredictionCards results={results} simulationParams={simulationParams} datasetInfo={datasetInfo} />

              {/* Charts */}
              <Charts
                historicalData={historicalData}
                futureData={futureData}
              />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModelInsights featureImportance={featureImportance} metrics={metrics} />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HistoryTable history={history} clearHistory={clearHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
