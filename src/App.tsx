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

  // Search and filter state matching the reference screen defaults
  const [searchQuery, setSearchQuery] = useState('Marina Bay Financial Centre');
  const [radius, setRadius] = useState<number>(2000);
  const [sortOption, setSortOption] = useState<SortOption>('nearest');
  const [currentLocationName, setCurrentLocationName] = useState(
    'Marina Bay Financial Centre (Tower 2, 10 Marina Blvd, S018983)'
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

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
                cp.name.toLowerCase().includes(lta.Development?.toLowerCase()) ||
                lta.Development?.toLowerCase().includes(cp.name.toLowerCase()) ||
                (cp.id === 'mbfc' && lta.Development?.toLowerCase().includes('marina bay')) ||
                (cp.id === 'marina_one' && lta.Development?.toLowerCase().includes('marina one')) ||
                (cp.id === 'orq' && (lta.Development?.toLowerCase().includes('raffles') || lta.Development?.toLowerCase().includes('quay')))
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
    // Initial fetch
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
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          setCurrentLocationName('Marina Bay Financial Centre (Tower 2, 10 Marina Blvd, S018983)');
        },
        () => {
          setIsDetectingLocation(false);
          setCurrentLocationName('Marina Bay Financial Centre (Tower 2, 10 Marina Blvd, S018983)');
        },
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingLocation(false);
        setCurrentLocationName('Marina Bay Financial Centre (Tower 2, 10 Marina Blvd, S018983)');
      }, 700);
    }
  };

  // Filter and sort carparks
  const filteredAndSortedCarparks = useMemo(() => {
    let result = [...carparks];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (cp) =>
          cp.name.toLowerCase().includes(q) ||
          cp.address.toLowerCase().includes(q) ||
          cp.id.includes(q) ||
          cp.evInfo.provider.toLowerCase().includes(q)
      );
    }

    // Filter by radius (distanceKm <= radius/1000)
    const maxRadiusKm = radius / 1000;
    result = result.filter((cp) => cp.distanceKm <= maxRadiusKm);

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
  }, [carparks, searchQuery, radius, filters, sortOption]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleSelectCarpark = (carpark: Carpark) => {
    setSelectedCarparkId(carpark.id);
    const element = document.getElementById(`carpark-${carpark.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <Header
        onOpenQuickFilters={() => setQuickFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Content Body */}
      <main className="w-full pt-24 bg-surface min-h-[calc(100vh-6rem)] flex-1">
        <div className="flex flex-col w-full">
          {/* Search & Location Bar */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onToggleFilter={handleToggleFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            radius={radius}
            onRadiusChange={setRadius}
            currentLocationName={currentLocationName}
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
            totalResultsCount={filteredAndSortedCarparks.length}
          />

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-[18px] text-on-surface font-bold">
                      Carparks in Downtown Core
                    </h1>
                    <span className="bg-surface-container px-2 py-0.5 rounded text-secondary text-[11px] font-semibold">
                      {filteredAndSortedCarparks.length} results
                    </span>
                  </div>
                  <span className="text-secondary text-[12px]">
                    Showing 1-{Math.min(filteredAndSortedCarparks.length, 4)} of{' '}
                    {filteredAndSortedCarparks.length} nearby
                  </span>
                </div>

                {/* Empty State */}
                {filteredAndSortedCarparks.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-md flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[40px]">
                      local_parking
                    </span>
                    <div className="font-bold text-[16px] text-on-surface">No carparks found</div>
                    <p className="text-[13px] text-secondary max-w-md">
                      No carparks matched your current search and filter combination. Try clearing
                      some filters or extending the search radius.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 px-4 py-2 bg-primary-container hover:bg-primary text-white text-[13px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
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
                  carparks={filteredAndSortedCarparks.length > 0 ? filteredAndSortedCarparks : carparks}
                  selectedCarparkId={selectedCarparkId}
                  onSelectCarpark={handleSelectCarpark}
                  onRecenter={() => setSelectedCarparkId('mbfc')}
                />

                {/* Closest Carparks Comparison Matrix */}
                <ComparisonMatrix
                  carparks={carparks}
                  onSelectCarpark={handleSelectCarpark}
                  selectedCarparkId={selectedCarparkId}
                />

                {/* Season Parking & Grace Rules card */}
                <SeasonParkingRules onOpenGuideModal={() => setGuideModalOpen(true)} />
              </div>
            </div>
          </div>
        </div>
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
      <Footer />
    </div>
  );
}
