import React from 'react';
import Card from '../components/Card';
import LanguageToggle from '../components/LanguageToggle';
import { GlobalSettings, Persona, Language } from '../types';
import { getTexts } from '../utils/i18n';

interface SettingsProps {
  settings: GlobalSettings;
  onUpdate: (s: GlobalSettings) => void;
  lang: Language;
}

const SettingsPage: React.FC<SettingsProps> = ({ settings, onUpdate, lang }) => {
  const t = getTexts(lang);
  
  const handlePersonaChange = (persona: Persona) => {
    onUpdate({ ...settings, persona });
  };

  const handleLangChange = (language: Language) => {
    onUpdate({ ...settings, language });
  };

  // Convert dictionary object to array for mapping
  const personaList = Object.entries(t.personas).map(([key, val]) => ({
    id: key as Persona,
    ...val
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 border-b border-neutral-300 pb-6">
        <h2 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase">{t.settings.title}</h2>
        <p className="text-neutral-700 font-medium text-sm">{t.settings.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title={t.settings.card_interface}>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="block text-black font-black tracking-wide text-sm">{t.settings.label_language}</span>
            </div>
            <LanguageToggle currentLang={settings.language} onToggle={handleLangChange} />
          </div>
        </Card>

        <Card title={t.settings.card_persona}>
          <div className="space-y-3">
             {personaList.map(p => (
               <button
                 key={p.id}
                 onClick={() => handlePersonaChange(p.id)}
                 className={`w-full text-left p-5 border-2 transition-all flex justify-between items-center group ${
                   settings.persona === p.id
                     ? 'bg-black border-black shadow-xl'
                     : 'bg-white border-neutral-200 hover:border-black'
                 }`}
               >
                 <div>
                    <span className={`block font-black tracking-widest text-sm mb-1 ${settings.persona === p.id ? 'text-white' : 'text-black'}`}>
                      {p.label.toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium ${settings.persona === p.id ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {p.desc}
                    </span>
                 </div>
                 {settings.persona === p.id && (
                   <div className="w-3 h-3 bg-white rounded-full"></div>
                 )}
               </button>
             ))}
          </div>
        </Card>
      </div>
      
      <div className="pt-8 border-t border-neutral-200 mt-8">
        <div className="text-xs text-neutral-500 font-bold font-mono">
          {t.settings.session}: {crypto.randomUUID().split('-')[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;