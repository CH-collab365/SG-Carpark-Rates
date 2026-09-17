import React from 'react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-surface-container">
        <div className="sticky top-0 bg-surface-container-lowest p-4 border-b border-surface-container flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
            <div>
              <h3 className="text-[17px] font-bold text-on-surface">Singapore CBD Parking Guide &amp; Grace Rules</h3>
              <p className="text-[11px] text-secondary">Official Urban Redevelopment Authority &amp; LTA Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-[13px] text-secondary leading-relaxed">
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
            <h4 className="font-bold text-on-surface text-[14px] flex items-center gap-1.5 mb-1 text-primary">
              <span className="material-symbols-outlined text-[18px]">timer</span>
              Standard 10-Minute Grace Period
            </h4>
            <p>
              In all commercial, industrial, and major shopping complexes within the Downtown Core / CBD,
              drivers enjoy a minimum 10-minute grace period for drop-offs and pick-ups. If your vehicle exits
              within 10 minutes from the gantry timestamp, no parking charges apply. Exceeding 10 minutes by
              even 1 second will result in payment for the full first charging block.
            </p>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
            <h4 className="font-bold text-on-surface text-[14px] flex items-center gap-1.5 mb-1 text-on-surface">
              <span className="material-symbols-outlined text-[18px]">local_parking</span>
              Season Parking Rules (Commercial &amp; HDB Group C)
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 mt-1">
              <li>
                <strong>Commercial Buildings:</strong> Season parking is prioritized for corporate tenants. Public passes are subject to balloting and quarterly renewals.
              </li>
              <li>
                <strong>URA Open Surface Carparks:</strong> Group C Season tickets (valid for commercial zones) allow whole-day parking without hourly coupon or electronic billing.
              </li>
              <li>
                <strong>Weekend &amp; Sunday Concessions:</strong> Several CBD open-surface lots (e.g., The Promontory) offer Free Parking on Sundays and Public Holidays between 07:00 and 22:30.
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
            <h4 className="font-bold text-on-surface text-[14px] flex items-center gap-1.5 mb-1 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              EV Charging Etiquette in Commercial Buildings
            </h4>
            <p>
              EV charging bays (SP Mobility, Shell Recharge, CDG ENGIE, Charge+) are reserved strictly for active
              charging vehicles. Vehicles remaining in EV lots after full battery saturation may incur idle fees
              of $0.50/minute at select private commercial gantries.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 border-t border-surface-container flex items-center justify-between">
          <span className="text-[11px] text-secondary">Document Ref: SG-CBD-PKG-2026</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Guide</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-primary text-white text-[12px] font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
