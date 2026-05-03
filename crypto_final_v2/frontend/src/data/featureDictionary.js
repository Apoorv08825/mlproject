export const featureDictionary = {
  return: {
    id: 'return',
    name: 'Return (%)',
    shortDesc: 'Percentage change in price over the previous period.',
    formula: '((Current Price - Previous Price) / Previous Price) × 100',
    range: '-100% to +∞',
    meaning: [
      { condition: '> 0', interpretation: 'Positive momentum, asset gained value.' },
      { condition: '< 0', interpretation: 'Negative momentum, asset lost value.' }
    ],
    example: 'If Bitcoin moves from $40,000 to $42,000, the return is +5%.',
    mlImpact: 'A foundational feature that provides the baseline momentum of the asset. The models use this to capture immediate price sentiment and calculate volatility.'
  },
  ma_10: {
    id: 'ma_10',
    name: 'Moving Average (10-Day)',
    shortDesc: 'The average closing price over the last 10 periods.',
    formula: 'Sum of Closing Prices (last 10 periods) / 10',
    range: '0 to +∞',
    meaning: [
      { condition: 'Price > MA 10', interpretation: 'Short-term bullish trend.' },
      { condition: 'Price < MA 10', interpretation: 'Short-term bearish trend.' }
    ],
    example: 'If the last 10 daily closes sum to $450,000, the MA 10 is $45,000.',
    mlImpact: 'Helps the models filter out daily noise and identify short-term trend directions. Often used in crossover strategies (e.g., crossing the MA 50).'
  },
  ma_50: {
    id: 'ma_50',
    name: 'Moving Average (50-Day)',
    shortDesc: 'The average closing price over the last 50 periods.',
    formula: 'Sum of Closing Prices (last 50 periods) / 50',
    range: '0 to +∞',
    meaning: [
      { condition: 'Price > MA 50', interpretation: 'Medium-term bullish trend.' },
      { condition: 'Price < MA 50', interpretation: 'Medium-term bearish trend.' }
    ],
    example: 'A rising MA 50 indicates a sustained multi-week uptrend.',
    mlImpact: 'Acts as a critical support/resistance indicator in machine learning logic. The models weigh this heavily to determine if the asset is in a macro bull or bear market.'
  },
  volatility: {
    id: 'volatility',
    name: 'Volatility',
    shortDesc: 'The standard deviation of returns, measuring price fluctuation.',
    formula: 'Standard Deviation(Returns)',
    range: '0 to +∞',
    meaning: [
      { condition: 'High Value', interpretation: 'Large, rapid price swings. Higher risk.' },
      { condition: 'Low Value', interpretation: 'Stable, predictable price movement. Lower risk.' }
    ],
    example: 'A volatility of 0.05 implies standard 5% daily swings, while 0.15 implies extreme 15% swings.',
    mlImpact: 'Crucial for risk assessment. The clustering and classification models use volatility to differentiate between conservative and aggressive market environments.'
  },
  rsi: {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    shortDesc: 'Momentum oscillator measuring the speed and change of price movements.',
    formula: '100 - [100 / (1 + (Average Gain / Average Loss))]',
    range: '0 to 100',
    meaning: [
      { condition: '> 70', interpretation: 'Overbought: Asset may be overvalued and due for a pullback.' },
      { condition: '< 30', interpretation: 'Oversold: Asset may be undervalued and due for a bounce.' }
    ],
    example: 'An RSI of 85 strongly signals the market is exhausted from buying.',
    mlImpact: 'Provides the Random Forest and AdaBoost models with mean-reversion signals, acting as an early warning system for trend reversals.'
  },
  macd: {
    id: 'macd',
    name: 'MACD',
    shortDesc: 'Moving Average Convergence Divergence, a trend-following momentum indicator.',
    formula: '12-Period EMA - 26-Period EMA',
    range: '-∞ to +∞',
    meaning: [
      { condition: '> 0', interpretation: 'Bullish momentum (Short-term avg > Long-term avg).' },
      { condition: '< 0', interpretation: 'Bearish momentum (Short-term avg < Long-term avg).' }
    ],
    example: 'When the MACD line crosses above the signal line, it triggers a strong buy signal in traditional trading.',
    mlImpact: 'The models utilize MACD to quantify trend acceleration and detect divergences between price action and momentum.'
  },
  bb_high: {
    id: 'bb_high',
    name: 'Bollinger Band (Upper)',
    shortDesc: 'Two standard deviations above the 20-period simple moving average.',
    formula: '20-Day SMA + (20-Day StdDev × 2)',
    range: '0 to +∞',
    meaning: [
      { condition: 'Price ≈ BB High', interpretation: 'Price is abnormally high relative to recent history; potential resistance.' }
    ],
    example: 'If the price breaks above the Upper Bollinger Band, it signifies a strong, statistically significant breakout.',
    mlImpact: 'Acts as dynamic resistance for the Regression model to accurately cap price predictions during explosive rallies.'
  },
  bb_low: {
    id: 'bb_low',
    name: 'Bollinger Band (Lower)',
    shortDesc: 'Two standard deviations below the 20-period simple moving average.',
    formula: '20-Day SMA - (20-Day StdDev × 2)',
    range: '0 to +∞',
    meaning: [
      { condition: 'Price ≈ BB Low', interpretation: 'Price is abnormally low relative to recent history; potential support.' }
    ],
    example: 'If the price drops below the Lower Bollinger Band, it indicates panic selling and potential oversold conditions.',
    mlImpact: 'Acts as dynamic support, helping models prevent under-predicting the price during extreme market crashes.'
  }
};
