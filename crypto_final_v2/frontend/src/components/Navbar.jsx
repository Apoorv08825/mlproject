import React, { useState } from 'react';
import { LayoutDashboard, BarChart3, History, Menu, X, Moon, Sun, Cpu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'insights', icon: BarChart3, label: 'Model Insights' },
    { id: 'history', icon: History, label: 'History' }
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative flex flex-col md:flex-row items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
      
      <div className="w-full md:w-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              CryptoSight SaaS
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              ML-Powered Trading Intelligence
            </p>
          </div>
        </div>

        {/* Mobile menu and theme toggle container */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        <nav className="flex gap-2 p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <button 
          onClick={toggleTheme} 
          className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full z-50 md:hidden mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
