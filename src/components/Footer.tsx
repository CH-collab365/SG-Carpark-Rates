import React from 'react';

interface FooterProps {
  onOpenTalkToUs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTalkToUs }) => {
  return (
    <>
      {/* Legal & Data Transparency Footer Note */}
      <section className="w-full bg-surface-container py-4 px-4 lg:px-6 mt-8 border-t border-surface-container-high/60">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-secondary text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">info</span>
            <span>
              Rates and live lot counts synchronized in real-time via <strong>LTA Datamall</strong>,{' '}
              <strong>URA</strong>, <strong>HDB</strong>, and smart commercial gantry telemetry. Rates exclude prevailing
              GST unless explicitly noted.
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-4 text-[11px]">
            <span>
              API Latency: <strong className="text-on-surface">320ms</strong>
            </span>
            <span>Version 2.4.9</span>
          </div>
        </div>
      </section>

      {/* Main Sgcarmart Footer */}
      <footer className="w-full bg-surface-container-lowest py-6 border-t border-surface-container">
        <div className="max-w-[1360px] mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant text-[12px]">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-on-surface font-bold">sgCarMart</span>
            <span className="text-secondary">Singapore&apos;s #1 Car Portal for Drivers</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-secondary">
            {onOpenTalkToUs && (
              <button
                type="button"
                onClick={onOpenTalkToUs}
                className="hover:text-primary font-semibold text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">forum</span>
                <span>Talk to Us &amp; Community Forum</span>
              </button>
            )}
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>
              LTA Real-time Data Feed
            </a>
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>
              Carpark Operator Submissions
            </a>
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>
              Terms of Service
            </a>
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
          </div>

          <div className="text-secondary">© 2024 Sgcarmart. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
};
