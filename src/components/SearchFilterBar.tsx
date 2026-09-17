import React, { useState, useRef, useEffect } from 'react';
import { FilterState, SortOption, Carpark } from '../types';
import { LocationTarget, POPULAR_LOCATIONS, resolveLocationQuery } from '../utils/geo';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectLocation: (loc: LocationTarget) => void;
  onSelectCarpark?: (carpark: Carpark) => void;
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
  allCarparks?: Carpark[];
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectLocation,
  onSelectCarpark,
  filters,
  onToggleFilter,
  sortOption,
  onSortChange,
  radius,
  onRadiusChange,
  currentLocationName,
  onDetectLocation,
  isDetectingLocation,
  totalResultsCount,
  allCarparks = [],
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick suggestions based on search text
  const cleanQuery = searchQuery.trim().toLowerCase();

  const matchingLocations = cleanQuery
    ? POPULAR_LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(cleanQuery) ||
          loc.keywords.some((k) => k.includes(cleanQuery)) ||
          (loc.postalCode && loc.postalCode.includes(cleanQuery))
      ).slice(0, 5)
    : POPULAR_LOCATIONS.slice(0, 5);

  const matchingCarparks = cleanQuery
    ? allCarparks
        .filter(
          (cp) =>
            cp.name.toLowerCase().includes(cleanQuery) ||
            cp.address.toLowerCase().includes(cleanQuery) ||
            (cp.postalCode && cp.postalCode.includes(cleanQuery))
        )
        .slice(0, 4)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    if (!cleanQuery) return;

    // Check if query matches a known location
    const matchedLoc = resolveLocationQuery(cleanQuery);
    if (matchedLoc) {
      onSelectLocation(matchedLoc);
      return;
    }

    // Check if query matches a specific carpark
    const matchedCp = allCarparks.find((cp) =>
      cp.name.toLowerCase().includes(cleanQuery) ||
      cp.address.toLowerCase().includes(cleanQuery)
    );
    if (matchedCp) {
      if (onSelectCarpark) {
        onSelectCarpark(matchedCp);
      }
      onSelectLocation({
        name: matchedCp.name,
        category: 'commercial',
        lat: matchedCp.lat,
        lng: matchedCp.lng,
        postalCode: matchedCp.postalCode,
        keywords: [matchedCp.name.toLowerCase()],
      });
    }
  };

  const getCategoryIcon = (category: LocationTarget['category']) => {
    switch (category) {
      case 'mall':
        return 'shopping_bag';
      case 'mrt':
        return 'subway';
      case 'landmark':
        return 'account_balance';
      default:
        return 'apartment';
    }
  };

  return (
    <section className="w-full px-4 lg:px-6 py-3 bg-surface-container-low border-b border-surface-container/60">
      <div className="max-w-[1360px] mx-auto flex flex-col gap-3" ref={containerRef}>
        {/* Current Location & Radius Micro-bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <div className="flex items-center gap-1.5 text-[12px] flex-wrap">
              <span className="font-bold text-on-surface">Searching Near:</span>
              <span className="text-secondary font-semibold truncate max-w-[280px] sm:max-w-[520px] bg-surface-container-lowest px-2 py-0.5 rounded border border-surface-container">
                {currentLocationName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({totalResultsCount} carpark{totalResultsCount === 1 ? '' : 's'} in radius)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-lowest text-primary shadow-xs hover:bg-primary hover:text-on-primary transition-colors text-[11px] font-semibold cursor-pointer disabled:opacity-50"
              type="button"
              title="Use your device's GPS to find carparks nearest to you"
            >
              <span className={`material-symbols-outlined text-[15px] ${isDetectingLocation ? 'animate-spin' : ''}`}>
                {isDetectingLocation ? 'refresh' : 'my_location'}
              </span>
              <span>{isDetectingLocation ? 'Locating GPS...' : 'Detect My Location'}</span>
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
                <option value={5000}>5.0 km (Broad)</option>
                <option value={10000}>10.0 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Search Input Bar with Autocomplete Dropdown */}
        <div className="relative">
          <form
            onSubmit={handleSearchSubmit}
            className={`relative flex flex-col md:flex-row items-center gap-1 bg-surface-container-lowest p-1 rounded-xl shadow-md transition-all ${
              isFocused ? 'ring-2 ring-primary/50 shadow-lg' : ''
            }`}
          >
            <div className="flex items-center flex-1 w-full px-3 gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">search</span>
              <input
                className="w-full py-2 bg-transparent text-[14px] text-on-surface placeholder:text-secondary/70 outline-none"
                placeholder="Search destination, mall, MRT, building name or 6-digit postal code (e.g. Raffles Place, Suntec, MBS, 018983)..."
                type="text"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
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
              type="submit"
            >
              <span className="material-symbols-outlined text-[18px]">near_me</span>
              <span>Find Nearest Parking</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-surface-container bg-surface-container-low/40 flex items-center justify-between text-[11px] text-secondary font-semibold">
                <span>Suggestions for Singapore Locations &amp; Carparks</span>
                <span>Select to recalculate distance</span>
              </div>

              <div className="max-h-[320px] overflow-y-auto divide-y divide-surface-container/60">
                {/* Popular Singapore Locations */}
                {matchingLocations.length > 0 && (
                  <div className="p-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                      Destination / Landmark Locations
                    </div>
                    {matchingLocations.map((loc) => (
                      <div
                        key={loc.name}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsFocused(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            {getCategoryIcon(loc.category)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-on-surface">{loc.name}</span>
                            <span className="text-[11px] text-secondary">
                              {loc.postalCode ? `Postal Code ${loc.postalCode}` : 'Downtown Core'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-primary-fixed/40 text-on-primary-fixed px-2 py-0.5 rounded font-semibold">
                          Find Nearest
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Carpark Matches */}
                {matchingCarparks.length > 0 && (
                  <div className="p-1 bg-surface-container-low/20">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                      Direct Carpark Facilities
                    </div>
                    {matchingCarparks.map((cp) => (
                      <div
                        key={cp.id}
                        onClick={() => {
                          if (onSelectCarpark) onSelectCarpark(cp);
                          onSelectLocation({
                            name: cp.name,
                            category: 'commercial',
                            lat: cp.lat,
                            lng: cp.lng,
                            postalCode: cp.postalCode,
                            keywords: [cp.name.toLowerCase()],
                          });
                          setIsFocused(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                            local_parking
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-on-surface">{cp.name}</span>
                            <span className="text-[11px] text-secondary">{cp.address}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
                            cp.availableLots > 50
                              ? 'bg-emerald-100 text-emerald-800'
                              : cp.availableLots >= 10
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}>
                            {cp.availableLots} lots
                          </span>
                          <span className="text-[11px] font-semibold text-secondary">
                            {cp.distanceKm} km
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Destination Location Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">explore</span>
            Quick Locations:
          </span>
          {POPULAR_LOCATIONS.slice(0, 7).map((loc) => {
            const isCurrent = currentLocationName.includes(loc.name.split('(')[0].trim());
            return (
              <button
                key={loc.name}
                onClick={() => onSelectLocation(loc)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer transition-all border ${
                  isCurrent
                    ? 'bg-primary text-on-primary border-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container hover:border-primary/40'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {isCurrent ? 'check_circle' : 'location_on'}
                </span>
                <span>{loc.name.split('(')[0].trim()}</span>
              </button>
            );
          })}
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
              <option value="nearest">Nearest Distance First</option>
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
