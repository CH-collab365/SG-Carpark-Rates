import React from 'react';

interface LiveTickerProps {
  countdown: number;
  onRefreshNow: () => void;
  isRefreshing: boolean;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  countdown,
  onRefreshNow,
  isRefreshing,
}) => {
  return (
    <div className="w-full bg-surface-container py-1.5 px-4 lg:px-6 border-b border-surface-container-high/60">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between text-[11px] font-semibold text-secondary">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 text-primary font-bold shrink-0">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            LIVE FEED
          </span>
          <span className="truncate">Connected to LTA Datamall v2.8 &amp; URA Live Sensors</span>
          <span className="hidden sm:inline text-outline-variant">|</span>
          <span className="hidden sm:inline truncate">
            CBD Congestion Status: <strong className="text-on-surface">Normal (ERP Zone 1 Active)</strong>
          </span>
        </div>

        <button
          onClick={onRefreshNow}
          className="flex items-center gap-1.5 hover:text-on-surface transition-colors cursor-pointer shrink-0 ml-2"
          title="Click to refresh live lot data immediately"
          type="button"
        >
          <span className={`material-symbols-outlined text-[14px] ${isRefreshing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isRefreshing ? 'Syncing...' : `Auto-refreshes in ${countdown}s`}</span>
        </button>
      </div>
    </div>
  );
};
