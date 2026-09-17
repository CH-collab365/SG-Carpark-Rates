import React from 'react';

interface SeasonParkingRulesProps {
  onOpenGuideModal: () => void;
}

export const SeasonParkingRules: React.FC<SeasonParkingRulesProps> = ({
  onOpenGuideModal,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md p-4 lg:p-5 flex flex-col gap-2 border border-surface-container/60">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
        <h3 className="text-[18px] text-on-surface font-bold">Season Parking &amp; Grace Rules</h3>
      </div>
      <p className="text-secondary text-[12px] leading-relaxed">
        Singapore commercial buildings enforce a standardized minimum <strong>10-minute grace period</strong>.
        Exceeding by 1 minute incurs the full first-block billing rate. HDB season holders with Group C access
        may park freely in designated peripheral bays.
      </p>
      <div className="pt-1 flex items-center gap-3">
        <button
          onClick={onOpenGuideModal}
          className="text-primary text-[13px] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
          type="button"
        >
          <span>Download CBD Parking Guide (PDF)</span>
          <span className="material-symbols-outlined text-[14px]">download</span>
        </button>
      </div>
    </div>
  );
};
