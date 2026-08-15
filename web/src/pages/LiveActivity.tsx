import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ActivityType } from '../types';
import { MapTracker } from '../components/MapTracker';
import { TelemetryAnalyzer } from '../services/TelemetryAnalyzer';
import { Pause, Play, Square, Activity, Gauge, Navigation, Timer, Volume2, Heart, Footprints, Bike, Mountain } from 'lucide-react';

export const LiveActivity: React.FC = () => {
  const {
    isTracking,
    isPaused,
    selectedActivityType,
    setActivityType,
    elapsedSeconds,
    distanceMeters,
    currentSpeedMs,
    averagePaceMinKm,
    caloriesBurned,
    stepsCount,
    gpsPoints,
    startTracking,
    pauseTracking,
    resumeTracking,
    tickTracking,
    finishTracking,
    pushNotification,
    unitSystem,
  } = useAppStore();

  const hrZones = TelemetryAnalyzer.calculateHrZones({ type: selectedActivityType } as any);
  const primaryZone = hrZones.zone3AerobicPercent > hrZones.zone4AnaerobicPercent ? 'Zone 3 (Aerobic)' : 'Zone 4 (Anaerobic)';
  const targetLow = Math.round(hrZones.estimatedAvgHr * 0.85);
  const targetHigh = hrZones.estimatedAvgHr;

  const [audioCueActive, setAudioCueActive] = useState(false);
  const lastMilestoneKm = useRef(0);

  // Notify on workout start
  useEffect(() => {
    if (isTracking && !isPaused) {
      lastMilestoneKm.current = 0;
      pushNotification({
        type: 'activity',
        title: `${selectedActivityType.charAt(0) + selectedActivityType.slice(1).toLowerCase()} Started 🏁`,
        message: 'GPS locked — your workout is now being recorded. Stay hydrated!',
        icon: selectedActivityType === 'RUNNING' ? '🏃' : selectedActivityType === 'WALKING' ? '🚶' : selectedActivityType === 'CYCLING' ? '🚴' : '🥾',
        actionPage: 'live-activity',
      });
    }
  }, [isTracking]); // only when tracking state changes to true

  // km milestone notifications
  useEffect(() => {
    if (!isTracking || isPaused) return;
    const distKm = Math.floor(distanceMeters / 1000);
    if (distKm > 0 && distKm > lastMilestoneKm.current) {
      lastMilestoneKm.current = distKm;
      pushNotification({
        type: 'activity',
        title: `${distKm} km Milestone! 🎯`,
        message: `Great work! You've covered ${distKm} km. Keep pushing — you've got this!`,
        icon: '🏅',
        actionPage: 'live-activity',
      });
    }
  }, [distanceMeters, isTracking, isPaused]);

  // 1-second tick to advance elapsed time
  useEffect(() => {
    if (!isTracking || isPaused) return;
    const interval = setInterval(() => { tickTracking(); }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, isPaused, tickTracking]);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const distKm = parseFloat((distanceMeters / 1000).toFixed(2));
  const distMiles = (distanceMeters / 1609.34).toFixed(2);
  const displayDist = unitSystem === 'IMPERIAL' ? distMiles : distKm;
  const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';

  const speedKmh = (currentSpeedMs * 3.6).toFixed(1);

  const handleVoiceAnnouncement = () => {
    setAudioCueActive(true);
    const announcementText = TelemetryAnalyzer.generateVoiceAnnouncement(distKm, averagePaceMinKm, elapsedSeconds);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(announcementText);
      utterance.rate = 1.0;
      utterance.onend = () => setAudioCueActive(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setAudioCueActive(false), 2500);
    }
  };

  const handleStartSpecificActivity = (type: ActivityType) => {
    setActivityType(type);
    startTracking();
  };

  if (!isTracking) {
    const activityOptions: Array<{ type: ActivityType; label: string; description: string; icon: React.ReactNode; color: string }> = [
      {
        type: 'RUNNING',
        label: 'Record Run',
        description: 'Track pace, stride cadence, GPS distance & calories',
        icon: <Activity className="w-7 h-7 text-emerald-400" />,
        color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 hover:border-emerald-400',
      },
      {
        type: 'WALKING',
        label: 'Record Walk',
        description: 'Pedometer step count, distance & recovery tracking',
        icon: <Footprints className="w-7 h-7 text-cyan-400" />,
        color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 hover:border-cyan-400',
      },
      {
        type: 'CYCLING',
        label: 'Record Cycling',
        description: 'High-speed GPS velocity & route elevation analysis',
        icon: <Bike className="w-7 h-7 text-amber-400" />,
        color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 hover:border-amber-400',
      },
      {
        type: 'HIKING',
        label: 'Record Hike',
        description: 'Trail elevation gain, topography & endurance meter',
        icon: <Mountain className="w-7 h-7 text-purple-400" />,
        color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 hover:border-purple-400',
      },
    ];

    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto my-4">
        {/* Title Header */}
        <div className="glass-card p-6 md:p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Activity className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-3xl font-black font-display text-white">Record Activity</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Select your activity type below to launch live GPS tracking with noise-filtered position accuracy, live pace splits, and telemetry recording.
          </p>
        </div>

        {/* Activity Choice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activityOptions.map((act) => (
            <button
              key={act.type}
              onClick={() => handleStartSpecificActivity(act.type)}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all group ${act.color}`}
            >
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/[0.06] shadow-md group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black font-display text-white group-hover:text-emerald-400 transition-colors">
                    {act.label}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-emerald-400 border border-emerald-500/30">
                    START
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {act.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Live Map Display */}
      <div className="relative">
        <MapTracker gpsPoints={gpsPoints} isLive={true} height="420px" />

        {/* Floating Live Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/[0.06] text-xs font-bold text-white shadow-xl">
          <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
          <span>{isPaused ? 'PAUSED' : `RECORDING ${selectedActivityType}`}</span>
        </div>

        {gpsPoints.length > 0 && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-xl">
            <span>GPS Points: {gpsPoints.length}</span>
          </div>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Elapsed Time</span>
          </div>
          <span className="text-3xl font-black font-display text-white tracking-tight">{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="glass-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Distance</span>
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black font-display text-white tracking-tight">{displayDist}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">{distUnit}</span>
          </div>
        </div>

        <div className="glass-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>Speed</span>
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black font-display text-white tracking-tight">{speedKmh}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">km/h</span>
          </div>
        </div>

        <div className="glass-card p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Avg Pace</span>
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black font-display text-white tracking-tight">
              {averagePaceMinKm > 0 ? averagePaceMinKm : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase">min/km</span>
          </div>
        </div>
      </div>

      {/* Voice Audio Announcement & HR Meter Bar */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Heart Rate {primaryZone}</span>
            <span className="text-xs text-slate-400">Target Range: {targetLow} - {targetHigh} bpm</span>
          </div>
        </div>

        <button
          onClick={handleVoiceAnnouncement}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${
            audioCueActive
              ? 'bg-emerald-500 text-slate-950 border-emerald-500'
               : 'bg-slate-900 text-emerald-400 border-white/[0.06] hover:border-emerald-500/40'
          }`}
        >
          <Volume2 className={`w-4 h-4 ${audioCueActive ? 'animate-bounce' : ''}`} />
          <span>{audioCueActive ? 'Speaking Audio Cue...' : 'Announce Audio Split'}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="glass-card p-6 flex items-center justify-center gap-4">
        {isPaused ? (
          <button
            onClick={resumeTracking}
            className="flex-1 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME WORKOUT</span>
          </button>
        ) : (
          <button
            onClick={pauseTracking}
            className="flex-1 py-4 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
          >
            <Pause className="w-5 h-5 fill-slate-950" />
            <span>PAUSE WORKOUT</span>
          </button>
        )}

          <button
          onClick={async () => {
            const workout = await finishTracking();
            const km = (workout.distance / 1000).toFixed(2);
            const mins = Math.floor(workout.duration / 60);
            pushNotification({
              type: 'activity',
              title: 'Workout Saved! 🎉',
              message: `${workout.title} — ${km} km in ${mins} min, ${workout.calories} kcal burned. Amazing effort!`,
              icon: '✅',
              actionPage: 'workout-summary',
            });
          }}
          className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 hover:scale-[1.02] transition-transform"
        >
          <Square className="w-5 h-5 fill-white" />
          <span>FINISH & SAVE</span>
        </button>
      </div>
    </div>
  );
};
