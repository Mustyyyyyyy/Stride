import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Target, Trophy, Plus, CheckCircle2, Lock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoalsAchievements: React.FC = () => {
  const { goals, achievements, addGoal } = useAppStore();
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalType, setGoalType] = useState<any>('DAILY_STEPS');
  const [targetVal, setTargetVal] = useState<number>(10000);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({ type: goalType, targetValue: targetVal });
    setShowAddGoalModal(false);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Goals & Achievements</h1>
          <p className="text-xs text-slate-400 font-medium">Set targets and earn milestone badges as you train</p>
        </div>
        <button
          onClick={() => setShowAddGoalModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Fitness Goals Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <span>Active Fitness Goals</span>
          <span className="text-xs text-slate-400 font-normal ml-1">({goals.length})</span>
        </h2>

        {goals.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <Target className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No goals yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Set your first fitness goal to start tracking your progress. Goals are automatically updated as you complete activities.
              </p>
            </div>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Set Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const percent = Math.min(100, Math.round((g.currentProgress / g.targetValue) * 100));
              return (
                <div key={g.id} className="glass-card p-5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{g.type.replace(/_/g, ' ')}</span>
                      <div className="text-xl font-extrabold text-white font-display mt-0.5">
                        {g.currentProgress.toLocaleString()} / <span className="text-emerald-400">{g.targetValue.toLocaleString()}</span>
                      </div>
                    </div>
                    {g.completed ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{percent}%</span>
                    )}
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievements Badges Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <h2 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Achievements</span>
          {achievements.length > 0 && (
            <span className="text-xs text-slate-400 font-normal ml-1">({unlockedCount} / {achievements.length} unlocked)</span>
          )}
        </h2>

        {achievements.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-400 opacity-60" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No badges yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Complete your first activity to start earning achievement badges. Badges are awarded automatically based on milestones you hit.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { icon: '👟', label: 'First Walk' },
                { icon: '🏃', label: 'Road Runner' },
                { icon: '🚴', label: 'Pedal Power' },
                { icon: '🔥', label: 'Week Warrior' },
                { icon: '🥇', label: 'Century Club' },
                { icon: '🏆', label: 'Marathoner' },
              ].map((preview) => (
                <div key={preview.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800 opacity-40 grayscale">
                  <span className="text-xl">{preview.icon}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{preview.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`glass-card p-5 text-center space-y-2 relative transition-all ${
                  ach.unlocked
                    ? 'border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 hover:scale-[1.03]'
                    : 'opacity-50 grayscale hover:grayscale-0'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-3xl shadow-lg">
                  {ach.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white font-display">{ach.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{ach.description}</p>
                </div>
                {ach.unlocked ? (
                  <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Unlocked
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full space-y-4 border-slate-700">
            <h3 className="text-xl font-extrabold font-display text-white">Set New Fitness Goal</h3>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Goal Metric</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="DAILY_STEPS">Daily Steps</option>
                  <option value="DAILY_DISTANCE">Daily Distance (meters)</option>
                  <option value="WEEKLY_DISTANCE">Weekly Distance (meters)</option>
                  <option value="MONTHLY_DISTANCE">Monthly Distance (meters)</option>
                  <option value="CALORIES">Calories Burned (kcal)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Value</label>
                <input
                  type="number"
                  value={targetVal}
                  onChange={(e) => setTargetVal(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddGoalModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
