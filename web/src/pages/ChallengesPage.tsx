import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Users, Flame, Target, CheckCircle2, Lock, Zap, Crown, Sun, Clock } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number;
  userProgress: number;
  completed: boolean;
  reward: string;
  icon: string;
  color: string;
}

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await fetch('/api/challenges', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('stride_access_token')}`,
        },
      }).then((res) => res.json());
      setChallenges(Array.isArray(data) ? data : []);
    } catch {
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((ch) => {
    if (filter === 'active') return !ch.completed;
    if (filter === 'completed') return ch.completed;
    return true;
  });

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalParticipants = challenges.reduce((acc, c) => acc + c.participants, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Weekly Challenges</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Compete with the community and earn exclusive rewards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">{completedCount}/{challenges.length} Completed</span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">{formatNumber(totalParticipants)} Competing</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 text-sm">Loading challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.06] mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No active challenges</h3>
            <p className="text-xs text-slate-400 mt-1">Complete your first workout to unlock weekly challenges.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/[0.06] w-fit">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChallenges.map((ch) => {
              const progressPercent = Math.min(100, Math.round((ch.userProgress / ch.targetValue) * 100));

              return (
                <div
                  key={ch.id}
                  className={`glass-card p-5 space-y-3 relative overflow-hidden ${
                    ch.completed ? 'border-emerald-500/40' : ''
                  }`}
                >
                  {ch.completed && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-white/[0.06] flex items-center justify-center text-2xl shadow-lg">
                      {ch.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-base text-white font-display">{ch.title}</h3>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{ch.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{formatNumber(ch.participants)} participants</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{ch.reward}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">
                        {ch.userProgress.toLocaleString()} / {ch.targetValue.toLocaleString()} {ch.unit}
                      </span>
                      <span className={`font-bold ${ch.completed ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900/80 overflow-hidden border border-white/[0.04]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ch.completed ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 font-medium">
                      Ends {new Date(ch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {ch.completed ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Completed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
