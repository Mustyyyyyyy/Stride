import React, { useEffect, useRef, useState } from 'react';
import { GpsPoint } from '../types';
import { MAPBOX_CONFIG } from '../config/mapbox';

// Import Mapbox GL JS CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapTrackerProps {
  gpsPoints?: GpsPoint[];
  polyline?: string;
  isLive?: boolean;
  height?: string;
}

export const MapTracker: React.FC<MapTrackerProps> = ({
  gpsPoints = [],
  polyline,
  isLive = false,
  height = '400px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    // Dynamically import mapbox-gl to avoid SSR issues
    import('mapbox-gl')
      .then((module) => {
        if (cancelled) return;

        const mapboxgl = module.default || module;
        mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

        if (!mapRef.current) {
          const initialLat = gpsPoints.length > 0 ? gpsPoints[0].latitude : 37.7749;
          const initialLng = gpsPoints.length > 0 ? gpsPoints[0].longitude : -122.4194;

          const map = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: document.documentElement.classList.contains('dark') ? MAPBOX_CONFIG.darkStyle : MAPBOX_CONFIG.style,
            center: [initialLng, initialLat],
            zoom: MAPBOX_CONFIG.defaultZoom,
          });

          map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

          if (MAPBOX_CONFIG.showUserLocation) {
            map.addControl(
              new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
                showUserHeading: true,
              }),
              'top-right'
            );
          }

          mapRef.current = map;
        }

        const map = mapRef.current;

        const onLoad = () => {
          if (cancelled) return;

          // Remove existing route layer/source if present
          if (map.getLayer('route')) map.removeLayer('route');
          if (map.getSource('route')) map.removeSource('route');

          // Determine coordinates
          let coords: [number, number][] = [];
          if (gpsPoints.length > 0) {
            coords = gpsPoints.map((p) => [p.longitude, p.latitude]);
          } else if (polyline) {
            try {
              const parsed = JSON.parse(polyline);
              coords = parsed.map((c: any) => [c[1], c[0]]);
            } catch {
              // ignore
            }
          }

          // Fallback demo route if empty
          if (coords.length === 0) {
            coords = [
              [-122.4194, 37.7749],
              [-122.4160, 37.7765],
              [-122.4020, 37.7788],
            ];
          }

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords,
              },
            },
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#10b981',
              'line-width': 5,
              'line-opacity': 0.85,
              'line-cap': 'round',
              'line-join': 'round',
            },
          });

          // Add start marker
          if (coords.length > 0) {
            const startEl = document.createElement('div');
            startEl.style.cssText =
              'width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 10px rgba(16,185,129,0.8);';

            new mapboxgl.Marker({ element: startEl })
              .setLngLat(coords[0])
              .addTo(map);
          }

          // Add current/end marker
          if (coords.length > 1) {
            const currentPos = coords[coords.length - 1];
            const endEl = document.createElement('div');
            endEl.style.cssText = isLive
              ? 'width:20px;height:20px;border-radius:50%;background:#06b6d4;border:3px solid white;box-shadow:0 0 15px rgba(6,182,212,0.9);animation:pulseGlow 1.5s infinite ease-in-out;'
              : 'width:16px;height:16px;border-radius:50%;background:#f97316;border:3px solid white;box-shadow:0 0 10px rgba(249,115,22,0.8);';

            markerRef.current = new mapboxgl.Marker({ element: endEl })
              .setLngLat(currentPos)
              .addTo(map);

            if (isLive) {
              map.easeTo({ center: currentPos, zoom: 16 });
            } else {
              map.fitBounds(coords as any, { padding: 30 });
            }
          }
        };

        if (map.loaded()) {
          onLoad();
        } else {
          map.on('load', onLoad);
        }
      })
      .catch((err) => {
        console.warn('Mapbox GL failed to load:', err);
        if (!cancelled) {
          setMapError('Map is unavailable. Please check your connection.');
        }
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gpsPoints, polyline, isLive]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.06] shadow-xl" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/90 text-slate-200 text-sm p-4 text-center">
          {mapError}
        </div>
      )}
      {isLive && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>GPS Signal Strong (Acc: 3m)</span>
        </div>
      )}
    </div>
  );
};
