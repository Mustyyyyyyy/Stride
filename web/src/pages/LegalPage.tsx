import React, { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

type LegalTab = 'privacy' | 'terms' | 'licenses';

export const LegalPage: React.FC = () => {
  const [tab, setTab] = useState<LegalTab>('privacy');

  const tabs: { id: LegalTab; label: string }[] = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'licenses', label: 'Licenses' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.06] mx-auto flex items-center justify-center">
          <FileText size={32} color="#10b981" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display text-white">Legal</h1>
          <p className="text-xs text-slate-400 mt-1">Policies and licenses</p>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/[0.06]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === t.id
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        {tab === 'privacy' && (
          <>
            <h2 className="text-lg font-extrabold font-display text-white">Privacy Policy</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Stride takes your privacy seriously. We only collect data necessary to provide our fitness tracking services.
              Your location data is used solely for workout tracking and is never shared with third parties without your consent.
            </p>
            <a
              href="https://stride-phi-one.vercel.app/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold hover:text-emerald-300"
            >
              Read Full Policy <ExternalLink size={14} />
            </a>
          </>
        )}

        {tab === 'terms' && (
          <>
            <h2 className="text-lg font-extrabold font-display text-white">Terms of Service</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              By using Stride, you agree to these terms. Our services are provided as-is, and we continuously improve
              the app based on user feedback. Please use the app responsibly and follow local regulations when tracking workouts.
            </p>
            <a
              href="https://stride-phi-one.vercel.app/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold hover:text-emerald-300"
            >
              Read Full Terms <ExternalLink size={14} />
            </a>
          </>
        )}

        {tab === 'licenses' && (
          <>
            <h2 className="text-lg font-extrabold font-display text-white">Open Source Licenses</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Stride uses several open source libraries. We are grateful to the community for their contributions.
            </p>
            <div className="space-y-2 mt-4">
              {['React Native', 'Expo', 'Zustand', 'Lucide Icons', 'React Navigation'].map((lib, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/[0.04]">
                  <span className="text-sm font-semibold text-white">{lib}</span>
                  <span className="text-xs text-slate-400">MIT License</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
