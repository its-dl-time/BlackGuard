import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Risk, Plan, Language } from '../types';
import { getTexts } from '../utils/i18n';

interface RiskProps {
  risk: Risk | null;
  plan: Plan | null;
  lang: Language;
  onCancel: () => void;
}

const RiskPage: React.FC<RiskProps> = ({ risk, plan, lang, onCancel }) => {
  const t = getTexts(lang);

  // EMPTY STATE HANDLING
  if (!risk || !plan) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-neutral-100 border-2 border-neutral-300 rounded-full flex items-center justify-center">
           <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
           </svg>
         </div>
         <div className="space-y-2">
            <h3 className="text-2xl font-black text-black uppercase tracking-tight">
              {lang === 'VI' ? 'CHƯA CÓ DỮ LIỆU' : 'NO ANALYSIS FOUND'}
            </h3>
            <p className="text-neutral-600 font-medium max-w-md mx-auto">
              {lang === 'VI' 
                ? 'Vui lòng quay lại tab Kế Hoạch và chạy phân tích để xem đánh giá rủi ro.' 
                : 'Please configure a strategy in the Plan tab and run the analysis first.'}
            </p>
         </div>
         <Button onClick={onCancel} variant="primary">
           {lang === 'VI' ? 'Tạo Kế Hoạch' : 'Create Plan'}
         </Button>
      </div>
    );
  }

  // Semantic colors
  const getRegimeColor = (score: number) => {
    if (score <= 40) return 'text-emerald-700';
    if (score <= 70) return 'text-yellow-700';
    return 'text-red-700';
  };

  const regimeColor = getRegimeColor(risk.score);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <header className="flex justify-between items-start border-b border-neutral-300 pb-6">
        <div>
          <h2 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase">{t.risk.title}</h2>
          <p className="text-neutral-700 font-medium text-sm">{t.risk.subtitle} {t.strategies[plan.strategyId]}.</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-xs font-black text-neutral-500 uppercase tracking-widest">{t.risk.target_assets}</div>
           <div className="text-sm text-black font-mono font-bold mt-1">
             {plan.stocks.join(' / ')}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Score Card */}
        <Card className="md:col-span-5 flex flex-col items-center justify-center py-12 border border-neutral-300 shadow-sm">
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#e5e5e5"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={691} 
                strokeDashoffset={691 - (691 * risk.score) / 100}
                className={`${regimeColor} transition-all duration-1000 ease-out`}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-7xl font-black text-black tracking-tighter`}>
                {risk.score}
              </span>
              <span className={`text-sm font-black uppercase tracking-widest mt-2 ${regimeColor}`}>
                {risk.regime === 'Stable' ? t.risk.regime.stable : 
                 risk.regime === 'Caution' ? t.risk.regime.caution : 
                 t.risk.regime.critical}
              </span>
            </div>
          </div>
          <div className="w-full px-8">
             <div className="flex justify-between text-xs text-neutral-500 font-bold font-mono mb-2">
               <span>{t.risk.regime.stable}</span>
               <span>{t.risk.regime.caution}</span>
               <span>{t.risk.regime.critical}</span>
             </div>
             <div className="h-3 w-full bg-neutral-100 flex rounded-none border border-neutral-200">
               <div className="w-[40%] bg-emerald-200 border-r border-white"></div>
               <div className="w-[30%] bg-yellow-200 border-r border-white"></div>
               <div className="w-[30%] bg-red-200"></div>
             </div>
          </div>
        </Card>

        {/* Explanation Card */}
        <Card className="md:col-span-7 flex flex-col justify-between" title={t.risk.card_context}>
           <div className="mt-4">
             <p className="text-neutral-900 leading-loose text-lg font-medium pl-6 border-l-4 border-black py-2">
               {risk.explanation}
             </p>
           </div>

           <div className="mt-12 pt-6 border-t border-neutral-200 flex justify-end gap-4">
             <Button variant="secondary" onClick={onCancel}>
               {t.risk.btn_revise}
             </Button>
             <Button 
                variant="primary" 
              >
                {t.risk.btn_execute}
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default RiskPage;