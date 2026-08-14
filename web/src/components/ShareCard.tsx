import React, { useEffect, useRef } from 'react';

interface ShareCardProps {
  workout: {
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    distance: number;
    duration: number;
    calories: number;
    steps: number;
    gpsPoints?: Array<{ latitude: number; longitude: number }>;
    averagePace: number;
    maxSpeed: number;
  };
  userName?: string;
  width?: number;
  height?: number;
}

const ACTIVITY_META: Record<string, { color: string; label: string }> = {
  RUNNING: { color: '#10b981', label: 'Running' },
  WALKING: { color: '#06b6d4', label: 'Walking' },
  CYCLING: { color: '#f97316', label: 'Cycling' },
  HIKING: { color: '#a855f7', label: 'Hiking' },
};

function buildRoutePath(
  points: Array<{ latitude: number; longitude: number }> = [],
  width: number,
  height: number
): string | null {
  if (!points || points.length < 2) return null;

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat || 0.001;
  const lonRange = maxLon - minLon || 0.001;
  const padding = 20;

  const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - padding * 2);
  const toY = (lat: number) => padding + ((maxLat - lat) / latRange) * (height - padding * 2);

  const step = Math.max(1, Math.floor(points.length / 80));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  return sampled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.longitude)} ${toY(p.latitude)}`).join(' ');
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export const ShareCard: React.FC<ShareCardProps> = ({ workout, userName, width = 900, height = 520 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const meta = ACTIVITY_META[workout.type] || ACTIVITY_META['RUNNING'];
  const startInfo = formatDateTime(workout.startTime);
  const endInfo = formatDateTime(workout.endTime);
  const distKm = (workout.distance / 1000).toFixed(2);
  const pace = workout.distance > 0 && workout.duration > 0 ? ((workout.duration / 60) / (workout.distance / 1000)).toFixed(2) : '0.00';
  const routePath = buildRoutePath(workout.gpsPoints, width, height);
  const gpsPointsCount = workout.gpsPoints?.length || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Logo area
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(28, 28, 40, 40, 12);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 48, 48);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('STRIDE', 80, 42);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Run. Walk. Thrive.', width - 28, 42);

    // Activity header
    ctx.fillStyle = meta.color + '15';
    ctx.strokeStyle = meta.color + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(28, 88, 56, 56, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = meta.color;
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(workout.type === 'RUNNING' ? '🏃' : workout.type === 'WALKING' ? '🚶' : workout.type === 'CYCLING' ? '🚴' : '🥾', 56, 116);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(workout.title || `${meta.label} Workout`, 96, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.fillText(`${startInfo.date} • ${startInfo.time}`, 96, 124);

    // Route map
    if (routePath) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(28, 160, width - 56, 180, 14);
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw route
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const path = new Path2D(routePath);
      ctx.stroke(path);

      // Start marker
      const startX = parseFloat(routePath.split(' ')[1]);
      const startY = parseFloat(routePath.split(' ')[2]);
      ctx.fillStyle = meta.color;
      ctx.beginPath();
      ctx.arc(startX, startY, 6, 0, Math.PI * 2);
      ctx.fill();

      // End marker
      const lastMove = routePath.lastIndexOf('M');
      const endPath = routePath.substring(lastMove);
      const endX = parseFloat(endPath.split(' ')[1]);
      const endY = parseFloat(endPath.split(' ')[2]);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(28, 160, width - 56, 180, 14);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(gpsPointsCount > 0 ? `${gpsPointsCount} GPS points recorded` : 'No route data', width / 2, 250);
    }

    // Metrics
    const metrics = [
      { value: distKm, label: 'km' },
      { value: Math.round(workout.duration / 60), label: 'min' },
      { value: pace, label: 'min/km' },
      { value: Math.round(workout.calories), label: 'kcal' },
      { value: (workout.steps || 0).toLocaleString(), label: 'steps' },
    ];

    const metricWidth = (width - 56 - 40) / metrics.length;
    metrics.forEach((m, i) => {
      const x = 28 + i * metricWidth + metricWidth / 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(m.value), x, 370);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 10px sans-serif';
      ctx.fillText(m.label.toUpperCase(), x, 390);
    });

    // Footer
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(28, 420, width - 56, 1);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(28, 440, 36, 36, 10);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((userName || 'U').charAt(0).toUpperCase(), 46, 458);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(userName || 'Stride User', 76, 450);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('https://stride-phi-one.vercel.app/', width - 28, 458);
  }, [workout, userName, width, height, meta, gpsPointsCount, routePath, startInfo, endInfo, distKm, pace]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `stride-workout-${workout.type.toLowerCase()}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
      if (!blob) return;

      const file = new File([blob], 'stride-workout.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Stride Workout',
          text: `I just completed a ${workout.title || 'workout'}! 🏃`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
        >
          Share Workout
        </button>
        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm hover:border-emerald-500/40 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
};
