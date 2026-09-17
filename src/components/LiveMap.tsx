import React, { useState } from 'react';
import { Carpark } from '../types';

interface LiveMapProps {
  carparks: Carpark[];
  selectedCarparkId: string | null;
  onSelectCarpark: (carpark: Carpark) => void;
  onRecenter: () => void;
  userLocationName?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  carparks,
  selectedCarparkId,
  onSelectCarpark,
  onRecenter,
  userLocationName = 'Marina Bay',
}) => {
  const [trafficOn, setTrafficOn] = useState(true);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Find nearest carpark
  const nearestCarpark = carparks.find((cp) => cp.isNearest) || carparks[0];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden relative border border-surface-container/60">
      {/* Map Header & Controls */}
      <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high/60">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">map</span>
          <span className="text-[13px] text-on-surface font-bold">Live Availability Map</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTrafficOn(!trafficOn)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition-colors cursor-pointer ${
              trafficOn
                ? 'bg-primary-container text-white'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
            }`}
            type="button"
          >
            Traffic: {trafficOn ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={onRecenter}
            className="p-1 bg-surface-container-lowest text-on-surface rounded shadow-xs hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Recenter on current location"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">filter_center_focus</span>
          </button>
        </div>
      </div>

      {/* Stylized High-Fidelity SVG Map Simulation */}
      <div className="relative w-full h-[360px] bg-slate-100 overflow-hidden select-none">
        {/* Simulated GIS Map Graphic (Marina Bay Core) */}
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 400">
          {/* Water Body (Marina Reservoir) */}
          <path
            d="M 0,220 C 120,200 240,240 380,210 C 480,190 540,230 600,220 L 600,400 L 0,400 Z"
            fill="#cce5ff"
            opacity="0.6"
          />
          {/* Water reflection texture */}
          <path
            d="M 60,260 Q 200,240 340,270 T 580,250"
            fill="none"
            stroke="#93ccff"
            strokeWidth="1.5"
            opacity="0.5"
            strokeDasharray="10 15"
          />
          <path
            d="M 20,310 Q 180,290 380,330 T 560,300"
            fill="none"
            stroke="#93ccff"
            strokeWidth="1.5"
            opacity="0.5"
            strokeDasharray="8 12"
          />
          {/* Waterfront Promenade Line */}
          <path
            d="M 0,220 C 120,200 240,240 380,210 C 480,190 540,230 600,220"
            fill="none"
            stroke="#93ccff"
            strokeWidth="4"
          />

          {/* Road Networks (Downtown Core) */}
          {/* Marina Boulevard */}
          <path d="M 20,180 Q 250,210 580,180" fill="none" stroke="#cbd5e1" strokeWidth="14" />
          <path d="M 20,180 Q 250,210 580,180" fill="none" stroke="#f8fafc" strokeWidth="8" />

          {/* Central Boulevard */}
          <path d="M 0,110 L 600,100" fill="none" stroke="#cbd5e1" strokeWidth="12" />
          <path d="M 0,110 L 600,100" fill="none" stroke="#f8fafc" strokeWidth="6" />

          {/* Bayfront Avenue */}
          <path d="M 440,0 L 460,400" fill="none" stroke="#cbd5e1" strokeWidth="14" />
          <path d="M 440,0 L 460,400" fill="none" stroke="#f8fafc" strokeWidth="8" />

          {/* Raffles Quay Link */}
          <path d="M 120,0 L 150,240" fill="none" stroke="#cbd5e1" strokeWidth="10" />
          <path d="M 120,0 L 150,240" fill="none" stroke="#f8fafc" strokeWidth="5" />

          {/* Cross streets */}
          <path d="M 260,0 L 260,195" fill="none" stroke="#cbd5e1" strokeWidth="8" />
          <path d="M 260,0 L 260,195" fill="none" stroke="#f8fafc" strokeWidth="4" />

          <path d="M 370,0 L 370,195" fill="none" stroke="#cbd5e1" strokeWidth="8" />
          <path d="M 370,0 L 370,195" fill="none" stroke="#f8fafc" strokeWidth="4" />

          {/* Traffic Overlay flow lines when Traffic is ON */}
          {trafficOn && (
            <g opacity="0.85">
              {/* Marina Blvd Traffic - smooth green with orange patch */}
              <path
                d="M 30,180 Q 200,205 320,200"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 320,200 Q 450,195 570,180"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Central Blvd Traffic - green */}
              <path
                d="M 10,110 L 590,100"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Bayfront Ave - moderate amber */}
              <path
                d="M 442,10 L 458,380"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Raffles Quay - green */}
              <path
                d="M 122,10 L 148,230"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* City Block Footprints */}
          <rect fill="#e2e8f0" height="60" opacity="0.7" rx="4" width="110" x="160" y="30" />
          <rect fill="#e2e8f0" height="65" opacity="0.7" rx="4" width="130" x="290" y="25" />
          <rect fill="#e2e8f0" height="40" opacity="0.7" rx="4" width="115" x="180" y="130" />
          <rect fill="#e2e8f0" height="45" opacity="0.7" rx="4" width="115" x="310" y="125" />
          <rect fill="#e2e8f0" height="120" opacity="0.7" rx="4" width="65" x="40" y="40" />

          {/* Labels for landmarks */}
          <text x="440" y="300" fill="#005c8d" fontSize="9" fontWeight="600" opacity="0.8">
            Marina Reservoir
          </text>
          <text x="185" y="155" fill="#64748b" fontSize="8" fontWeight="600">
            MBFC Tower 1-3
          </text>
          <text x="320" y="152" fill="#64748b" fontSize="8" fontWeight="600">
            Marina One
          </text>
          <text x="175" y="65" fill="#64748b" fontSize="8" fontWeight="600">
            Raffles Quay
          </text>
        </svg>

        {/* Map Pin Overlay Layer */}
        {/* Pin: User / Search Location Beacon */}
        {nearestCarpark && (
          <div
            style={{
              top: `${Math.max(15, Math.min(85, (nearestCarpark.mapCoords.y / 400) * 100 - 7))}%`,
              left: `${Math.max(15, Math.min(85, (nearestCarpark.mapCoords.x / 600) * 100 - 7))}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30 transition-all duration-500"
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-md"></span>
            </span>
            <span className="bg-slate-900/90 text-white text-[9px] px-1.5 py-0.5 rounded shadow mt-0.5 whitespace-nowrap font-bold flex items-center gap-1 border border-slate-700">
              <span className="material-symbols-outlined text-[10px] text-blue-400">my_location</span>
              <span>Near: {userLocationName.split('(')[0].trim()}</span>
            </span>
          </div>
        )}

        {/* Dynamic Map Pins for Carparks */}
        {carparks.map((carpark) => {
          const isSelected = carpark.id === selectedCarparkId;
          const isHovered = carpark.id === hoveredPinId;
          const isGreen = carpark.availableLots > 50;
          const isAmber = carpark.availableLots >= 10 && carpark.availableLots <= 50;
          const bgClass = isGreen
            ? 'bg-emerald-700'
            : isAmber
            ? 'bg-amber-600'
            : 'bg-red-600';

          return (
            <div
              key={carpark.id}
              style={{
                top: `${(carpark.mapCoords.y / 400) * 100}%`,
                left: `${(carpark.mapCoords.x / 600) * 100}%`,
              }}
              onMouseEnter={() => setHoveredPinId(carpark.id)}
              onMouseLeave={() => setHoveredPinId(null)}
              onClick={() => onSelectCarpark(carpark)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 transition-transform ${
                isSelected || isHovered ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              <div
                className={`flex items-center gap-1 ${bgClass} text-white px-2 py-0.5 rounded-full shadow-lg border-2 ${
                  isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-white'
                }`}
              >
                {carpark.evInfo.hasEV && (
                  <span className="material-symbols-outlined text-[13px] text-tertiary-fixed">
                    bolt
                  </span>
                )}
                <span className="text-xs font-bold font-mono">{carpark.availableLots}</span>
              </div>

              {/* Tooltip Card on Hover or Select */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-inverse-surface text-inverse-on-surface text-[11px] p-2 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-bold text-white">{carpark.name}</div>
                  <div className="text-[10px] text-slate-300">
                    {carpark.availableLots} lots available • {carpark.distanceKm}km
                  </div>
                  {carpark.evInfo.hasEV && (
                    <div className="text-[10px] text-cyan-300 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">bolt</span>
                      {carpark.evInfo.portsCount} EV charging ports
                    </div>
                  )}
                  {carpark.schedules[0] && (
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      {carpark.schedules[0].rate} {carpark.schedules[0].rateUnit}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Map Legend Card */}
        <div className="absolute bottom-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md p-2 rounded-lg shadow-md text-[11px] flex flex-col gap-1 z-10 border border-slate-200">
          <div className="flex items-center gap-1.5 text-on-surface font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
            <span>&gt; 50 Lots</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
            <span>10 - 50 Lots</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>
            <span>&lt; 10 Lots</span>
          </div>
          <div className="flex items-center gap-1.5 text-tertiary font-semibold pt-0.5">
            <span className="material-symbols-outlined text-[13px]">bolt</span>
            <span>EV Charging</span>
          </div>
        </div>
      </div>
    </div>
  );
};
