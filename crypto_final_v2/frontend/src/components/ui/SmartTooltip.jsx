import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { featureDictionary } from '../../data/featureDictionary';

export const SmartTooltip = ({ featureId, onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState('top');
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const feature = featureDictionary[featureId];
  if (!feature) return null;

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const padding = 10;
    
    // Default to top
    let newPos = 'top';
    let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    let y = triggerRect.top - tooltipRect.height - padding;

    // Check top overflow
    if (y < padding) {
      newPos = 'bottom';
      y = triggerRect.bottom + padding;
    }

    // Check left/right overflow
    if (x < padding) {
      x = padding;
    } else if (x + tooltipRect.width > window.innerWidth - padding) {
      x = window.innerWidth - tooltipRect.width - padding;
    }

    setCoords({ x, y });
    setPosition(newPos);
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure tooltip is mounted to get its actual size
      requestAnimationFrame(() => {
        updatePosition();
      });
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // true to catch all scrolls
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Handle click outside for mobile/click logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && tooltipRef.current && !tooltipRef.current.contains(event.target) && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    // Only trigger hover on non-touch devices to avoid sticky tooltips on mobile
    if (window.matchMedia('(hover: hover)').matches) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setIsOpen(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLearnMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onOpenModal(featureId);
  };

  return (
    <>
      <span 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-flex items-center ml-1.5 cursor-pointer text-slate-400 hover:text-blue-500 transition-colors"
        aria-label={`Info about ${feature.name}`}
      >
        <Info size={14} />
      </span>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[9999] w-64 md:w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 flex flex-col gap-2"
              style={{ 
                left: `${coords.x}px`, 
                top: `${coords.y}px` 
              }}
            >
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1">
                {feature.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {feature.shortDesc}
              </p>
              
              <div className="mt-2 flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                  Range: {feature.range}
                </span>
                <button 
                  onClick={handleLearnMore}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Deep Dive <ExternalLink size={12} />
                </button>
              </div>

              {/* Tooltip Arrow */}
              <div 
                className={`absolute w-3 h-3 bg-white/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 rotate-45 pointer-events-none
                  ${position === 'top' ? 'bottom-[-6px] border-b border-r left-1/2 -translate-x-1/2' : ''}
                  ${position === 'bottom' ? 'top-[-6px] border-t border-l left-1/2 -translate-x-1/2' : ''}
                `}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
