import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LayoutDashboard, History, Bell, Share2, Settings } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);

  const tabs: { id: 'dashboard' | 'feed' | 'history' | 'notifications' | 'settings'; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={22} /> },
    { id: 'feed', label: 'Feed', icon: <Share2 size={22} /> },
    { id: 'history', label: 'History', icon: <History size={22} /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} /> },
  ];

  const handleTabChange = (tabId: 'dashboard' | 'feed' | 'history' | 'notifications' | 'settings') => {
    setActivePage(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {tabs.map((tab) => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
