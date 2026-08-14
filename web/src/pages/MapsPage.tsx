import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, MapPin, ExternalLink, Navigation, Zap, Footprints, Bike, Mountain } from 'lucide-react';

type PlaceCategory = 'all' | 'park' | 'trail' | 'gym' | 'landmark';

const SAVED_ROUTES = [
  {
    id: 'r1',
    title: 'Morning Golden Gate Run',
    type: 'RUNNING',
    distance: 8540,
    date: '2026-08-09',
  },
  {
    id: 'r2',
    title: 'Weekend Century Ride',
    type: 'CYCLING',
    distance: 102500,
    date: '2026-08-08',
  },
  {
    id: 'r3',
    title: 'Muir Woods Trail',
    type: 'HIKING',
    distance: 12500,
    date: '2026-08-07',
  },
];

export const MapsPage: React.FC = () => {
  const { activities } = useAppStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('all');

  const routes = SAVED_ROUTES;

  const categories: { id: PlaceCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'park', label: 'Parks' },
    { id: 'trail', label: 'Trails' },
    { id: 'gym', label: 'Gyms' },
    { id: 'landmark', label: 'Landmarks' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RUNNING': return <Zap size={18} color="#10b981" />;
      case 'WALKING': return <Footprints size={18} color="#06b6d4" />;
      case 'CYCLING': return <Bike size={18} color="#f97316" />;
      case 'HIKING': return <Mountain size={18} color="#a855f7" />;
      default: return <MapPin size={18} color="#64748b" />;
    }
  };

  const handleSearch = (place: string) => {
    const url = `https://www.google.com/maps/search/?api=1&q=${encodeURIComponent(place)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black font-display text-white">Maps</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Discover places and view your running routes</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && query.trim() && handleSearch(query)}
            placeholder="Search places..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <button
          onClick={() => query.trim() && handleSearch(query)}
          className="px-6 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
        >
          Go
        </button>
      </div>

      {/* Map Area */}
      <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-3">
        <MapPin size={32} color="#64748b" />
        <div>
          <p className="text-white font-bold">Map View</p>
          <p className="text-xs text-slate-400">Search places or view saved routes below</p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Saved Routes */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold font-display text-white">Saved Running Routes</h2>
        {routes.map((route) => (
          <div key={route.id} className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              {getActivityIcon(route.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{route.title}</h3>
              <p className="text-xs text-slate-400">{(route.distance / 1000).toFixed(1)} km • {new Date(route.date).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&q=${encodeURIComponent(route.title)}`, '_blank')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
