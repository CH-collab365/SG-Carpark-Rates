import React from 'react';
import { FilterState } from '../types';

interface QuickFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onToggleFilter: (key: keyof FilterState) => void;
  onResetFilters: () => void;
}

export const QuickFiltersModal: React.FC<QuickFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onToggleFilter,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full border border-surface-container overflow-hidden">
        <div className="p-4 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <h3 className="text-[17px] font-bold text-on-surface">Quick Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-[12px] text-secondary">
            Select amenities, vehicle clearance, and parking rate preferences for Singapore Downtown Core.
          </p>

          <div className="flex flex-col gap-2.5">
            {/* EV Charging */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-tertiary text-[20px]">bolt</span>
                <div>
                  <div className="text-[13px] font-bold text-on-surface">EV Charging Bays</div>
                  <div className="text-[11px] text-secondary">Show buildings with active AC/DC charging</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.evCharging}
                onChange={() => onToggleFilter('evCharging')}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Lots Available > 20 */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">check_circle</span>
                <div>
                  <div className="text-[13px] font-bold text-on-surface">High Lot Availability (&gt; 20 lots)</div>
                  <div className="text-[11px] text-secondary">Filter out carparks with low lot supply</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.lotsOver20}
                onChange={() => onToggleFilter('lotsOver20')}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Season Parking */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_parking</span>
                <div>
                  <div className="text-[13px] font-bold text-on-surface">Season Parking Available</div>
                  <div className="text-[11px] text-secondary">Commercial &amp; HDB Group C passes</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.seasonLots}
                onChange={() => onToggleFilter('seasonLots')}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Grace > 10 mins */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
                <div>
                  <div className="text-[13px] font-bold text-on-surface">Extended Grace (&gt; 10 mins)</div>
                  <div className="text-[11px] text-secondary">12 to 15 minute drop-off allowance</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.graceOver10}
                onChange={() => onToggleFilter('graceOver10')}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Free / Night Cap */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">dark_mode</span>
                <div>
                  <div className="text-[13px] font-bold text-on-surface">Free Parking or Night Cap</div>
                  <div className="text-[11px] text-secondary">Evening flat fee or Sunday free parking</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.freeNightCap}
                onChange={() => onToggleFilter('freeNightCap')}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Height Clearance > 2.0m */}
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">height</span>
                <div>
                  <div className="text-[13px] font-bold text-on-surface">Height Clearance &gt; 2.0m</div>
                  <div className="text-[11px] text-secondary">For SUVs, vans, and commercial vehicles</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={filters.heightOver2m}
                onChange={() => onToggleFilter('heightOver2m')}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 border-t border-surface-container flex items-center justify-between">
          <button
            onClick={onResetFilters}
            className="text-[12px] text-secondary hover:text-primary font-semibold transition-colors cursor-pointer"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-primary-container hover:bg-primary text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
