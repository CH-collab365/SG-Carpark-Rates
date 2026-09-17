import React, { useState, useRef, useEffect } from 'react';
import { FilterState, SortOption, Carpark } from '../types';
import {
  LocationTarget,
  POPULAR_LOCATIONS,
  resolveLocationQuery,
  searchLocationAsync,
} from '../utils/geo';

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
  geoAccuracy?: number | null;
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
  geoAccuracy,
  totalResultsCount,
  allCarparks = [],
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [liveGeocodeResults, setLiveGeocodeResults] = useState<LocationTarget[]>([]);
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
    : POPULAR_LOCATIONS.slice(0, 6);

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

  // Live geocode lookup when query has 3+ chars and no exact local match
  useEffect(() => {
    if (!cleanQuery || cleanQuery.length < 3) {
      setLiveGeocodeResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const isKnown = resolveLocationQuery(cleanQuery);
      if (!isKnown) {
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(cleanQuery)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && typeof data.lat === 'number') {
              setLiveGeocodeResults([
                {
                  name: data.name || cleanQuery,
                  category: 'landmark',
                  lat: data.lat,
                  lng: data.lng,
                  keywords: [cleanQuery],
                },
              ]);
            }
          }
        } catch {
          // ignore
        }
      } else {
        setLiveGeocodeResults([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [cleanQuery]);

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

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanQuery) return;
    setIsFocused(false);
    setIsSearchingLocation(true);

    try {
      // 1. Check known local location first
      const matchedLoc = resolveLocationQuery(cleanQuery);
      if (matchedLoc) {
        onSelectLocation(matchedLoc);
        setIsSearchingLocation(false);
        return;
      }

      // 2. Check if query matches a carpark directly
      const matchedCp = allCarparks.find(
        (cp) =>
          cp.name.toLowerCase().includes(cleanQuery) ||
          cp.address.toLowerCase().includes(cleanQuery) ||
          (cp.postalCode && cp.postalCode.includes(cleanQuery))
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
        setIsSearchingLocation(false);
        return;
      }

      // 3. Fallback to async live geocoding (OpenStreetMap / OneMap)
      const geoResult = await searchLocationAsync(cleanQuery);
      if (geoResult) {
        onSelectLocation(geoResult);
      }
    } finally {
      setIsSearchingLocation(false);
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

  // Curated list of major Singapore precincts for 1-tap navigation
  const QUICK_PRECINCTS = [
    { name: 'Marina Bay', keyword: 'mbfc' },
    { name: 'Raffles Place', keyword: 'raffles place' },
    { name: 'Orchard Road', keyword: 'ion orchard' },
    { name: 'Bugis', keyword: 'bugis junction' },
    { name: 'VivoCity', keyword: 'vivocity' },
    { name: 'Jurong East', keyword: 'jurong' },
    { name: 'Tampines', keyword: 'tampines' },
    { name: 'Changi Airport', keyword: 'changi' },
    { name: 'Bishan', keyword: 'bishan' },
  ];

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
                ({totalResultsCount} carpark{totalResultsCount === 1 ? '' : 's'} available)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-lowest text-primary shadow-xs hover:bg-primary hover:text-on-primary transition-colors text-[11px] font-semibold cursor-pointer disabled:opacity-50"
              type="button"
              title="Use browser navigator.geolocation.getCurrentPosition to find carparks nearest to you"
            >
              <span className={`material-symbols-outlined text-[15px] ${isDetectingLocation ? 'animate-spin text-primary' : ''}`}>
                {isDetectingLocation ? 'refresh' : 'my_location'}
              </span>
              <span>{isDetectingLocation ? 'Locating GPS...' : 'Detect My Location'}</span>
              {geoAccuracy && !isDetectingLocation && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                  ±{geoAccuracy}m
                </span>
              )}
            </button>

            <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded shadow-xs">
              <span className="text-secondary text-[11px] font-semibold">Radius:</span>
              <select
                aria-label="Search distance radius"
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="bg-transparent text-on-surface text-[11px] font-semibold outline-none cursor-pointer"
              >
                <option value={1000}>1.0 km</option>
                <option value={2000}>2.0 km</option>
                <option value={3000}>3.0 km (Recommended)</option>
                <option value={5000}>5.0 km (District)</option>
                <option value={10000}>10.0 km (Regional)</option>
                <option value={25000}>Island-wide</option>
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
                placeholder="Search any Singapore location, road, mall, MRT or 6-digit postal code (e.g. Orchard, Jurong, Bugis, Suntec, 238801)..."
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
              disabled={isSearchingLocation}
              className="w-full md:w-auto px-6 py-2.5 bg-primary-container text-on-primary text-[13px] font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              type="submit"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSearchingLocation ? 'animate-spin' : ''}`}>
                {isSearchingLocation ? 'refresh' : 'near_me'}
              </span>
              <span>{isSearchingLocation ? 'Finding Nearest...' : 'Find Nearest Parking'}</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-surface-container bg-surface-container-low/40 flex items-center justify-between text-[11px] text-secondary font-semibold">
                <span>Select a destination to find all nearest carparks &amp; live lots</span>
                <span>Instant GPS distance calculation</span>
              </div>

              <div className="max-h-[340px] overflow-y-auto divide-y divide-surface-container/60">
                {/* 1-Tap Geolocation via navigator.geolocation */}
                <div className="p-1.5 bg-primary/5 border-b border-surface-container/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFocused(false);
                      onDetectLocation();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
                        <span className={`material-symbols-outlined text-[18px] ${isDetectingLocation ? 'animate-spin' : ''}`}>
                          {isDetectingLocation ? 'refresh' : 'my_location'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-on-surface group-hover:text-primary flex items-center gap-1.5">
                          Use My Current Location (GPS)
                          {geoAccuracy && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              ±{geoAccuracy}m
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-secondary">
                          {isDetectingLocation
                            ? 'Detecting device GPS coordinates...'
                            : 'Browser Geolocation API (navigator.geolocation.getCurrentPosition)'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-primary bg-surface-container-lowest px-2.5 py-1 rounded-md border border-primary/30 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      Detect GPS
                    </span>
                  </button>
                </div>

                {/* Live Geocoded Result (if custom query) */}
                {liveGeocodeResults.length > 0 && (
                  <div className="p-1 bg-blue-50/50">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">travel_explore</span>
                      Singapore Address Match
                    </div>
                    {liveGeocodeResults.map((loc) => (
                      <div
                        key={loc.name}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsFocused(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-100/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-blue-600 text-[18px]">
                            pin_drop
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-on-surface">{loc.name}</span>
                            <span className="text-[11px] text-blue-600">
                              Calculates distances to all nearby parking facilities
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                          Find Closest
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Singapore Locations */}
                {matchingLocations.length > 0 && (
                  <div className="p-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                      Singapore Precincts &amp; Destinations
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
                              {loc.postalCode ? `Postal Code ${loc.postalCode}` : 'Singapore'}
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
            Quick Destinations:
          </span>
          {QUICK_PRECINCTS.map((item) => {
            const loc = resolveLocationQuery(item.keyword) || POPULAR_LOCATIONS[0];
            const isCurrent = currentLocationName.toLowerCase().includes(item.name.toLowerCase());
            return (
              <button
                key={item.name}
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
                <span>{item.name}</span>
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
                  ? 'bg-primary-container text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Public Season</span>
            </button>

            {/* >20 lots Available */}
            <button
              onClick={() => onToggleFilter('lotsOver20')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.lotsOver20
                  ? 'bg-emerald-700 text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">local_parking</span>
              <span>&gt;20 Lots Available</span>
            </button>

            {/* Grace Period > 10m */}
            <button
              onClick={() => onToggleFilter('graceOver10')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.graceOver10
                  ? 'bg-amber-700 text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span>Grace &ge;10 mins</span>
            </button>

            {/* Free/Night Cap */}
            <button
              onClick={() => onToggleFilter('freeNightCap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs text-[13px] font-semibold shrink-0 cursor-pointer transition-all ${
                filters.freeNightCap
                  ? 'bg-indigo-700 text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">nightlight</span>
              <span>Flat Night / Free Rate</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-secondary text-[12px] font-semibold">Sort:</span>
            <select
              aria-label="Sort options"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-surface-container-lowest border border-surface-container text-on-surface text-[12px] font-semibold rounded-lg px-2.5 py-1.5 outline-none shadow-xs cursor-pointer hover:border-primary/40"
            >
              <option value="nearest">Distance (Nearest First)</option>
              <option value="cheapest">Cheapest Rate First</option>
              <option value="most_lots">Most Lots Available</option>
              <option value="ev_capacity">Most EV Chargers</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
