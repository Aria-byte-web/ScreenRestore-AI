import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';

export const FinalCtaAndFooter: React.FC = () => {
  return (
    <>
      {/* SECTION 7 – Final CTA */}
      <section className="py-28 md:py-40 hairline-t">
        <div className="editorial-container">
          <Reveal>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="mb-5 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">
                  Ready When You Are
                </p>
                <h2 className="font-display text-[clamp(2.5rem,5.5vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.03em] text-[#111111]">
                  Your Old Screenshots Deserve Better.
                </h2>
              </div>

              <div className="lg:col-span-4 lg:pb-2">
                <p className="text-base leading-relaxed text-[#555550]">
                  Bring clarity back to your product visuals.
                </p>
                <a
                  href="#studio"
                  className="group mt-7 inline-flex items-center gap-3 bg-[#111111] px-7 py-4 text-xs font-medium tracking-[0.14em] uppercase text-[#F8F8F6] transition-colors duration-200 hover:bg-[#2563EB]"
                >
                  <span>Start Restoring</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 8 – Editorial Footer */}
      <footer className="bg-[#111111] pt-20 pb-10 text-[#F8F8F6]">
        <div className="editorial-container">
          <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-12 md:items-start">
            {/* Brand & Colophon */}
            <div className="md:col-span-6">
              <a
                href="#home"
                className="inline-flex items-center gap-3 text-[#F8F8F6]"
              >
                <span className="flex h-6 w-6 items-center justify-center border border-[#F8F8F6]/60">
                  <span className="h-2.5 w-2.5 bg-[#F8F8F6]" />
                </span>
                <span className="font-display text-lg font-medium tracking-[-0.02em]">
                  PixelRevive
                </span>
              </a>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#9A9A96]">
                Editorial-grade AI screenshot restoration for legacy product
                interfaces, software archives, and technical documentation.
              </p>
            </div>

            {/* Footer Navigation */}
            <div className="md:col-span-3">
              <p className="mb-4 font-mono text-[11px] tracking-[0.18em] uppercase text-[#9A9A96]">
                Navigation
              </p>
              <ul className="space-y-3 text-xs font-medium tracking-[0.14em] uppercase">
                <li>
                  <a
                    href="#about"
                    className="text-[#F8F8F6]/85 transition-colors hover:text-[#F8F8F6]"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-[#F8F8F6]/85 transition-colors hover:text-[#F8F8F6]"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-[#F8F8F6]/85 transition-colors hover:text-[#F8F8F6]"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#studio"
                    className="text-[#F8F8F6]/85 transition-colors hover:text-[#F8F8F6]"
                  >
                    Studio
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div id="contact" className="md:col-span-3">
              <p className="mb-4 font-mono text-[11px] tracking-[0.18em] uppercase text-[#9A9A96]">
                Contact
              </p>
              <div className="space-y-3 text-sm text-[#F8F8F6]/85">
                <p>
                  <a
                    href="mailto:studio@pixelrevive.ai"
                    className="editorial-link text-[#F8F8F6]"
                  >
                    studio@pixelrevive.ai
                  </a>
                </p>
                <p className="font-mono text-xs text-[#9A9A96]">
                  FastAPI · OpenCV Processing · AI Model Ready to Integrate
                </p>
              </div>
            </div>
          </div>

          {/* Oversized Bookend Wordmark inspired by reference footer */}
          <div className="border-t border-[#F8F8F6]/15 pt-10">
            <p
              aria-hidden="true"
              className="select-none font-display text-[clamp(3.2rem,13.5vw,12.5rem)] font-light leading-[0.88] tracking-[-0.045em] text-[#F8F8F6]/95"
            >
              PixelRevive
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.14em] uppercase text-[#9A9A96]">
              <span>© {new Date().getFullYear()} PixelRevive. All rights reserved.</span>
              <span>UI-Preserving Image Restoration</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
