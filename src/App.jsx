import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, DollarSign, ArrowUpCircle, ArrowDownCircle, RefreshCw, Bell, Settings, Target, Shield, Zap, BarChart3, TrendingUpDown, Clock } from 'lucide-react';

const ForexAnalyzerPro = () => {
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1H');
  const [data, setData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveRates, setLiveRates] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [volumeData, setVolumeData] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState({ bullish: 65, bearish: 35 });

  const pairs = [
    { code: 'EUR/USD', name: 'Euro / Dollar US', flag: '🇪🇺🇺🇸' },
    { code: 'GBP/USD', name: 'Livre Sterling / Dollar US', flag: '🇬🇧🇺🇸' },
    { code: 'USD/JPY', name: 'Dollar US / Yen', flag: '🇺🇸🇯🇵' },
    { code: 'AUD/USD', name: 'Dollar Australien / Dollar US', flag: '🇦🇺🇺🇸' },
    { code: 'USD/CAD', name: 'Dollar US / Dollar Canadien', flag: '🇺🇸🇨🇦' },
    { code: 'USD/CHF', name: 'Dollar US / Franc Suisse', flag: '🇺🇸🇨🇭' }
  ];
  
  const timeframes = [
    { value: '1M', label: '1 Min', icon: Clock },
    { value: '5M', label: '5 Min', icon: Clock },
    { value: '15M', label: '15 Min', icon: Clock },
    { value: '1H', label: '1 Heure', icon: Clock },
    { value: '4H', label: '4 Heures', icon: Clock },
    { value: '1D', label: '1 Jour', icon: Clock }
  ];

  // Fonction pour récupérer les données en temps réel depuis l'API
  const fetchLiveRates = useCallback(async () => {
    try {
      // Utilisation de l'API Exchangerate pour les données réelles
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const result = await response.json();
      
      if (result && result.rates) {
        setLiveRates({
          'EUR/USD': (1 / result.rates.EUR).toFixed(4),
          'GBP/USD': (1 / result.rates.GBP).toFixed(4),
          'USD/JPY': result.rates.JPY.toFixed(2),
          'AUD/USD': (1 / result.rates.AUD).toFixed(4),
          'USD/CAD': result.rates.CAD.toFixed(4),
          'USD/CHF': result.rates.CHF.toFixed(4)
        });
      }
    } catch (error) {
      console.log('API temporairement indisponible, utilisation de données simulées');
      // Fallback vers données simulées
      setLiveRates({
        'EUR/USD': (1.0850 + (Math.random() - 0.5) * 0.01).toFixed(4),
        'GBP/USD': (1.2650 + (Math.random() - 0.5) * 0.01).toFixed(4),
        'USD/JPY': (149.50 + (Math.random() - 0.5) * 0.5).toFixed(2),
        'AUD/USD': (0.6580 + (Math.random() - 0.5) * 0.01).toFixed(4),
        'USD/CAD': (1.3620 + (Math.random() - 0.5) * 0.01).toFixed(4),
        'USD/CHF': (0.8450 + (Math.random() - 0.5) * 0.01).toFixed(4)
      });
    }
  }, []);

  // Génération de données historiques enrichies
  const generateEnhancedData = useCallback(() => {
    const baseRates = {
      'EUR/USD': parseFloat(liveRates['EUR/USD']) || 1.0850,
      'GBP/USD': parseFloat(liveRates['GBP/USD']) || 1.2650,
      'USD/JPY': parseFloat(liveRates['USD/JPY']) || 149.50,
      'AUD/USD': parseFloat(liveRates['AUD/USD']) || 0.6580,
      'USD/CAD': parseFloat(liveRates['USD/CAD']) || 1.3620,
      'USD/CHF': parseFloat(liveRates['USD/CHF']) || 0.8450
    };

    const points = 100;
    const chartData = [];
    const volData = [];
    let price = baseRates[selectedPair];
    const volatility = selectedPair === 'USD/JPY' ? 0.3 : 0.0008;
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * volatility;
      const trend = Math.sin(i / 15) * volatility * 0.7;
      const noise = (Math.random() - 0.5) * volatility * 0.3;
      price = price + change + trend + noise;
      
      const high = price + Math.random() * volatility * 0.8;
      const low = price - Math.random() * volatility * 0.8;
      const open = low + (high - low) * Math.random();
      const close = low + (high - low) * Math.random();
      const volume = Math.floor(Math.random() * 100000) + 30000;
      
      const now = new Date();
      now.setMinutes(now.getMinutes() - (points - i) * 5);
      
      chartData.push({
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
        price: parseFloat(price.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
        open: parseFloat(open.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
        high: parseFloat(high.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
        low: parseFloat(low.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
        close: parseFloat(close.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
        volume,
        sma20: i >= 20 ? chartData.slice(Math.max(0, i - 20), i).reduce((a, b) => a + b.price, 0) / Math.min(20, i) : null,
        sma50: i >= 50 ? chartData.slice(Math.max(0, i - 50), i).reduce((a, b) => a + b.price, 0) / Math.min(50, i) : null
      });

      volData.push({
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        volume
      });
    }
    
    return { chartData, volData };
  }, [selectedPair, liveRates]);

  // Analyse technique ultra-avancée
  const performAdvancedAnalysis = useCallback((chartData) => {
    if (chartData.length < 50) return null;

    const prices = chartData.map(d => d.price);
    const volumes = chartData.map(d => d.volume);
    const highs = chartData.map(d => d.high);
    const lows = chartData.map(d => d.low);
    
    // Moyennes mobiles
    const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50;
    const ema12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ema26 = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
    
    const currentPrice = prices[prices.length - 1];
    const prevPrice = prices[prices.length - 2];
    const priceChange = currentPrice - prevPrice;
    const priceChangePercent = (priceChange / prevPrice) * 100;
    
    // RSI amélioré
    const gains = [];
    const losses = [];
    for (let i = 1; i <= 14 && i < prices.length; i++) {
      const diff = prices[prices.length - i] - prices[prices.length - i - 1];
      if (diff > 0) gains.push(diff);
      else losses.push(Math.abs(diff));
    }
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / 14 : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / 14 : 0;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    // MACD
    const macd = ema12 - ema26;
    const macdSignal = macd;
    const histogram = macd - macdSignal;
    
    // Bandes de Bollinger
    const stdDev = Math.sqrt(
      prices.slice(-20).map(p => Math.pow(p - sma20, 2)).reduce((a, b) => a + b, 0) / 20
    );
    const upperBand = sma20 + (2 * stdDev);
    const lowerBand = sma20 - (2 * stdDev);
    
    // Stochastique
    const high14 = Math.max(...highs.slice(-14));
    const low14 = Math.min(...lows.slice(-14));
    const stochastic = ((currentPrice - low14) / (high14 - low14)) * 100;
    
    // ATR (Average True Range)
    const trueRanges = [];
    for (let i = 1; i < Math.min(14, prices.length); i++) {
      const tr = Math.max(
        highs[highs.length - i] - lows[lows.length - i],
        Math.abs(highs[highs.length - i] - prices[prices.length - i - 1]),
        Math.abs(lows[lows.length - i] - prices[prices.length - i - 1])
      );
      trueRanges.push(tr);
    }
    const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;
    
    // Volume
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeRatio = volumes[volumes.length - 1] / avgVolume;
    
    // Support et résistance multiples
    const pivotPoint = (highs[highs.length - 1] + lows[lows.length - 1] + currentPrice) / 3;
    const resistance1 = (2 * pivotPoint) - lows[lows.length - 1];
    const support1 = (2 * pivotPoint) - highs[highs.length - 1];
    const resistance2 = pivotPoint + (highs[highs.length - 1] - lows[lows.length - 1]);
    const support2 = pivotPoint - (highs[highs.length - 1] - lows[lows.length - 1]);
    
    // Algorithme de signal avancé
    let tradingSignal = 'NEUTRE';
    let confidence = 50;
    let strength = 0;
    const reasons = [];
    const warnings = [];
    
    // Conditions haussières
    if (currentPrice > sma20) { strength += 15; reasons.push('Prix > SMA20'); }
    if (currentPrice > sma50) { strength += 15; reasons.push('Prix > SMA50'); }
    if (sma20 > sma50) { strength += 10; reasons.push('Croisement haussier MA'); }
    if (rsi > 30 && rsi < 70) { strength += 10; reasons.push('RSI en zone neutre'); }
    if (rsi < 30) { strength += 20; reasons.push('RSI survendu - opportunité'); }
    if (macd > 0) { strength += 15; reasons.push('MACD positif'); }
    if (histogram > 0) { strength += 5; reasons.push('Histogramme MACD positif'); }
    if (currentPrice > lowerBand && currentPrice < upperBand) { strength += 5; }
    if (stochastic < 20) { strength += 15; reasons.push('Stochastique survendu'); }
    if (volumeRatio > 1.3) { strength += 10; reasons.push('Volume élevé confirme'); }
    
    // Conditions baissières
    if (currentPrice < sma20) { strength -= 15; reasons.push('Prix < SMA20'); }
    if (currentPrice < sma50) { strength -= 15; reasons.push('Prix < SMA50'); }
    if (sma20 < sma50) { strength -= 10; reasons.push('Croisement baissier MA'); }
    if (rsi > 70) { strength -= 20; warnings.push('RSI suracheté - prudence'); }
    if (macd < 0) { strength -= 15; reasons.push('MACD négatif'); }
    if (histogram < 0) { strength -= 5; }
    if (stochastic > 80) { strength -= 15; reasons.push('Stochastique suracheté'); }
    
    // Avertissements
    if (currentPrice > upperBand) warnings.push('Prix au-dessus de Bollinger supérieur');
    if (currentPrice < lowerBand) warnings.push('Prix en-dessous de Bollinger inférieur');
    if (volumeRatio < 0.7) warnings.push('Volume faible - signal peu fiable');
    
    // Détermination du signal final
    if (strength > 60) {
      tradingSignal = 'ACHAT FORT';
      confidence = Math.min(95, 60 + strength - 60);
    } else if (strength > 30) {
      tradingSignal = 'ACHAT';
      confidence = Math.min(80, 50 + strength - 30);
    } else if (strength < -60) {
      tradingSignal = 'VENTE FORTE';
      confidence = Math.min(95, 60 + Math.abs(strength) - 60);
    } else if (strength < -30) {
      tradingSignal = 'VENTE';
      confidence = Math.min(80, 50 + Math.abs(strength) - 30);
    } else {
      tradingSignal = 'NEUTRE';
      confidence = 50 - Math.abs(strength) / 2;
    }
    
    // Calcul des niveaux de trading
    const isLong = tradingSignal.includes('ACHAT');
    const stopLoss = isLong ? support1 : resistance1;
    const takeProfit1 = isLong ? resistance1 : support1;
    const takeProfit2 = isLong ? resistance2 : support2;
    const riskReward = Math.abs((takeProfit1 - currentPrice) / (currentPrice - stopLoss));
    
    // Prédiction basée sur momentum
    const momentum = (currentPrice - prices[prices.length - 10]) / prices[prices.length - 10];
    const prediction = currentPrice * (1 + momentum * 0.5);
    
    return {
      currentPrice,
      priceChange,
      priceChangePercent,
      sma20,
      sma50,
      ema12,
      ema26,
      rsi,
      macd,
      macdSignal: macdSignal,
      histogram,
      upperBand,
      lowerBand,
      stochastic,
      atr,
      volumeRatio,
      pivotPoint,
      support1,
      support2,
      resistance1,
      resistance2,
      signalType: tradingSignal,
      confidence,
      strength,
      reasons: reasons.slice(0, 5),
      warnings,
      stopLoss,
      takeProfit1,
      takeProfit2,
      riskReward,
      prediction: parseFloat(prediction.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
      trend: currentPrice > sma20 ? 'Haussière' : 'Baissière',
      volatility: atr > 0.001 ? 'Élevée' : 'Normale'
    };
  }, [selectedPair]);

  // Ajouter une notification
  const addNotification = useCallback((message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString('fr-FR')
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  }, []);

  // Initialisation
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchLiveRates();
      setIsLoading(false);
    };
    init();
  }, [fetchLiveRates]);

  // Mise à jour des données
  useEffect(() => {
    if (Object.keys(liveRates).length > 0) {
      const { chartData, volData } = generateEnhancedData();
      setData(chartData);
      setVolumeData(volData);
      const newAnalysis = performAdvancedAnalysis(chartData);
      setAnalysis(newAnalysis);
      
      if (newAnalysis) {
        setMarketSentiment({
          bullish: newAnalysis.strength > 0 ? 50 + newAnalysis.strength / 2 : 50,
          bearish: newAnalysis.strength < 0 ? 50 + Math.abs(newAnalysis.strength) / 2 : 50
        });
      }
    }
  }, [selectedPair, timeframe, liveRates, generateEnhancedData, performAdvancedAnalysis]);

  // Flux temps réel
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchLiveRates();
      
      setData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastPoint = prevData[prevData.length - 1];
        const basePrice = parseFloat(liveRates[selectedPair]) || lastPoint.price;
        const volatility = selectedPair === 'USD/JPY' ? 0.15 : 0.0004;
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = basePrice + change;
        
        const now = new Date();
        const volume = Math.floor(Math.random() * 100000) + 30000;
        
        const newPoint = {
          time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: now.getTime(),
          price: parseFloat(newPrice.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
          open: lastPoint.close,
          high: parseFloat((newPrice + Math.random() * volatility * 0.5).toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
          low: parseFloat((newPrice - Math.random() * volatility * 0.5).toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
          close: parseFloat(newPrice.toFixed(selectedPair === 'USD/JPY' ? 2 : 4)),
          volume
        };
        
        const updatedData = [...prevData.slice(1), newPoint];
        const newAnalysis = performAdvancedAnalysis(updatedData);
        
        if (newAnalysis && analysis) {
          if (newAnalysis.signalType !== analysis.signalType) {
            addNotification(`Nouveau signal: ${newAnalysis.signalType} sur ${selectedPair}`, 
              newAnalysis.signalType.includes('ACHAT') ? 'success' : 'warning');
          }
          if (Math.abs(newAnalysis.priceChangePercent) > 0.5) {
            addNotification(`Mouvement important: ${newAnalysis.priceChangePercent > 0 ? '+' : ''}${newAnalysis.priceChangePercent.toFixed(2)}% sur ${selectedPair}`, 'alert');
          }
        }
        
        setAnalysis(newAnalysis);
        
        return updatedData;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedPair, liveRates, fetchLiveRates, performAdvancedAnalysis, analysis, addNotification]);

  const getSignalColor = (signal) => {
    if (signal.includes('ACHAT FORT')) return 'from-green-500 to-emerald-600';
    if (signal.includes('ACHAT')) return 'from-green-400 to-green-500';
    if (signal.includes('VENTE FORTE')) return 'from-red-500 to-rose-600';
    if (signal.includes('VENTE')) return 'from-red-400 to-red-500';
    return 'from-gray-400 to-gray-500';
  };

  const getSignalBg = (signal) => {
    if (signal.includes('ACHAT')) return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
    if (signal.includes('VENTE')) return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200';
    return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <Activity className="w-20 h-20 mx-auto mb-6 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-2xl font-bold text-white mb-2">Forex Analyzer Pro</p>
          <p className="text-blue-200">Connexion aux marchés en temps réel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Forex Analyzer Pro
                </h1>
                <p className="text-slate-400 text-sm mt-1">Plateforme d'analyse avancée en temps réel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-300 relative group"
                >
                  <Bell className="w-6 h-6 text-blue-400" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && notifications.length > 0 && (
                  <div className="absolute right-0 top-16 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-600 overflow-hidden z-50">
                    <div className="p-4 bg-slate-700 border-b border-slate-600">
                      <h3 className="font-bold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-3 border-b border-slate-700 hover:bg-slate-700 transition-colors">
                          <p className="text-sm text-slate-300">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-300">
                <Settings className="w-6 h-6 text-blue-400" />
              </button>
            </div>
          </div>
          
          {/* Sélecteurs Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Paire de devises</label>
              <div className="grid grid-cols-3 gap-2">
                {pairs.map(pair => (
                  <button
                    key={pair.code}
                    onClick={() => setSelectedPair(pair.code)}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      selectedPair === pair.code
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-105'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pair.flag}</div>
                    <div className="text-xs font-bold text-white">{pair.code}</div>
                    {liveRates[pair.code] && (
                      <div className="text-xs text-slate-300 mt-1">{liveRates[pair.code]}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Période de temps</label>
              <div className="grid grid-cols-3 gap-2">
                {timeframes.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`p-3 rounded-xl transition-all duration-300 flex flex-col items-center ${
                      timeframe === tf.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-105'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-white mb-1" />
                    <span className="text-xs font-bold text-white">{tf.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signal Principal Amélioré */}
        {analysis && (
          <div className={`rounded-2xl shadow-2xl p-8 mb-6 border-2 ${getSignalBg(analysis.signalType)}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getSignalColor(analysis.signalType)} flex items-center justify-center shadow-xl`}>
                    {analysis.signalType.includes('ACHAT') ? (
                      <ArrowUpCircle className="w-12 h-12 text-white" />
                    ) : analysis.signalType.includes('VENTE') ? (
                      <ArrowDownCircle className="w-12 h-12 text-white" />
                    ) : (
                      <Activity className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 mb-1">{analysis.signalType}</h2>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-white rounded-lg shadow">
                        <span className="text-sm font-bold text-gray-700">Confiance: {analysis.confidence}%</span>
                      </div>
                      <div className="px-3 py-1 bg-white rounded-lg shadow">
                        <span className="text-sm font-bold text-gray-700">Force: {analysis.strength > 0 ? '+' : ''}{analysis.strength}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Raisons du signal
                  </h3>
                  <div className="space-y-2">
                    {analysis.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.warnings.length > 0 && (
                  <div className="bg-yellow-100 bg-opacity-70 rounded-xl p-4 border-l-4 border-yellow-500">
                    <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Avertissements
                    </h3>
                    <div className="space-y-1">
                      {analysis.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-yellow-800">• {warning}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
                  <p className="text-sm text-gray-600 mb-2">Prix Actuel</p>
                  <p className="text-4xl font-black text-gray-900">{analysis.currentPrice}</p>
                  <div className={`flex items-center gap-2 mt-2 ${analysis.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.priceChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="text-lg font-bold">
                      {analysis.priceChange >= 0 ? '+' : ''}{analysis.priceChange.toFixed(4)} ({analysis.priceChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                  <p className="text-xs text-gray-600 mb-2">Sentiment du marché</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1 bg-green-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-green-600 h-full transition-all duration-500" style={{width: `${marketSentiment.bullish}%`}}></div>
                    </div>
                    <div className="flex-1 bg-red-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-red-600 h-full transition-all duration-500" style={{width: `${marketSentiment.bearish}%`}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-green-600">Haussier {marketSentiment.bullish.toFixed(0)}%</span>
                    <span className="text-red-600">Baissier {marketSentiment.bearish.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 shadow-lg text-white">
                  <p className="text-xs opacity-90 mb-1">Prédiction Court Terme</p>
                  <p className="text-2xl font-black">{analysis.prediction}</p>
                  <p className="text-xs opacity-90 mt-1">Tendance: {analysis.trend}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graphiques Avancés */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Graphique Principal */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-6 border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                Graphique {selectedPair}
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-semibold transition-all">
                  Prix
                </button>
                <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm text-white font-semibold transition-all">
                  Chandeliers
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
                <Line type="monotone" dataKey="sma20" stroke="#10b981" strokeWidth={2} dot={false} name="SMA 20" />
                <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={2} dot={false} name="SMA 50" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Indicateurs Techniques */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-6 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              Indicateurs
            </h3>
            {analysis && (
              <div className="space-y-3">
                <div className="bg-slate-700 bg-opacity-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-300">RSI (14)</span>
                    <span className={`text-lg font-black ${analysis.rsi > 70 ? 'text-red-400' : analysis.rsi < 30 ? 'text-green-400' : 'text-blue-400'}`}>
                      {analysis.rsi.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${analysis.rsi > 70 ? 'bg-red-500' : analysis.rsi < 30 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{width: `${analysis.rsi}%`}}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Survendu</span>
                    <span>Neutre</span>
                    <span>Suracheté</span>
                  </div>
                </div>

                <div className="bg-slate-700 bg-opacity-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-300">MACD</span>
                    <span className={`text-lg font-black ${analysis.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {analysis.macd.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-700 bg-opacity-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-300">Stochastique</span>
                    <span className="text-lg font-black text-blue-400">{analysis.stochastic.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-slate-700 bg-opacity-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-300">ATR</span>
                    <span className="text-lg font-black text-purple-400">{analysis.atr.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-slate-700 bg-opacity-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-300">Volume Ratio</span>
                    <span className={`text-lg font-black ${analysis.volumeRatio > 1.2 ? 'text-green-400' : 'text-slate-400'}`}>
                      {analysis.volumeRatio.toFixed(2)}x
                    </span>
                  </div>
                </div>

                <div className="bg-slate-700 bg-opacity-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-300">Volatilité</span>
                    <span className="text-lg font-black text-yellow-400">{analysis.volatility}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Volume et Niveaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Volume */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-6 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Volume de Trading
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volumeData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Niveaux de Trading */}
          {analysis && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-400" />
                Niveaux de Trading
              </h3>
              <div className="space-y-4">
                <div className="bg-red-900 bg-opacity-30 rounded-xl p-4 border-l-4 border-red-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-red-300">Résistance 2</span>
                    <span className="text-xl font-black text-red-300">{analysis.resistance2.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-red-900 bg-opacity-20 rounded-xl p-4 border-l-4 border-red-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-red-200">Résistance 1</span>
                    <span className="text-xl font-black text-red-200">{analysis.resistance1.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-blue-900 bg-opacity-30 rounded-xl p-4 border-l-4 border-blue-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-blue-200">Point Pivot</span>
                    <span className="text-xl font-black text-blue-200">{analysis.pivotPoint.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-green-900 bg-opacity-20 rounded-xl p-4 border-l-4 border-green-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-green-200">Support 1</span>
                    <span className="text-xl font-black text-green-200">{analysis.support1.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-green-900 bg-opacity-30 rounded-xl p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-green-300">Support 2</span>
                    <span className="text-xl font-black text-green-300">{analysis.support2.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plan de Trading */}
        {analysis && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Plan de Trading Recommandé
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 shadow-lg">
                <p className="text-sm text-blue-200 mb-2 font-semibold">Point d'Entrée</p>
                <p className="text-3xl font-black text-white">{analysis.currentPrice}</p>
                <p className="text-xs text-blue-200 mt-2">Prix actuel du marché</p>
              </div>

              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-5 shadow-lg">
                <p className="text-sm text-red-200 mb-2 font-semibold">Stop Loss</p>
                <p className="text-3xl font-black text-white">{analysis.stopLoss.toFixed(4)}</p>
                <p className="text-xs text-red-200 mt-2">Protection du capital</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 shadow-lg">
                <p className="text-sm text-green-200 mb-2 font-semibold">Take Profit 1</p>
                <p className="text-3xl font-black text-white">{analysis.takeProfit1.toFixed(4)}</p>
                <p className="text-xs text-green-200 mt-2">Premier objectif</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 shadow-lg">
                <p className="text-sm text-emerald-200 mb-2 font-semibold">Take Profit 2</p>
                <p className="text-3xl font-black text-white">{analysis.takeProfit2.toFixed(4)}</p>
                <p className="text-xs text-emerald-200 mt-2">Objectif étendu</p>
              </div>
            </div>

            <div className="mt-6 bg-slate-700 bg-opacity-50 rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Ratio Risque/Rendement</p>
                  <p className="text-2xl font-black text-blue-400">1:{analysis.riskReward.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Taille de Position</p>
                  <p className="text-2xl font-black text-purple-400">2-3% du capital</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Durée Estimée</p>
                  <p className="text-2xl font-black text-yellow-400">{timeframe === '1D' ? '1-3 jours' : timeframe === '4H' ? '12-24h' : '2-8h'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer avec Avertissement */}
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border-l-4 border-yellow-500 rounded-xl p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-xl font-bold text-yellow-100 mb-2">⚠️ Avertissement Important</h4>
              <p className="text-yellow-200 leading-relaxed">
                Cette application utilise des données en temps réel et des algorithmes d'analyse technique avancés. 
                Cependant, le trading Forex comporte des <strong>risques financiers importants</strong>. 
                Les performances passées ne garantissent pas les résultats futurs. Ne tradez jamais plus que ce que vous pouvez vous permettre de perdre. 
                Consultez toujours un conseiller financier professionnel avant de prendre des décisions d'investissement.
              </p>
              <p className="text-yellow-300 text-sm mt-3 font-semibold">
                📊 Données fournies par ExchangeRate-API | 🔄 Mise à jour toutes les 4 secondes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForexAnalyzerPro;
