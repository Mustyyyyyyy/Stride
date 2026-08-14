import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Zap, Footprints, Bike, Mountain, Trophy, Flame, ChevronRight } from 'lucide-react';

type OnboardingStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const STEPS: OnboardingStep[] = [
  {
    title: 'Track Your Workouts',
    description: 'Record running, walking, cycling, and hiking with GPS precision. View pace, distance, and elevation in real time.',
    icon: <Footprints size={36} color="#06b6d4" />,
    color: '#06b6d4',
  },
  {
    title: 'Earn Achievements',
    description: 'Unlock badges, complete weekly challenges, and compete with friends to stay motivated.',
    icon: <Trophy size={36} color="#f59e0b" />,
    color: '#f59e0b',
  },
  {
    title: 'Build Streaks',
    description: 'Maintain daily activity streaks and watch your fitness consistency grow over time.',
    icon: <Flame size={36} color="#f97316" />,
    color: '#f97316',
  },
  {
    title: 'Start Moving',
    description: 'Your personalized fitness dashboard is ready. Let\'s hit the road and crush your goals.',
    icon: <Zap size={36} color="#10b981" />,
    color: '#10b981',
  },
];

export const OnboardingScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/80 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fadeIn">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-black/40">
            {STEPS[step].icon}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black font-display text-white">{STEPS[step].title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
              {STEPS[step].description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight size={18} color="#090d16" />}
            </button>

            {!isLast && (
              <button
                onClick={onFinish}
                className="w-full py-3 rounded-xl text-slate-400 font-semibold text-sm hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
