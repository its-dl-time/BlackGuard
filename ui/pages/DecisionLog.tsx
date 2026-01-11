import React from 'react';
import { DecisionLogEntry, Language } from '../types';
import { getTexts } from '../utils/i18n';

interface DecisionLogProps {
  logs: DecisionLogEntry[];
  lang: Language;
}

const DecisionLog: React.FC<DecisionLogProps> = ({ logs = [], lang }) => {
  const t = getTexts(lang);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 border-b border-neutral-300 pb-6">
        <h2 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase">{t.log.title}</h2>
        <p className="text-neutral-700 font-medium text-sm">{t.log.subtitle}</p>
      </header>

      {logs.length === 0 ? (
        <div className="border-2 border-neutral-200 border-dashed p-16 text-center bg-neutral-50">
          <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-400 rounded-full">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div>
               <h3 className="text-black font-black text-sm uppercase tracking-wide mb-1">{t.log.empty_title}</h3>
               <p className="text-neutral-500 text-sm font-medium">{t.log.empty_desc}</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="border-l-4 border-neutral-200 ml-4 pl-8 space-y-12">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[43px] top-1 w-6 h-6 bg-white border-4 border-black rounded-full"></div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono font-bold text-neutral-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                    <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded-sm">{t.log.badge_override}</span>
                </div>
                <h3 className="text-2xl font-black text-black tracking-tight">
                  {log.strategy}
                </h3>
                <div className="flex gap-4 text-xs font-bold font-mono text-neutral-600 border-l-2 border-neutral-300 pl-3">
                    <span className="uppercase">{t.log.label_risk}: {log.riskScore}%</span>
                    <span className="uppercase">{t.log.label_assets}: {log.stocks.join(', ')}</span>
                </div>
                <p className="text-neutral-800 text-base font-medium italic mt-2 bg-neutral-100 p-4 border-l-4 border-neutral-400">
                  "{log.explanation}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionLog;