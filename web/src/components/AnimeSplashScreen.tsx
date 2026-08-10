import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, Activity, Flame, ShieldCheck } from 'lucide-react';

interface AnimeSplashScreenProps {
  onComplete: () => void;
}

export const AnimeSplashScreen: React.FC<AnimeSplashScreenProps> = ({ onComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(5);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden font-sans selection:bg-emerald-500">
      {/* Background Animated Neon Grid & Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950 pointer-events-none" />
      
      {/* Anime Speed Lines Effect */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-b from-transparent via-emerald-400 to-transparent w-[2px] h-full animate-pulse"
            style={{
              left: `${(i + 1) * 8}%`,
              animationDuration: `${0.6 + (i % 4) * 0.3}s`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Top Header branding */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="Stride Logo"
            className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40 animate-pulse"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white font-display">STRIDE</span>
              <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                ANIME EDITION
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">GPS Fitness & Sprint Engine</p>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-emerald-400 text-xs font-semibold transition-all hover:bg-slate-800"
        >
          <span>Skip ({secondsLeft}s)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Center Animated Anime Running Character Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-6 max-w-md w-full text-center">
        {/* Dynamic Running Anime Runner Silhouette SVG Graphic */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          {/* Outer glowing aura ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-500/20 to-cyan-500/30 blur-2xl animate-pulse" />

          {/* Concentric speed circles */}
          <div className="absolute inset-2 border-2 border-dashed border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-6 border border-cyan-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />

          {/* SVG Animated Running Character */}
          <svg className="w-44 h-44 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" viewBox="0 0 100 100" fill="none">
            {/* Motion Lines Behind Runner */}
            <path d="M10 40 H35 M5 50 H30 M15 60 H40" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />

            {/* Anime Runner Figure */}
            {/* Head */}
            <circle cx="62" cy="22" r="7" fill="url(#runnerGrad)" />
            {/* Headband / Hair Flash */}
            <path d="M68 20 L78 17 M68 23 L76 25" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />

            {/* Torso */}
            <path d="M58 29 L48 48" stroke="url(#runnerGrad)" strokeWidth="6" strokeLinecap="round" />

            {/* Arms - Running Pose */}
            <path d="M55 33 L72 38 L80 32" stroke="url(#runnerGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M53 35 L38 42 L28 38" stroke="url(#runnerGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Legs - Dynamic Running Stride */}
            <path d="M48 48 L65 62 L78 78" stroke="url(#runnerGrad)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M48 48 L32 60 L20 54" stroke="url(#runnerGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Ground Sparks */}
            <circle cx="78" cy="79" r="2" fill="#10b981" />
            <circle cx="83" cy="82" r="1.5" fill="#06b6d4" />
            <circle cx="20" cy="55" r="1.5" fill="#f97316" />

            <defs>
              <linearGradient id="runnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Anime Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white uppercase flex items-center justify-center gap-2">
            <span>READY TO STRIDE</span>
            <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400 animate-bounce" />
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
            GPS Telemetry • Cadence Tracker • Elevation Engine
          </p>
        </div>

        {/* Live Metrics Ticker Bar */}
        <div className="flex items-center justify-center gap-4 py-2 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>158 BPM</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>420 KCAL</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GPS LOCKED</span>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 w-full max-w-md space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>Launching Dashboard...</span>
          <span className="text-emerald-400">{secondsLeft}s remaining</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 ease-linear shadow-lg shadow-emerald-500/50"
            style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
