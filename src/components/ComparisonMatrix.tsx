import React from 'react';
import { Carpark } from '../types';

interface ComparisonMatrixProps {
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
  selectedCarparkId: string | null;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  carparks,
  onSelectCarpark,
  selectedCarparkId,
}) => {
  // Show the top 4 closest carparks
  const displayedCarparks = carparks.slice(0, 4);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md p-4 lg:p-5 flex flex-col gap-3 border border-surface-container/60">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] text-on-surface font-bold">Closest Carparks Comparison</h2>
        <span className="text-secondary text-[11px] font-semibold">Est. 2-Hour Visit</span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="bg-surface-container text-secondary text-[11px] font-semibold">
              <th className="p-2 pl-3">Carpark</th>
              <th className="p-2 text-center">1-Hr Wkday</th>
              <th className="p-2 text-center">2-Hr Wkend</th>
              <th className="p-2 text-center">EV Bays</th>
              <th className="p-2 text-right pr-3">Season</th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {displayedCarparks.map((cp, idx) => {
              const isSelected = cp.id === selectedCarparkId;
              return (
                <tr
                  key={cp.id}
                  onClick={() => onSelectCarpark(cp)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-fixed/40 font-semibold'
                      : idx % 2 === 1
                      ? 'bg-surface-container-low/30 hover:bg-surface-container-low'
                      : 'hover:bg-surface-container-low'
                  }`}
                >
                  <td className="p-2 pl-3 font-semibold text-on-surface">
                    {cp.name.split('(')[0].trim()}
                    <span className="block text-[10px] text-secondary font-normal">
                      {cp.distanceKm} km
                    </span>
                  </td>
                  <td className="p-2 text-center text-[15px] text-on-surface font-semibold">
                    {cp.comparison.oneHrWkday}
                  </td>
                  <td
                    className={`p-2 text-center text-[15px] font-bold ${
                      cp.comparison.weekendHighlight === 'green'
                        ? 'text-emerald-800'
                        : cp.comparison.weekendHighlight === 'red'
                        ? 'text-error'
                        : 'text-on-surface'
                    }`}
                  >
                    {cp.comparison.twoHrWkend}
                  </td>
                  <td className="p-2 text-center">
                    {cp.comparison.evBaysDisplay !== '—' ? (
                      <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                        {cp.comparison.evBaysDisplay}
                      </span>
                    ) : (
                      <span className="text-secondary text-[11px]">—</span>
                    )}
                  </td>
                  <td className="p-2 text-right pr-3 text-[11px] text-on-surface font-medium">
                    {cp.comparison.seasonDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Tip Callout */}
      <div className="p-3 bg-secondary-container/40 rounded-lg flex items-start gap-2.5 text-on-secondary-container text-[12px] border border-secondary-container">
        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
          tips_and_updates
        </span>
        <div>
          <strong className="font-bold text-on-surface">Motorist Tip for CBD:</strong> For dinners or
          weekend stays past 6:00 PM, <strong>Marina One</strong> offers the lowest flat entry fee ($3.30),
          saving up to $14 over standard hourly meters.
        </div>
      </div>
    </div>
  );
};
