import React from 'react';
import { Tab, Language } from '../types';
import { getTexts } from '../utils/i18n';

interface SidebarProps {
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, lang }) => {
  const t = getTexts(lang);
  
  // Map Tab enum to translation keys
  const tabLabels: Record<Tab, string> = {
    [Tab.PLAN]: t.nav.plan,
    [Tab.RISK]: t.nav.risk,
    [Tab.LOG]: t.nav.log,
    [Tab.SETTINGS]: t.nav.settings
  };

  const tabs = Object.values(Tab);

  return (
    <aside className="w-64 bg-white border-r border-neutral-300 flex-col hidden md:flex h-full fixed left-0 top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-8 border-b border-neutral-200">
        <h1 className="text-xl font-black tracking-tighter text-black flex items-center gap-3">
          <div className="w-5 h-5 bg-black rounded-none"></div>
          BLACKGUARD
        </h1>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className={`w-full text-left px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200 border-l-4 ${
              activeTab === tab
                ? 'border-black text-black bg-neutral-100'
                : 'border-transparent text-neutral-600 hover:text-black hover:bg-neutral-50'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-neutral-200">
        <div className="text-xs text-neutral-500 font-mono font-bold">
          SYSTEM_READY
          <br/>
          v1.2.2
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;