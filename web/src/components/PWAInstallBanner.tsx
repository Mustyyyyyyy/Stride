import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPod|iPad/i.test(navigator.userAgent);
    if (!isMobile) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window as any).navigator.standalone;
    if (isStandalone) return;

    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const openInstallModal = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
    setDismissed(true);
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-slideUp">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-lg shrink-0">
          ⚡
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">Install Stride</h4>
          <p className="text-slate-400 text-xs mt-0.5">Add to home screen for app-like experience with offline mode and GPS tracking.</p>
          <button
            onClick={openInstallModal}
            className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Install Now
          </button>
        </div>
        <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
