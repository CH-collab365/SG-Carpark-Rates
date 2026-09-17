import React, { useState } from 'react';
import { FilterState, SortOption } from '../types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters: FilterState;
  onToggleFilter: (key: keyof FilterState) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  radius: number;
  onRadiusChange: (r: number) => void;
  currentLocationName: string;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  totalResultsCount: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onToggleFilter,
  sortOption,
  onSortChange,
  radius,
  onRadiusChange,
  currentLocationName,
  onDetectLocation,
  isDetectingLocation,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="w-full px-4 lg:px-6 py-3 bg-surface-container-low border-b border-surface-container/60">
      <div className="max-w-[1360px] mx-auto flex flex-col gap-3">
        {/* Current Location & Radius Micro-bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="font-bold text-on-surface">Near:</span>
              <span className="text-secondary font-medium truncate max-w-[280px] sm:max-w-[500px]">
                {currentLocationName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-lowest text-primary shadow-xs hover:bg-primary hover:text-on-primary transition-colors text-[11px] font-semibold cursor-pointer disabled:opacity-50"
              type="button"
            >
              <span className={`material-symbols-outlined text-[15px] ${isDetectingLocation ? 'animate-spin' : ''}`}>
                {isDetectingLocation ? 'refresh' : 'my_location'}
              </span>
              <span>{isDetectingLocation ? 'Locating...' : 'Detect My Location'}</span>
            </button>

            <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded shadow-xs">
              <span className="text-secondary text-[11px] font-semibold">Radius:</span>
              <select
                aria-label="Search distance radius"
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="bg-transparent text-on-surface text-[11px] font-semibold outline-none cursor-pointer"
              >
                <option value={500}>500m</option>
                <option value={1000}>1.0 km</option>
                <option value={2000}>2.0 km (Optimal)</option>
                <option value={5000}>5.0 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Search Input Bar */}
        <div
          className={`relative flex flex-col md:flex-row items-center gap-1 bg-surface-container-lowest p-1 rounded-xl shadow-md transition-all ${
            isFocused ? 'ring-2 ring-primary/40 shadow-lg' : ''
          }`}
        >
          <div className="flex items-center flex-1 w-full px-3 gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">search</span>
            <input
              className="w-full py-2 bg-transparent text-[14px] text-on-surface placeholder:text-secondary/70 outline-none"
              placeholder="Search mall, building name, road or 6-digit postal code (e.g. Marina One, Suntec City, 018983)..."
              type="text"
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                aria-label="Clear input"
                onClick={() => onSearchChange('')}
                className="text-secondary hover:text-on-surface p-1 rounded transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>
          <button
            className="w-full md:w-auto px-6 py-2.5 bg-primary-container text-on-primary text-[13px] font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary transition-colors shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
            <span>Find Parking</span>
          </button>
        </div>

        {/* Quick Filter Chips & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full xl:w-auto">
            {/* EV Filter Chip */}
            <button
              onClick={() => onToggleFilter('evCharging')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.evCharging
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[16px] ${filters.evCharging ? 'text-tertiary-fixed' : 'text-tertiary'}`}>
                bolt
              </span>
              <span>EV Charging</span>
              <span className="bg-surface-container-lowest/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight">
                18 bays
              </span>
            </button>

            {/* Season Lots */}
            <button
              onClick={() => onToggleFilter('seasonLots')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.seasonLots
                  ? 'bg-inverse-surface text-inverse-on-surface'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">local_parking</span>
              <span>Season Lots</span>
              <span className="bg-surface-container-lowest/20 px-1.5 py-0.5 rounded-full text-[10px]">
                Commercial &amp; HDB
              </span>
            </button>

            {/* Lots Available > 20 */}
            <button
              onClick={() => onToggleFilter('lotsOver20')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.lotsOver20
                  ? 'bg-emerald-800 text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Lots &gt; 20</span>
            </button>

            {/* Grace Period */}
            <button
              onClick={() => onToggleFilter('graceOver10')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.graceOver10
                  ? 'bg-secondary text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span>Grace &gt; 10 mins</span>
            </button>

            {/* Free Parking / Night Cap */}
            <button
              onClick={() => onToggleFilter('freeNightCap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.freeNightCap
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">dark_mode</span>
              <span>Free / Night Cap</span>
            </button>

            {/* Clearance Height */}
            <button
              onClick={() => onToggleFilter('heightOver2m')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.heightOver2m
                  ? 'bg-on-surface text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">height</span>
              <span>Height &gt; 2.0m</span>
            </button>

            {/* Motorcycle */}
            <button
              onClick={() => onToggleFilter('motorcycle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.motorcycle
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
              <span>Motorcycle</span>
            </button>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5 shrink-0 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-xs ml-auto">
            <span className="material-symbols-outlined text-secondary text-[16px]">sort</span>
            <span className="text-secondary text-[11px] font-semibold">Sort:</span>
            <select
              aria-label="Sort carparks by"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-on-surface text-[13px] font-semibold outline-none cursor-pointer"
            >
              <option value="nearest">Nearest Distance (0.15km)</option>
              <option value="cheapest">Cheapest Hourly Rate</option>
              <option value="most_lots">Most Available Lots</option>
              <option value="ev_capacity">Highest EV Charging Capacity</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
