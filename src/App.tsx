import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CARPARKS } from './data/carparks';
import { Carpark, FilterState, SortOption } from './types';
import { Header } from './components/Header';
import { SearchFilterBar } from './components/SearchFilterBar';
import { LiveTicker } from './components/LiveTicker';
import { CarparkCard } from './components/CarparkCard';
import { LiveMap } from './components/LiveMap';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { SeasonParkingRules } from './components/SeasonParkingRules';
import { ScheduleModal } from './components/ScheduleModal';
import { DirectionsModal } from './components/DirectionsModal';
import { GuideModal } from './components/GuideModal';
import { QuickFiltersModal } from './components/QuickFiltersModal';
import { Footer } from './components/Footer';
import { TalkToUsTab } from './components/TalkToUsTab';
import {
  calculateDistanceKm,
  resolveLocationQuery,
  reverseGeocodeApprox,
  reverseGeocodeAsync,
  isInSingapore,
  LocationTarget,
} from './utils/geo';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [selectedCarparkId, setSelectedCarparkId] = useState<string>('mbfc');
  const [savedCarparkIds, setSavedCarparkIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sgcarmart_saved_carparks');
      return stored ? JSON.parse(stored) : ['mbfc'];
    } catch {
      return ['mbfc'];
    }
  });

  // Reference GPS coordinates for distance calculation (defaults to MBFC / Marina Bay Core)
  const [searchCoords, setSearchCoords] = useState<{ lat: number; lng: number }>({
    lat: 1.2801,
    lng: 103.8536,
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState<number>(2000);
  const [sortOption, setSortOption] = useState<SortOption>('nearest');
  const [currentLocationName, setCurrentLocationName] = useState(
    'Marina Bay Financial Centre (Tower 2, 10 Marina Blvd, S018983)'
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
  const [geoNotice, setGeoNotice] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  // Navigation tab state ('carparks' | 'talk-to-us')
  const [activeTab, setActiveTab] = useState<'carparks' | 'talk-to-us'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#talk-to-us') {
      return 'talk-to-us';
    }
    return 'carparks';
  });

  // Keep hash in sync with active tab
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#talk-to-us') {
        setActiveTab('talk-to-us');
      } else if (!window.location.hash || window.location.hash === '#carparks') {
        setActiveTab('carparks');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: 'carparks' | 'talk-to-us') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'talk-to-us') {
        window.location.hash = '#talk-to-us';
      } else {
        if (window.location.hash === '#talk-to-us') {
          history.pushState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
  };

  // Filters (EV Charging is pre-selected in the reference design)
  const [filters, setFilters] = useState<FilterState>({
    evCharging: true,
    seasonLots: false,
    lotsOver20: false,
    graceOver10: false,
    freeNightCap: false,
    heightOver2m: false,
    motorcycle: false,
  });

  // Modals state
  const [scheduleModalCarpark, setScheduleModalCarpark] = useState<Carpark | null>(null);
  const [directionsModalCarpark, setDirectionsModalCarpark] = useState<Carpark | null>(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);

  // Auto-refresh timer for live telemetry
  const [countdown, setCountdown] = useState(42);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLtaLive, setIsLtaLive] = useState<boolean | null>(null);

  const triggerLiveSync = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/carparks');
      if (res.ok) {
        const data = await res.json();
        if (data.configured && Array.isArray(data.value) && data.value.length > 0) {
          setIsLtaLive(true);
          // Match returned live LTA records to our carparks
          setCarparks((prev) =>
            prev.map((cp) => {
              const matched = data.value.find((lta: any) =>
                (cp.carParkId && lta.CarParkID?.toLowerCase() === cp.carParkId.toLowerCase()) ||
                cp.name.toLowerCase().includes(lta.Development?.toLowerCase()) ||
                lta.Development?.toLowerCase().includes(cp.name.toLowerCase()) ||
                (cp.id === 'mbfc' && lta.Development?.toLowerCase().includes('marina bay')) ||
                (cp.id === 'marina-one' && lta.Development?.toLowerCase().includes('marina one')) ||
                (cp.id === 'one-raffles-quay' && (lta.Development?.toLowerCase().includes('raffles') || lta.Development?.toLowerCase().includes('quay'))) ||
                (cp.id === 'suntec-city' && lta.Development?.toLowerCase().includes('suntec')) ||
                (cp.id === 'marina-square' && lta.Development?.toLowerCase().includes('marina square'))
              );
              if (matched && typeof matched.AvailableLots === 'number') {
                return {
                  ...cp,
                  availableLots: matched.AvailableLots,
                  lastUpdatedMins: 0,
                };
              }
              return cp;
            })
          );
          setIsRefreshing(false);
          return;
        } else {
          setIsLtaLive(false);
        }
      } else {
        setIsLtaLive(false);
      }
    } catch {
      setIsLtaLive(false);
    }

    // Graceful fallback: slight live fluctuation so the UI stays reactive
    setTimeout(() => {
      setCarparks((prev) =>
        prev.map((cp) => {
          const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          const newLots = Math.max(0, cp.availableLots + delta);
          return {
            ...cp,
            availableLots: newLots,
            lastUpdatedMins: 1,
          };
        })
      );
      setIsRefreshing(false);
    }, 400);
  };

  // Countdown effect
  useEffect(() => {
    triggerLiveSync();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerLiveSync();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setCountdown(45);
    triggerLiveSync();
  };

  const handleToggleSave = (id: string) => {
    setSavedCarparkIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sgcarmart_saved_carparks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetFilters = () => {
    setFilters({
      evCharging: false,
      seasonLots: false,
      lotsOver20: false,
      graceOver10: false,
      freeNightCap: false,
      heightOver2m: false,
      motorcycle: false,
    });
    setSearchQuery('');
    setRadius(5000);
  };

  // Location search and selection handler
  const handleSelectLocation = (loc: LocationTarget) => {
    setSearchCoords({ lat: loc.lat, lng: loc.lng });
    setCurrentLocationName(loc.name);
    setSearchQuery('');
    setSortOption('nearest');
    // Ensure radius allows discovering facilities in this area
    setRadius((prev) => (prev < 3000 ? 3000 : prev));
  };

  // GPS Geolocation detector using browser's built-in navigator.geolocation.getCurrentPosition
  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoNotice({
        type: 'warning',
        message: 'Geolocation is not supported by your browser.',
        details: 'You can search for any Singapore destination, mall, or 6-digit postal code above.',
      });
      return;
    }

    setIsDetectingLocation(true);
    setGeoNotice({
      type: 'info',
      message: 'Requesting GPS position from your device...',
      details: 'Connecting to browser Geolocation API (navigator.geolocation.getCurrentPosition)',
    });

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingLocation(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
        setGeoAccuracy(accuracy);

        const inSg = isInSingapore(lat, lng);

        if (inSg) {
          setSearchCoords({ lat, lng });
          setSearchQuery('');
          setSortOption('nearest');
          setRadius((prev) => (prev < 3000 ? 3000 : prev));

          // Asynchronously reverse geocode for detailed address
          const rev = await reverseGeocodeAsync(lat, lng);
          const resolvedName = rev.name || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setCurrentLocationName(resolvedName);

          setGeoNotice({
            type: 'success',
            message: `GPS location acquired${accuracy ? ` (accuracy: ±${accuracy}m)` : ''}`,
            details: resolvedName,
          });
        } else {
          // GPS is outside Singapore (e.g. cloud container, VPN, or testing)
          setGeoNotice({
            type: 'warning',
            message: `GPS position detected at ${lat.toFixed(4)}, ${lng.toFixed(4)} (outside Singapore territory).`,
            details:
              'Centered search on Marina Bay CBD to show real-time Singapore carpark rates and available lots.',
          });
          setSearchCoords({ lat: 1.2801, lng: 103.8536 });
          setCurrentLocationName('Marina Bay Financial Centre (Tower 2, 10 Marina Blvd, S018983)');
          setSortOption('nearest');
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        let errorMsg = 'Unable to acquire your GPS location.';
        let detailMsg = 'Showing Singapore Central (Marina Bay) by default.';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location permission was denied in your browser.';
            detailMsg = 'Please allow location permission in your browser address bar, or use the search bar above.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is currently unavailable.';
            detailMsg = 'Please verify your network connection or device location settings.';
            break;
          case err.TIMEOUT:
            errorMsg = 'GPS location request timed out.';
            detailMsg = 'Click "Detect My Location" to try again, or choose a quick precinct below.';
            break;
        }

        setGeoNotice({
          type: 'warning',
          message: errorMsg,
          details: detailMsg,
        });

        setSearchCoords((prev) => prev || { lat: 1.2801, lng: 103.8536 });
      },
      geoOptions
    );
  };

  // Check if browser has already granted geolocation permission
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            handleDetectLocation();
          }
        })
        .catch(() => {
          // Ignore
        });
    }
  }, []);

  // Auto-dismiss success notification after 7 seconds
  useEffect(() => {
    if (geoNotice?.type === 'success') {
      const timer = setTimeout(() => {
        setGeoNotice(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [geoNotice]);

  // Compute live distances for all carparks based on current search coordinates
  const carparksWithDynamicDistance = useMemo(() => {
    return carparks.map((cp) => {
      const dist = calculateDistanceKm(searchCoords.lat, searchCoords.lng, cp.lat, cp.lng);
      return {
        ...cp,
        distanceKm: dist,
      };
    });
  }, [carparks, searchCoords]);

  // Identify absolute nearest carpark to current location
  const sortedByProximity = useMemo(() => {
    return [...carparksWithDynamicDistance].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [carparksWithDynamicDistance]);

  const nearestCarparkId = sortedByProximity[0]?.id;

  // Mark isNearest dynamically
  const evaluatedCarparks = useMemo(() => {
    return carparksWithDynamicDistance.map((cp) => ({
      ...cp,
      isNearest: cp.id === nearestCarparkId,
    }));
  }, [carparksWithDynamicDistance, nearestCarparkId]);

  // Filter and sort carparks
  const filteredAndSortedCarparks = useMemo(() => {
    let result = [...evaluatedCarparks];

    // Filter by search query (if user typed specific carpark name, address, road, or postal code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const isLocation = resolveLocationQuery(q);
      if (!isLocation) {
        result = result.filter(
          (cp) =>
            cp.name.toLowerCase().includes(q) ||
            cp.address.toLowerCase().includes(q) ||
            cp.id.includes(q) ||
            (cp.postalCode && cp.postalCode.includes(q)) ||
            cp.evInfo.provider.toLowerCase().includes(q)
        );
      }
    }

    // Filter by radius (distanceKm <= radius / 1000)
    const maxRadiusKm = radius / 1000;
    let inRadius = result.filter((cp) => cp.distanceKm <= maxRadiusKm);

    // Safeguard: If the selected radius is tighter than any available carpark,
    // show the top closest facilities so the user always gets their nearest carparks and details
    if (inRadius.length === 0 && result.length > 0) {
      inRadius = [...result].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 6);
    }
    result = inRadius;

    // Apply Quick Filter Chips
    if (filters.evCharging) {
      result = result.filter((cp) => cp.evInfo.hasEV);
    }
    if (filters.seasonLots) {
      result = result.filter((cp) => cp.seasonInfo.type !== 'tenant');
    }
    if (filters.lotsOver20) {
      result = result.filter((cp) => cp.availableLots > 20);
    }
    if (filters.graceOver10) {
      result = result.filter((cp) => cp.gracePeriodMins > 10);
    }
    if (filters.freeNightCap) {
      result = result.filter((cp) =>
        cp.schedules.some((s) => s.rate.includes('FREE') || s.rateUnit?.includes('entry'))
      );
    }
    if (filters.heightOver2m) {
      result = result.filter(
        (cp) => cp.maxHeight.includes('No Limit') || parseFloat(cp.maxHeight) >= 2.0
      );
    }

    // Sort
    if (sortOption === 'nearest') {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortOption === 'cheapest') {
      result.sort((a, b) => {
        const getRate = (cp: Carpark) => {
          const first = cp.schedules[0]?.rate.replace('$', '') || '999';
          return parseFloat(first);
        };
        return getRate(a) - getRate(b);
      });
    } else if (sortOption === 'most_lots') {
      result.sort((a, b) => b.availableLots - a.availableLots);
    } else if (sortOption === 'ev_capacity') {
      result.sort((a, b) => b.evInfo.portsCount - a.evInfo.portsCount);
    }

    return result;
  }, [evaluatedCarparks, searchQuery, radius, filters, sortOption]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleSelectCarpark = (carpark: Carpark) => {
    setSelectedCarparkId(carpark.id);
    const element = document.getElementById(`carpark-${carpark.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Automatically select nearest carpark when location changes
  useEffect(() => {
    if (filteredAndSortedCarparks.length > 0) {
      setSelectedCarparkId(filteredAndSortedCarparks[0].id);
    }
  }, [searchCoords]);

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <Header
        onOpenQuickFilters={() => setQuickFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Body */}
      <main className="w-full pt-24 bg-surface min-h-[calc(100vh-6rem)] flex-1">
        {activeTab === 'talk-to-us' ? (
          <TalkToUsTab onBackToCarparks={() => handleSelectTab('carparks')} />
        ) : (
          <div className="flex flex-col w-full">
          {/* Search & Location Bar */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectLocation={handleSelectLocation}
            onSelectCarpark={handleSelectCarpark}
            filters={filters}
            onToggleFilter={handleToggleFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            radius={radius}
            onRadiusChange={setRadius}
            currentLocationName={currentLocationName}
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
            geoAccuracy={geoAccuracy}
            totalResultsCount={filteredAndSortedCarparks.length}
            allCarparks={evaluatedCarparks}
          />

          {/* Geolocation Status / Permission Banner */}
          {geoNotice && (
            <div className="w-full max-w-[1360px] mx-auto px-4 lg:px-6 pt-2 transition-all">
              <div
                className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg border text-[12px] shadow-xs ${
                  geoNotice.type === 'success'
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : geoNotice.type === 'info'
                    ? 'bg-blue-50/90 border-blue-300 text-blue-950'
                    : 'bg-amber-50/90 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[17px] shrink-0 ${
                      geoNotice.type === 'success'
                        ? 'text-emerald-700'
                        : geoNotice.type === 'info'
                        ? 'text-blue-700 animate-spin'
                        : 'text-amber-700'
                    }`}
                  >
                    {geoNotice.type === 'success'
                      ? 'check_circle'
                      : geoNotice.type === 'info'
                      ? 'refresh'
                      : 'location_off'}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 truncate">
                    <span className="font-bold">{geoNotice.message}</span>
                    {geoNotice.details && (
                      <span className="opacity-85 text-[11px] truncate">{geoNotice.details}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {geoNotice.type === 'warning' && (
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="px-2 py-0.5 rounded bg-white font-semibold text-[11px] text-amber-900 shadow-xs hover:bg-amber-100 transition-colors border border-amber-300 cursor-pointer"
                    >
                      Retry GPS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setGeoNotice(null)}
                    className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    aria-label="Dismiss notification"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Telemetry Ticker Strip */}
          <LiveTicker
            countdown={countdown}
            onRefreshNow={handleManualRefresh}
            isRefreshing={isRefreshing}
            isLtaLive={isLtaLive}
          />

          {/* Main 60/40 Split View */}
          <div className="w-full max-w-[1360px] mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* LEFT COLUMN: CARPARK LIST (approx. 58-60%) */}
              <div className="w-full lg:w-[58%] flex flex-col gap-4">
                {/* List Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-[18px] text-on-surface font-bold">
                      Carparks Nearest to {currentLocationName.split('(')[0].trim()}
                    </h1>
                    <span className="bg-surface-container px-2 py-0.5 rounded text-secondary text-[11px] font-semibold">
                      {filteredAndSortedCarparks.length} available
                    </span>
                  </div>
                  <span className="text-secondary text-[12px] font-medium">
                    Sorted by {sortOption === 'nearest' ? 'Proximity (Nearest first)' : sortOption}
                  </span>
                </div>

                {/* Nearest Carpark Highlight Banner */}
                {filteredAndSortedCarparks.length > 0 && filteredAndSortedCarparks[0] && (
                  <div className="bg-primary-container/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </span>
                      <div className="flex flex-col">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Recommended Nearest Carpark
                        </div>
                        <div className="text-[14px] font-bold text-on-surface">
                          {filteredAndSortedCarparks[0].name}
                        </div>
                        <div className="text-[11px] text-secondary">
                          Just {filteredAndSortedCarparks[0].distanceKm} km away •{' '}
                          <span className="font-bold text-emerald-700">
                            {filteredAndSortedCarparks[0].availableLots} lots available
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectCarpark(filteredAndSortedCarparks[0])}
                      className="px-3 py-1.5 bg-primary text-on-primary text-[12px] font-bold rounded-lg hover:bg-primary-container hover:text-white transition-colors shrink-0 shadow-xs cursor-pointer"
                      type="button"
                    >
                      View Details
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {filteredAndSortedCarparks.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-md flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[40px]">
                      local_parking
                    </span>
                    <div className="font-bold text-[16px] text-on-surface">No carparks found within {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}</div>
                    <p className="text-[13px] text-secondary max-w-md">
                      No carparks matched your current radius or filter criteria near {currentLocationName}. Try increasing the search radius or resetting your filters.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setRadius(5000)}
                        className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        Expand Radius to 5km
                      </button>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-1.5 bg-primary-container hover:bg-primary text-white text-[12px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredAndSortedCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      isSelected={cp.id === selectedCarparkId}
                      isSaved={savedCarparkIds.includes(cp.id)}
                      onSelect={handleSelectCarpark}
                      onToggleSave={handleToggleSave}
                      onOpenScheduleModal={(carpark) => setScheduleModalCarpark(carpark)}
                      onOpenDirections={(carpark) => setDirectionsModalCarpark(carpark)}
                    />
                  ))
                )}
              </div>

              {/* RIGHT COLUMN: INTERACTIVE MAP & COMPARISON MATRIX (approx. 40-42%) */}
              <div className="w-full lg:w-[42%] flex flex-col gap-4 lg:sticky lg:top-28">
                {/* Live Availability Map */}
                <LiveMap
                  carparks={filteredAndSortedCarparks.length > 0 ? filteredAndSortedCarparks : evaluatedCarparks}
                  selectedCarparkId={selectedCarparkId}
                  onSelectCarpark={handleSelectCarpark}
                  onRecenter={() => {
                    if (filteredAndSortedCarparks.length > 0) {
                      setSelectedCarparkId(filteredAndSortedCarparks[0].id);
                    }
                  }}
                  userLocationName={currentLocationName}
                />

                {/* Closest Carparks Comparison Matrix */}
                <ComparisonMatrix
                  carparks={filteredAndSortedCarparks.length > 0 ? filteredAndSortedCarparks : evaluatedCarparks}
                  onSelectCarpark={handleSelectCarpark}
                  selectedCarparkId={selectedCarparkId}
                />

                {/* Season Parking & Grace Rules card */}
                <SeasonParkingRules onOpenGuideModal={() => setGuideModalOpen(true)} />
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      {/* Modals */}
      <ScheduleModal
        carpark={scheduleModalCarpark}
        onClose={() => setScheduleModalCarpark(null)}
      />

      <DirectionsModal
        carpark={directionsModalCarpark}
        onClose={() => setDirectionsModalCarpark(null)}
      />

      <GuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      <QuickFiltersModal
        isOpen={quickFiltersOpen}
        onClose={() => setQuickFiltersOpen(false)}
        filters={filters}
        onToggleFilter={handleToggleFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Footer */}
      <Footer onOpenTalkToUs={() => handleSelectTab('talk-to-us')} />
    </div>
  );
}
