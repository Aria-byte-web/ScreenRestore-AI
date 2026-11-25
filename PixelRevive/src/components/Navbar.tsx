import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F8F6]/95 backdrop-blur-sm">
      <div className="editorial-container">
        <div className="flex h-20 items-center justify-between hairline-b">
          {/* PixelRevive Logo */}
          <a
            href="#home"
            className="group inline-flex items-center gap-3 text-[#111111] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span
              aria-hidden="true"
              className="relative flex h-6 w-6 items-center justify-center border border-[#111111] transition-colors duration-300 group-hover:border-[#2563EB]"
            >
              <span className="h-2.5 w-2.5 bg-[#111111] transition-colors duration-300 group-hover:bg-[#2563EB]" />
            </span>
            <span className="font-display text-lg font-medium tracking-[-0.02em]">
              PixelRevive
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-9 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium tracking-[0.14em] uppercase text-[#111111]/80 transition-colors duration-200 hover:text-[#111111]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#studio"
              className="inline-flex items-center border border-[#111111] bg-[#111111] px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase text-[#F8F8F6] transition-colors duration-200 hover:border-[#2563EB] hover:bg-[#2563EB]"
            >
              Try It Now
            </a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#111111]/20 text-[#111111] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4 stroke-[1.5]" />
            ) : (
              <Menu className="h-4 w-4 stroke-[1.5]" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col gap-4 py-6 hairline-b md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-1 text-sm font-medium tracking-[0.12em] uppercase text-[#111111]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#studio"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center bg-[#111111] px-5 py-3 text-xs font-medium tracking-[0.14em] uppercase text-[#F8F8F6]"
            >
              Try It Now
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};
