import React, { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: {
          page: {
            identifier: string;
            url: string;
            title?: string;
          };
        }) => void;
      }) => void;
    };
    disqus_config?: (this: {
      page: {
        identifier: string;
        url: string;
        title?: string;
      };
    }) => void;
  }
}

interface TalkToUsTabProps {
  onBackToCarparks: () => void;
}

// Real fixed canonical configuration values
const DISQUS_PAGE_IDENTIFIER = 'sg-carpark-rates-talk-to-us';
const DISQUS_SHORTNAME = 'sgcarrates';

export const TalkToUsTab: React.FC<TalkToUsTabProps> = ({ onBackToCarparks }) => {
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadCount, setReloadCount] = useState(0);
  const disqusContainerRef = useRef<HTMLDivElement>(null);

  // Derive fixed canonical URL for the Disqus thread
  const canonicalUrl =
    typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/#talk-to-us`
      : 'https://ch-collab365.github.io/SG-Carpark-Rates/#talk-to-us';

  const loadOrReloadDisqus = () => {
    setLoadStatus('loading');

    const configFunction = function (this: {
      page: { identifier: string; url: string; title?: string };
    }) {
      this.page.url = canonicalUrl;
      this.page.identifier = DISQUS_PAGE_IDENTIFIER;
      this.page.title = 'Talk to Us - SG Carpark Rates Community & Feedback';
    };

    // If window.DISQUS already exists from a previous tab visit, use DISQUS.reset
    if (typeof window !== 'undefined' && window.DISQUS) {
      try {
        window.DISQUS.reset({
          reload: true,
          config: configFunction,
        });
        setLoadStatus('ready');
      } catch (err) {
        console.error('Error resetting Disqus:', err);
        setLoadStatus('error');
      }
      return;
    }

    // Set the global disqus_config object
    window.disqus_config = configFunction;

    // Check if the script was already injected into head or body
    const existingScript = document.querySelector(
      `script[src*="${DISQUS_SHORTNAME}.disqus.com/embed.js"]`
    );

    if (existingScript) {
      // Script tag exists but window.DISQUS might still be loading
      const checkInterval = setInterval(() => {
        if (window.DISQUS) {
          clearInterval(checkInterval);
          try {
            window.DISQUS.reset({
              reload: true,
              config: configFunction,
            });
            setLoadStatus('ready');
          } catch {
            setLoadStatus('error');
          }
        }
      }, 200);

      // Fallback timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setLoadStatus('ready');
      }, 5000);
      return;
    }

    // First time loading: create and inject the script tag
    try {
      const d = document;
      const s = d.createElement('script');
      s.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;

      s.onload = () => {
        setLoadStatus('ready');
      };

      s.onerror = () => {
        setLoadStatus('error');
      };

      (d.head || d.body).appendChild(s);
    } catch (err) {
      console.error('Failed to append Disqus script:', err);
      setLoadStatus('error');
    }
  };

  useEffect(() => {
    // Scroll smoothly to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load or reset Disqus whenever the tab is mounted or reloaded
    const timer = setTimeout(() => {
      loadOrReloadDisqus();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [reloadCount]);

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 lg:px-6 py-6 transition-all">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[12px] text-secondary">
          <button
            onClick={onBackToCarparks}
            className="flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Carpark Rates &amp; Map
          </button>
          <span>/</span>
          <span className="text-on-surface font-bold">Talk to Us (Community Forum)</span>
        </div>

        <button
          onClick={() => setReloadCount((prev) => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold transition-colors cursor-pointer shadow-xs"
          type="button"
          title="Reload Disqus comments thread"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh Thread</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 lg:p-6 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">forum</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] lg:text-[22px] font-extrabold text-on-surface">
                  Talk to Us &amp; Driver Community
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Live Forum
                </span>
              </div>
              <p className="text-[13px] text-secondary mt-1 max-w-2xl leading-relaxed">
                Have feedback on carpark rates, grace periods, EV charging bays, or missing buildings?
                Join the discussion below or leave a note for our team and fellow Singapore drivers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="bg-surface-container-low px-3 py-2 rounded-xl text-[11px] text-secondary flex flex-col items-end">
              <span className="font-semibold text-on-surface">Identifier:</span>
              <code className="text-primary font-mono text-[10px]">{DISQUS_PAGE_IDENTIFIER}</code>
            </div>
          </div>
        </div>

        {/* 3 Useful Topic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-surface-container/80">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              price_change
            </span>
            <div className="text-[12px]">
              <span className="font-bold text-on-surface block">Report Rate Updates</span>
              <span className="text-secondary text-[11px] leading-snug">
                Noticed a changed weekend rate or updated grace period? Let us know the new rates.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              add_location_alt
            </span>
            <div className="text-[12px]">
              <span className="font-bold text-on-surface block">Request New Carparks</span>
              <span className="text-secondary text-[11px] leading-snug">
                Suggest commercial, industrial, or shopping mall carparks you want tracked live.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              electric_car
            </span>
            <div className="text-[12px]">
              <span className="font-bold text-on-surface block">EV &amp; Season Parking Tips</span>
              <span className="text-secondary text-[11px] leading-snug">
                Share charger reliability, overnight rates, and season lot availability advice.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Disqus Embed Container Card */}
      <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 lg:p-7 shadow-xs min-h-[420px]">
        {loadStatus === 'loading' && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-secondary">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="text-[13px] font-semibold text-on-surface">
              Loading Disqus discussion thread...
            </div>
            <div className="text-[11px] text-secondary">
              Connecting to <code className="text-primary">{DISQUS_SHORTNAME}.disqus.com</code>
            </div>
          </div>
        )}

        {loadStatus === 'error' && (
          <div className="p-4 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700">warning</span>
              <span>
                Disqus is taking longer than usual to respond. Ad blockers or tracking protection may block comments.
              </span>
            </div>
            <button
              onClick={() => setReloadCount((prev) => prev + 1)}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded font-semibold text-[11px] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* The Disqus container */}
        <div ref={disqusContainerRef}>
          <div id="disqus_thread"></div>
        </div>

        {/* Standard noscript fallback */}
        <noscript>
          Please enable JavaScript to view the{' '}
          <a
            href="https://disqus.com/?ref_noscript"
            rel="nofollow"
            className="text-primary underline"
          >
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </div>
  );
};
