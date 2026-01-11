import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plan, StrategyId, VN30_TICKERS, Language } from '../types';
import { getTexts } from '../utils/i18n';

interface PlanProps {
  onAnalyze: (plan: Plan) => void;
  isAnalyzing: boolean;
  lang: Language;
}

const PlanPage: React.FC<PlanProps> = ({ onAnalyze, isAnalyzing, lang }) => {
  const t = getTexts(lang);
  const [formData, setFormData] = useState<Plan>({
    strategyId: StrategyId.BUY_HOLD,
    horizon: 'short',
    orderType: 'buy',
    amount: '',
    commitment: '',
    stocks: []
  });

  const handleChange = (field: keyof Plan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleStock = (ticker: string) => {
    setFormData(prev => {
      const exists = prev.stocks.includes(ticker);
      if (exists) {
        return { ...prev, stocks: prev.stocks.filter(t => t !== ticker) };
      } else {
        return { ...prev, stocks: [...prev.stocks, ticker] };
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="mb-8 border-b border-neutral-300 pb-6">
        <h2 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase">{t.plan.title}</h2>
        <p className="text-neutral-700 font-medium text-sm">{t.plan.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Params */}
        <div className="lg:col-span-2 space-y-8">
          <Card title={t.plan.card_strategy}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">
                    {t.plan.label_strategy}
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.strategyId}
                      onChange={(e) => handleChange('strategyId', e.target.value as StrategyId)}
                      className="w-full bg-white border border-neutral-400 rounded-none p-3 text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors appearance-none font-bold"
                    >
                      {Object.entries(t.strategies).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">
                    {t.plan.label_amount}
                  </label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-neutral-400 rounded-none p-3 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">
                      {t.plan.label_universe}
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-700">
                      {formData.stocks.length} {t.plan.label_selected}
                    </span>
                 </div>
                  
                  {/* Scrollable List Implementation */}
                  <div className="bg-white border border-neutral-400 h-48 overflow-y-auto shadow-inner">
                    <div className="divide-y divide-neutral-200">
                      {VN30_TICKERS.map(ticker => {
                        const isSelected = formData.stocks.includes(ticker);
                        return (
                          <div 
                            key={ticker}
                            onClick={() => toggleStock(ticker)}
                            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-neutral-100 transition-colors ${
                              isSelected ? 'bg-neutral-100' : ''
                            }`}
                          >
                            <span className={`font-mono font-bold ${isSelected ? 'text-black' : 'text-neutral-500'}`}>
                              {ticker}
                            </span>
                            <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-black border-black' : 'border-neutral-300 bg-white'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </div>
            </div>
          </Card>

          <Card title={t.plan.card_horizon}>
            <div className="space-y-6">
               <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-3 cursor-pointer p-5 border-2 transition-all ${
                  formData.horizon === 'short' 
                    ? 'border-black bg-black text-white shadow-xl' 
                    : 'border-neutral-200 text-neutral-600 hover:border-black hover:text-black bg-white'
                }`}>
                  <input 
                    type="radio" 
                    name="horizon" 
                    className="hidden"
                    checked={formData.horizon === 'short'} 
                    onChange={() => handleChange('horizon', 'short')} 
                  />
                  <span className="font-black uppercase tracking-widest text-sm">{t.plan.label_horizon_short}</span>
                </label>
                
                <label className={`flex-1 flex items-center justify-center gap-3 cursor-pointer p-5 border-2 transition-all ${
                  formData.horizon === 'long' 
                    ? 'border-black bg-black text-white shadow-xl' 
                    : 'border-neutral-200 text-neutral-600 hover:border-black hover:text-black bg-white'
                }`}>
                  <input 
                    type="radio" 
                    name="horizon" 
                    className="hidden"
                    checked={formData.horizon === 'long'} 
                    onChange={() => handleChange('horizon', 'long')} 
                  />
                  <span className="font-black uppercase tracking-widest text-sm">{t.plan.label_horizon_long}</span>
                </label>
              </div>

               {formData.horizon === 'long' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">
                    {t.plan.label_commitment}
                  </label>
                  <textarea 
                    value={formData.commitment || ''}
                    onChange={(e) => handleChange('commitment', e.target.value)}
                    placeholder={t.plan.placeholder_commitment}
                    className="w-full bg-white border border-neutral-400 rounded-none p-4 text-black placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[120px] font-medium"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Order Type & Actions */}
        <div className="space-y-8">
          <Card className="h-fit" title={t.plan.card_order}>
            <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-3">
              {t.plan.label_direction}
            </label>
            <div className="grid grid-cols-2 gap-0 border-2 border-neutral-200">
              <button
                onClick={() => handleChange('orderType', 'buy')}
                className={`p-4 font-black text-sm tracking-widest uppercase transition-all ${
                  formData.orderType === 'buy'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-400 hover:text-black'
                }`}
              >
                BUY
              </button>
              <button
                 onClick={() => handleChange('orderType', 'sell')}
                 className={`p-4 font-black text-sm tracking-widest uppercase transition-all border-l-2 border-neutral-200 ${
                  formData.orderType === 'sell'
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-400 hover:text-black'
                }`}
              >
                SELL
              </button>
            </div>
            
            <div className="pt-8 mt-4">
               <Button 
                onClick={() => onAnalyze(formData)}
                isLoading={isAnalyzing}
                disabled={formData.stocks.length === 0 || !formData.amount}
                fullWidth
                variant="primary"
              >
                {t.plan.btn_analyze}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanPage;