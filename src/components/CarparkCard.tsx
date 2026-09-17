import React from 'react';
import { Carpark } from '../types';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (carpark: Carpark) => void;
  onToggleSave: (id: string) => void;
  onOpenScheduleModal: (carpark: Carpark) => void;
  onOpenDirections: (carpark: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isSaved,
  onSelect,
  onToggleSave,
  onOpenScheduleModal,
  onOpenDirections,
}) => {
  // Determine lot status badge styling
  const renderLotsBadge = () => {
    if (carpark.availableLots > 50) {
      return (
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full shadow-xs border border-emerald-200/50">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-[15px] font-bold">{carpark.availableLots} Lots</span>
          </div>
          <span className="text-[10px] text-secondary font-medium mt-1">
            Updated {carpark.lastUpdatedMins} min ago
          </span>
        </div>
      );
    }

    if (carpark.availableLots >= 10) {
      return (
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1 rounded-full shadow-xs border border-amber-200/50">
            <span className="h-2 w-2 rounded-full bg-amber-600"></span>
            <span className="text-[15px] font-bold">{carpark.availableLots} Lots Left</span>
          </div>
          <span className="text-[10px] text-amber-800 font-medium mt-1">Filling fast</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end shrink-0">
        <div className="flex items-center gap-1.5 bg-red-50 text-red-900 px-3 py-1 rounded-full shadow-xs border border-red-200/50">
          <span className="h-2 w-2 rounded-full bg-red-600"></span>
          <span className="text-[15px] font-bold">{carpark.availableLots} Lots Left</span>
        </div>
        <span className="text-[10px] text-error font-medium mt-1">Almost full</span>
      </div>
    );
  };

  return (
    <article
      id={`carpark-${carpark.id}`}
      onClick={() => onSelect(carpark)}
      className={`bg-surface-container-lowest rounded-xl shadow-md p-4 lg:p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-primary shadow-xl bg-surface-container-lowest' : ''
      }`}
    >
      {/* Featured / Nearest Accent Strip */}
      {carpark.isNearest && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>}

      {/* Top Row: Title, Distance & Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            {carpark.isNearest && (
              <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[11px] rounded uppercase font-bold tracking-wider">
                Nearest
              </span>
            )}
            {carpark.tag && (
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] rounded font-bold">
                {carpark.tag}
              </span>
            )}
            <h2 className="text-[18px] text-on-surface font-bold leading-snug">{carpark.name}</h2>
          </div>

          <p className="text-[12px] text-secondary flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
              pin_drop
            </span>
            <span>{carpark.address}</span>
            <span>•</span>
            <span className="font-bold text-on-surface">{carpark.distanceKm} km away</span>
          </p>
        </div>

        {renderLotsBadge()}
      </div>

      {/* Amenities Strip: EV + Season Parking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2.5 bg-surface-container-low rounded-lg">
        <div className="flex items-start gap-2">
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
              carpark.evInfo.hasEV ? 'text-tertiary' : 'text-secondary'
            }`}
          >
            {carpark.evInfo.hasEV ? 'electric_bolt' : 'power_off'}
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface font-bold">{carpark.evInfo.provider}</span>
            <span className="text-[12px] text-secondary">{carpark.evInfo.description}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
            {carpark.seasonInfo.type === 'tenant' ? 'badge' : carpark.seasonInfo.type === 'ura' ? 'verified' : 'local_parking'}
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface font-bold">{carpark.seasonInfo.pricePerMonth}</span>
            <span className="text-[12px] text-secondary">{carpark.seasonInfo.description}</span>
          </div>
        </div>
      </div>

      {/* Structured High-Density Rates Table */}
      <div className="rounded-lg overflow-hidden bg-surface-container-lowest border border-surface-container/60">
        <div className="grid grid-cols-3 bg-surface-container p-2 text-secondary text-[11px] font-semibold">
          <span>{carpark.id === 'mbfc' ? 'TIMING SCHEDULE' : 'SCHEDULE'}</span>
          <span className="text-center">{carpark.id === 'mbfc' ? 'PARKING RATE' : 'RATE'}</span>
          <span className="text-right">
            {carpark.id === 'mbfc' ? 'REMARKS' : carpark.id === 'the-promontory' ? 'PERK' : carpark.id === 'one-raffles-quay' ? 'ACCESS' : 'EVENING / WEEKEND'}
          </span>
        </div>

        {carpark.schedules.map((schedule, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-3 p-2 text-[14px] items-center transition-colors ${
              idx % 2 === 1 ? 'bg-surface-container-low/40' : ''
            } hover:bg-surface-container-low`}
          >
            <div className="flex flex-col">
              <span
                className={`font-semibold ${
                  schedule.highlightColor === 'green' ? 'text-emerald-800' : 'text-on-surface'
                }`}
              >
                {schedule.timing}
              </span>
              {schedule.subTiming && (
                <span className="text-[12px] text-secondary">{schedule.subTiming}</span>
              )}
            </div>

            <div
              className={`text-center text-[15px] ${
                schedule.highlightColor === 'green'
                  ? 'text-emerald-800 font-bold'
                  : schedule.highlightColor === 'red'
                  ? 'text-error font-bold'
                  : 'text-on-surface font-semibold'
              }`}
            >
              {schedule.rate}{' '}
              {schedule.rateUnit && (
                <span className="text-[12px] text-secondary font-normal">{schedule.rateUnit}</span>
              )}
            </div>

            <div
              className={`text-right text-[12px] ${
                schedule.highlightColor === 'red'
                  ? 'text-error font-semibold'
                  : schedule.highlightColor === 'green' && carpark.id === 'the-promontory'
                  ? 'text-emerald-800 font-semibold'
                  : 'text-secondary'
              }`}
            >
              {schedule.remarks}
            </div>
          </div>
        ))}
      </div>

      {/* Meta Specs: Grace, Height, Payment */}
      <div className="flex flex-wrap items-center justify-between text-secondary text-[12px] pt-1">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">timer</span>
            Grace: <strong className="text-on-surface ml-0.5">{carpark.gracePeriodMins} mins</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">height</span>
            Max Ht: <strong className="text-on-surface ml-0.5">{carpark.maxHeight}</strong>
          </span>
          {carpark.paymentMethods && carpark.paymentMethods.length > 0 && (
            <span className="inline-flex items-center gap-1 hidden sm:inline-flex">
              <span className="material-symbols-outlined text-[15px]">credit_card</span>
              {carpark.paymentMethods.join(' / ')}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-surface-container-high/40">
        <div className="flex items-center gap-2">
          {carpark.id === 'mbfc' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDirections(carpark);
                }}
                className="px-4 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>Directions (Google / Waze)</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(carpark.id);
                }}
                className={`px-3 py-1.5 rounded text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </>
          ) : carpark.id === 'marina-one' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenScheduleModal(carpark);
                }}
                className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-on-surface text-[13px] font-semibold transition-colors cursor-pointer"
                type="button"
              >
                Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDirections(carpark);
                }}
                className="px-3 py-1 bg-primary-container hover:bg-primary text-on-primary rounded text-[13px] font-semibold transition-colors cursor-pointer"
                type="button"
              >
                Navigate
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDirections(carpark);
              }}
              className="px-3 py-1 bg-primary-container hover:bg-primary text-on-primary rounded text-[13px] font-semibold transition-colors cursor-pointer"
              type="button"
            >
              Navigate
            </button>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenScheduleModal(carpark);
          }}
          className="text-primary hover:text-on-primary-fixed-variant text-[13px] font-semibold flex items-center gap-0.5 cursor-pointer ml-auto"
          type="button"
        >
          <span>View Full 24H Schedule</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </article>
  );
};
