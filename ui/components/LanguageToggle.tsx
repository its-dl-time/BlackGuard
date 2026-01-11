import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang = 'EN', onToggle }) => {
  return (
    <div className="flex items-center border border-neutral-800 w-fit">
      {(['EN', 'VI'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => onToggle && onToggle(lang)}
          className={`px-4 py-2 text-xs font-bold transition-all ${
            currentLang === lang
              ? 'bg-white text-black'
              : 'bg-black text-neutral-500 hover:text-white'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;