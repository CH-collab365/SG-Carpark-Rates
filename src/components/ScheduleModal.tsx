import React, { useState } from 'react';
import { Carpark } from '../types';

interface ScheduleModalProps {
  carpark: Carpark | null;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ carpark, onClose }) => {
  if (!carpark) return null;

  const [entryTime, setEntryTime] = useState('09:00');
  const [exitTime, setExitTime] = useState('11:30');
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');

  // Simple fee estimation logic
  const calculateEstimatedFee = (): string => {
    const [eH, eM] = entryTime.split(':').map(Number);
    const [xH, xM] = exitTime.split(':').map(Number);

    let durationMins = (xH * 60 + xM) - (eH * 60 + eM);
    if (durationMins <= 0) durationMins += 24 * 60; // Next day

    if (durationMins <= carpark.gracePeriodMins) {
      return '$0.00 (Within Grace Period)';
    }

    if (dayType === 'sunday' && carpark.id === 'the-promontory') {
      return 'FREE PARKING';
    }

    if (dayType === 'sunday' && carpark.id === 'one-raffles-quay') {
      return 'CLOSED to public';
    }

    // Evening flat rate check
    if (dayType === 'weekday' && eH >= 17) {
      if (carpark.id === 'mbfc') return '$3.50 (Evening Flat Rate)';
      if (carpark.id === 'marina-one') return '$3.30 (Evening Flat Rate)';
      if (carpark.id === 'oue-bayfront') return '$3.60 (Evening Flat Rate)';
      return '$3.50 (Flat Rate)';
    }

    // Standard hourly blocks
    const halfHourBlocks = Math.ceil(durationMins / 30);
    const ratePerBlock = carpark.id === 'mbfc' ? 1.40 : carpark.id === 'marina-one' ? 1.35 : carpark.id === 'one-raffles-quay' ? 1.50 : 1.20;
    const total = (halfHourBlocks * ratePerBlock).toFixed(2);
    return `$${total} (${(durationMins / 60).toFixed(1)} hrs / ${halfHourBlocks} x 30m blocks)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-surface-container">
        {/* Modal Header */}
        <div className="sticky top-0 bg-surface-container-lowest p-4 border-b border-surface-container flex items-center justify-between z-10">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              24-Hour Tariff Breakdown
            </span>
            <h3 className="text-[18px] font-bold text-on-surface">{carpark.name}</h3>
            <p className="text-[12px] text-secondary">{carpark.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="text-[11px] text-secondary font-semibold">Available Lots</span>
              <span className="text-[18px] font-bold text-emerald-800">{carpark.availableLots}</span>
              <span className="text-[10px] text-secondary">of {carpark.totalLots} total</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="text-[11px] text-secondary font-semibold">Grace Period</span>
              <span className="text-[18px] font-bold text-on-surface">{carpark.gracePeriodMins} mins</span>
              <span className="text-[10px] text-secondary">Standard CBD rule</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="text-[11px] text-secondary font-semibold">Vehicle Height</span>
              <span className="text-[18px] font-bold text-on-surface">{carpark.maxHeight}</span>
              <span className="text-[10px] text-secondary">Clearance limit</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
              <span className="text-[11px] text-secondary font-semibold">EV Bays</span>
              <span className="text-[18px] font-bold text-tertiary">
                {carpark.evInfo.hasEV ? `${carpark.evInfo.portsCount} Ports` : 'None'}
              </span>
              <span className="text-[10px] text-secondary">{carpark.evInfo.provider}</span>
            </div>
          </div>

          {/* Full Schedule Table */}
          <div className="border border-surface-container rounded-xl overflow-hidden">
            <div className="bg-surface-container px-3 py-2 text-[12px] font-bold text-secondary">
              Published Tariff Schedule
            </div>
            <div className="divide-y divide-surface-container/60">
              {carpark.schedules.map((schedule, i) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-surface-container-low/40">
                  <div>
                    <div className="text-[13px] font-bold text-on-surface">{schedule.timing}</div>
                    <div className="text-[11px] text-secondary">{schedule.subTiming || schedule.remarks}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[15px] font-bold ${
                        schedule.highlightColor === 'green'
                          ? 'text-emerald-800'
                          : schedule.highlightColor === 'red'
                          ? 'text-error'
                          : 'text-on-surface'
                      }`}
                    >
                      {schedule.rate} {schedule.rateUnit}
                    </span>
                    <div className="text-[10px] text-secondary">{schedule.remarks}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Parking Fee Estimator */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface font-bold text-[14px]">
                <span className="material-symbols-outlined text-primary text-[18px]">calculate</span>
                <span>Estimate Your Parking Fee</span>
              </div>
              <span className="text-[11px] text-secondary">Includes GST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-secondary font-semibold mb-1">Day Type</label>
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value as any)}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded px-2.5 py-1.5 text-[12px] text-on-surface outline-none"
                >
                  <option value="weekday">Monday - Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday / Public Holiday</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-secondary font-semibold mb-1">Entry Time</label>
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded px-2.5 py-1.5 text-[12px] text-on-surface outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-secondary font-semibold mb-1">Exit Time</label>
                <input
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded px-2.5 py-1.5 text-[12px] text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-secondary-container flex items-center justify-between mt-1">
              <span className="text-[12px] text-secondary font-medium">Estimated Charge:</span>
              <span className="text-[16px] font-bold text-primary">{calculateEstimatedFee()}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-surface-container-low p-4 border-t border-surface-container flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
