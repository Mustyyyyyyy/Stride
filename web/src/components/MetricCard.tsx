import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  progressPercent?: number;
  trend?: string;
  accentColor?: 'emerald' | 'cyan' | 'orange' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  progressPercent,
  trend,
  accentColor = 'emerald',
}) => {
  const colorStyles = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
  }[accentColor];

  const barStyles = {
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  }[accentColor];

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-display tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>}
          </div>
          {trend && <p className="text-xs text-emerald-400 font-medium mt-1">{trend}</p>}
        </div>

        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorStyles} border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>

      {progressPercent !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Daily Goal Progress</span>
            <span className="font-bold text-slate-200">{Math.min(100, Math.round(progressPercent))}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full ${barStyles} transition-all duration-500 shadow-sm`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
