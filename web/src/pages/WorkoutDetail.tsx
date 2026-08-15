import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapTracker } from '../components/MapTracker';
import { GpxExporter } from '../services/GpxExporter';
import { TelemetryAnalyzer } from '../services/TelemetryAnalyzer';
import { ArrowLeft, Download, Calendar, Timer, Flame, Footprints, Activity, Mountain, Heart, CloudSun, Share2 } from 'lucide-react';

export const WorkoutDetail: React.FC = () => {
  const { activities, selectedWorkoutId, setActivePage, unitSystem } = useAppStore();

  const workout = activities.find((a) => a.id === selectedWorkoutId) || activities[0];

  if (!workout) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm font-medium">Workout not found.</p>
        <button onClick={() => setActivePage('history')} className="mt-4 text-emerald-400 font-bold text-xs">
          Back to History
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm font-medium">No workouts recorded yet.</p>
        <button onClick={() => setActivePage('dashboard')} className="mt-4 text-emerald-400 font-bold text-xs">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const hrZones = TelemetryAnalyzer.calculateHrZones(workout);
  const elevation = TelemetryAnalyzer.calculateElevation(workout);

  const distKm = (workout.distance / 1000).toFixed(2);
  const distMiles = (workout.distance / 1609.34).toFixed(2);
  const displayDist = unitSystem === 'IMPERIAL' ? distMiles : distKm;
  const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';
  const durationMins = Math.floor(workout.duration / 60);

  const elevationBars = useMemo(() => {
    const points = 12;
    const base = elevation.elevationGainMeters / points;
    const maxEl = elevation.maxElevationMeters;
    const bars: number[] = [];
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const variation = Math.sin(progress * Math.PI * 2) * (maxEl * 0.15);
      bars.push(Math.max(10, ((base + variation) / maxEl) * 100));
    }
    return bars;
  }, [elevation]);

  const handleExportGpx = () => {
    GpxExporter.downloadGpxFile(workout);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePage('history')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/[0.06] text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('workout-summary', workout.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            title="View shareable workout summary"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Summary</span>
          </button>

          {/* GPX Track Export Button */}
          <button
            onClick={handleExportGpx}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            title="Download standard .gpx file for Strava or Garmin"
          >
            <Download className="w-4 h-4" />
            <span>Export GPX Track</span>
          </button>
        </div>
      </div>

      {/* Workout Overview Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {workout.type} WORKOUT
            </span>
          </div>
          <h1 className="text-3xl font-black font-display text-white">{workout.title}</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Recorded on {new Date(workout.startTime).toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black font-display text-emerald-400">{displayDist}</span>
          <span className="text-sm font-bold text-slate-400 uppercase">{distUnit}</span>
        </div>
      </div>

      {/* Route Map Replay */}
      <MapTracker polyline={workout.polyline} height="400px" />

      {/* Telemetry Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <Timer className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-semibold block">Total Duration</span>
          <span className="text-2xl font-black font-display text-white">{durationMins} mins</span>
        </div>

        <div className="glass-card p-5 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-semibold block">Calories Burned</span>
          <span className="text-2xl font-black font-display text-orange-400">{workout.calories} kcal</span>
        </div>

        <div className="glass-card p-5 text-center">
          <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-semibold block">Average Pace</span>
          <span className="text-2xl font-black font-display text-white">{workout.averagePace} min/km</span>
        </div>

        <div className="glass-card p-5 text-center">
          <Footprints className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-semibold block">Total Steps</span>
          <span className="text-2xl font-black font-display text-white">{workout.steps.toLocaleString()}</span>
        </div>
      </div>

      {/* Advanced Telemetry: Heart Rate Zones & Elevation Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heart Rate Intensity Zones */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold font-display text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <span>Heart Rate Intensity Zones</span>
            </h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              Avg {hrZones.estimatedAvgHr} bpm
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Zone 4 (Anaerobic / Threshold)</span>
                <span className="font-bold text-rose-400">{hrZones.zone4AnaerobicPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hrZones.zone4AnaerobicPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Zone 3 (Aerobic Cardio)</span>
                <span className="font-bold text-purple-400">{hrZones.zone3AerobicPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${hrZones.zone3AerobicPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Zone 2 (Fat Burn / Endurance)</span>
                <span className="font-bold text-emerald-400">{hrZones.zone2FatBurnPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${hrZones.zone2FatBurnPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Zone 1 (Warmup / Recovery)</span>
                <span className="font-bold text-cyan-400">{hrZones.zone1WarmupPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${hrZones.zone1WarmupPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Elevation Profile Analysis */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold font-display text-white flex items-center gap-2">
              <Mountain className="w-5 h-5 text-cyan-400" />
              <span>Elevation Profile</span>
            </h3>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              +{elevation.elevationGainMeters}m Climb
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Gain</span>
              <span className="text-lg font-black text-white font-display">+{elevation.elevationGainMeters} m</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Peak Alt</span>
              <span className="text-lg font-black text-white font-display">{elevation.maxElevationMeters} m</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Gradient</span>
              <span className="text-lg font-black text-emerald-400 font-display">{elevation.averageGradientPercent}%</span>
            </div>
          </div>

          {/* Elevation Slope Visual Line */}
          <div className="h-24 bg-slate-900/80 rounded-xl p-3 border border-white/[0.04] flex items-end justify-between gap-1">
            {elevationBars.map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
