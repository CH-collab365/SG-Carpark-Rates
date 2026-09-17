import React from 'react';

interface HeaderProps {
  onOpenQuickFilters: () => void;
  activeFilterCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickFilters, activeFilterCount }) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-24 w-full px-4 lg:px-6 flex flex-col justify-between pt-1">
        {/* Top utility row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-2 group">
              <img
                alt="sgCarMart Carpark Rates Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                src="https://lh3.googleusercontent.com/aida/AEtjO1UCidrNMIW8qsMkHfSulRDPobY6zHIRS521Ugk8Ei1P6O493WjEOcbjo6TrwxUF8SwP8N7vSC6AVTmLlGYZ88zxUO8m-n8Ez_DtU6e5a5qciT4_kCVN68v7XtzuKwmRy_F7IoRGEfsLE2CkQb2TIRw30KYtR5Jl39NUAUans51o5tWfWpGGFADlpq2i-vJyx-he5O9bCHU6zKhOKoinvMyALf8IKRAuettpI9gDips8FJwRNghhoh9bo_EZ"
              />
            </a>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[13px] font-semibold">
              <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
              Current: Raffles Place / Marina Bay, Singapore
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-secondary text-[13px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>Radius 2.0km</span>
            </div>

            <button
              onClick={onOpenQuickFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container text-on-primary text-[13px] font-semibold transition hover:bg-primary shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Quick Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-primary text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm hover:opacity-90 transition cursor-pointer"
              title="User Account"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>

        {/* Navigation row */}
        <div className="flex items-center justify-between border-t-0">
          <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {['Used Cars', 'New Cars', 'Car Rental', 'Articles', 'Directory', 'Motor Insurance'].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-secondary hover:text-on-surface text-[13px] font-semibold py-1.5 whitespace-nowrap transition-colors"
              >
                {item}
              </a>
            ))}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-current="page"
              className="py-1.5 whitespace-nowrap transition-colors text-primary font-bold border-b-2 border-primary text-[13px]"
            >
              Carpark Rates
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>
              Home
            </a>
            <span>&gt;</span>
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>
              Directory
            </a>
            <span>&gt;</span>
            <span className="text-on-surface font-semibold">Carpark Rates &amp; Availability</span>
          </div>
        </div>
      </div>
    </header>
  );
};
