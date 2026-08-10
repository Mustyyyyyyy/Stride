import React, { useEffect, useRef } from 'react';
import { GpsPoint } from '../types';

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
  const mapInstanceRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Leaflet if available window.L
    if (typeof window === 'undefined' || !(window as any).L || !mapContainerRef.current) return;
    const L = (window as any).L;

    if (!mapInstanceRef.current) {
      const initialLat = gpsPoints.length > 0 ? gpsPoints[0].latitude : 37.7749;
      const initialLng = gpsPoints.length > 0 ? gpsPoints[0].longitude : -122.4194;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialLat, initialLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Determine coordinates array
    let coords: Array<[number, number]> = [];
    if (gpsPoints.length > 0) {
      coords = gpsPoints.map((p) => [p.latitude, p.longitude]);
    } else if (polyline) {
      try {
        coords = JSON.parse(polyline);
      } catch (e) {}
    }

    // Default fallback coordinates if empty
    if (coords.length === 0) {
      coords = [
        [37.7749, -122.4194],
        [37.7765, -122.4160],
        [37.7788, -122.4020],
      ];
    }

    // Clear existing polyline & markers
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
    }
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current);
    }

    const markerGroup = L.layerGroup().addTo(map);

    // Draw route polyline
    const polylineLayer = L.polyline(coords, {
      color: '#10b981', // Stride emerald green
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    polylineLayerRef.current = polylineLayer;
    markerLayerRef.current = markerGroup;

    // Add Start marker
    if (coords.length > 0) {
      const startIcon = L.divIcon({
        className: 'custom-map-marker-start',
        html: `<div style="background-color:#10b981; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(16,185,129,0.8);"></div>`,
        iconSize: [16, 16],
      });
      L.marker(coords[0], { icon: startIcon }).addTo(markerGroup);
    }

    // Add Current / Finish marker
    if (coords.length > 1) {
      const currentPos = coords[coords.length - 1];
      const endIcon = L.divIcon({
        className: 'custom-map-marker-current',
        html: isLive
          ? `<div style="background-color:#06b6d4; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px rgba(6,182,212,0.9); animation: pulseGlow 1.5s infinite ease-in-out;"></div>`
          : `<div style="background-color:#f97316; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(249,115,22,0.8);"></div>`,
        iconSize: [20, 20],
      });
      L.marker(currentPos, { icon: endIcon }).addTo(markerGroup);

      if (isLive) {
        map.panTo(currentPos);
      } else {
        map.fitBounds(polylineLayer.getBounds(), { padding: [30, 30] });
      }
    }
  }, [gpsPoints, polyline, isLive]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {isLive && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>GPS Signal Strong (Acc: 3m)</span>
        </div>
      )}
    </div>
  );
};
