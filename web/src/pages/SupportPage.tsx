import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { setActivePage } = useAppStore();

  const supportOptions = [
    {
      icon: <MessageCircle size={20} color="#10b981" />,
      title: 'Chat Support',
      desc: 'Chat with our support team',
      url: 'https://stride-phi-one.vercel.app/support/chat',
    },
    {
      icon: <Mail size={20} color="#06b6d4" />,
      title: 'Email Us',
      desc: 'support@stride.app',
      url: 'mailto:support@stride.app',
    },
    {
      icon: <Phone size={20} color="#f59e0b" />,
      title: 'Call Us',
      desc: '+1 (555) 123-4567',
      url: 'tel:+15551234567',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center">
          <HelpCircle size={32} color="#10b981" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display text-white">Support</h1>
          <p className="text-xs text-slate-400 mt-1">We're here to help</p>
        </div>
      </div>

      <div className="space-y-3">
        {supportOptions.map((option, idx) => (
          <a
            key={idx}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-5 flex items-center gap-4 hover:border-slate-700 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              {option.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{option.title}</h3>
              <p className="text-xs text-slate-400">{option.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">Response time: usually within 24 hours</p>
        <button
          onClick={() => setActivePage('settings')}
          className="mt-4 text-xs text-emerald-400 font-bold hover:text-emerald-300"
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
};
