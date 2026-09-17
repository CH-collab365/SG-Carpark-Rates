import React, { useState } from 'react';
import { Carpark } from '../types';

interface DirectionsModalProps {
  carpark: Carpark | null;
  onClose: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({ carpark, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!carpark) return null;

  const encodedAddress = encodeURIComponent(`${carpark.name}, ${carpark.address}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${carpark.name}\n${carpark.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full border border-surface-container overflow-hidden">
        <div className="p-4 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">navigation</span>
            <h3 className="text-[16px] font-bold text-on-surface">Navigate to Carpark</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="bg-surface-container-low p-3 rounded-lg">
            <div className="font-bold text-[14px] text-on-surface">{carpark.name}</div>
            <div className="text-[12px] text-secondary mt-0.5">{carpark.address}</div>
            <div className="text-[11px] text-primary font-semibold mt-1">
              Distance: {carpark.distanceKm} km from current location
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-container hover:bg-primary text-white font-semibold rounded-lg shadow-xs transition-colors text-[13px]"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>Open in Google Maps</span>
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors text-[13px]"
            >
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
              <span>Open in Waze</span>
            </a>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-surface-container hover:bg-surface-container-low text-secondary font-semibold rounded-lg transition-colors text-[12px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>{copied ? 'Address & Postal Copied!' : 'Copy Address & Postal Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
