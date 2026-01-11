import React from 'react';
import Sidebar from './Sidebar';
import { Tab, Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  lang: Language;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, lang }) => {
  return (
    <div className="min-h-screen text-neutral-900 flex bg-transparent font-sans selection:bg-black selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onNavigate={onNavigate} lang={lang} />

      {/* Mobile Header - White bg */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur border-b border-neutral-200 z-50 px-4 h-16 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tighter text-black">BLACKGUARD</span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
           {Object.values(Tab).map(tab => (
             <button 
                key={tab}
                onClick={() => onNavigate(tab)}
                className={`text-xs px-2 py-1 rounded border ${
                  activeTab === tab 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-neutral-500 border-neutral-200'
                }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 pt-20 md:pt-12 overflow-y-auto h-screen relative z-10">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;