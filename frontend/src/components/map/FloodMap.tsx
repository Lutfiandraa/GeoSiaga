'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, LayersControl, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionRisk, HeatmapPoint, ActualEvent } from '@/lib/types';

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface FloodMapProps {
  regions: RegionRisk[];
  rivers?: any;
  buffer?: any;
  heatmap?: HeatmapPoint[];
  actualEvents?: ActualEvent[];
}

const FloodMap = ({ regions, rivers, buffer, heatmap, actualEvents }: FloodMapProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">Loading Map...</div>;

  const getRiskColor = (prob: number) => {
    if (prob >= 0.6) return '#ef4444'; // red-500
    if (prob >= 0.3) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer 
        center={[-6.2088, 106.8456]} 
        zoom={11} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay name="🌊 Sungai / Kanal" checked>
            {rivers && (
              <GeoJSON 
                data={rivers} 
                style={{ color: '#3b82f6', weight: 2.5, opacity: 0.8 }}
                onEachFeature={(feature, layer) => {
                  layer.bindTooltip(`<b>${feature.properties.name}</b><br/>${feature.properties.waterway}`);
                }}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🔵 Buffer Zone" checked>
            {buffer && (
              <GeoJSON 
                data={buffer} 
                style={{ fillColor: '#93c5fd', fillOpacity: 0.2, color: '#3b82f6', weight: 1, dashArray: '5, 10' }}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay name="🚩 Actual Events">
            <LayerGroup>
              {actualEvents?.map((event, idx) => (
                <CircleMarker
                  key={`event-${idx}`}
                  center={[event.latitude, event.longitude]}
                  radius={5}
                  pathOptions={{ color: '#dc2626', fillOpacity: 0.8, weight: 1 }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">Actual Flood Event</p>
                      <p>Region: {event.region_name}</p>
                      <p>Date: {event.date}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="📍 Ensemble Predictions" checked>
            <LayerGroup>
              {regions.map((region) => (
                <CircleMarker
                  key={region.region_name}
                  center={[region.latitude, region.longitude]}
                  radius={15 + region.avg_prob * 20}
                  pathOptions={{ 
                    color: getRiskColor(region.avg_prob), 
                    fillOpacity: 0.6,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <h4 className="font-bold text-base mb-1">{region.region_name}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Risk Level:</span>
                          <span className="font-bold uppercase tracking-wider">{region.risk_level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Avg Prob:</span>
                          <span className="font-bold">{(region.avg_prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Max Prob:</span>
                          <span className="font-bold">{(region.max_prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Flood Days:</span>
                          <span className="font-bold">{region.flood_days} Days</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default FloodMap;
