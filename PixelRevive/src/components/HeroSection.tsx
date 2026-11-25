import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { getSpecimen, RenderedSpecimen } from '../utils/showcaseRenderer';

export const HeroSection: React.FC = () => {
  const [heroSpecimen, setHeroSpecimen] = useState<RenderedSpecimen | null>(null);

  useEffect(() => {
    let active = true;
    getSpecimen('hero').then((spec) => {
      if (active) setHeroSpecimen(spec);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="home" className="pt-14 pb-20 md:pt-24 md:pb-32">
      <div className="editorial-container">
        {/* Editorial Top Masthead */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mb-6 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">
              AI Screenshot Restoration Platform · 2x &amp; 4x Precision
            </p>
            <h1 className="font-display text-[clamp(2.75rem,6.6vw,5.75rem)] font-normal leading-[0.98] tracking-[-0.035em] text-[#111111]">
              Give Your Old Screenshots a New Perspective.
            </h1>
          </div>

          <div className="lg:col-span-4 lg:pb-2">
            <p className="text-base leading-relaxed text-[#444440] md:text-[17px]">
              Restore, upscale and enhance legacy product screenshots with AI.
              Preserve every detail while bringing your visuals up to modern
              standards.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#studio"
                className="group inline-flex items-center gap-2.5 bg-[#111111] px-6 py-3.5 text-xs font-medium tracking-[0.12em] uppercase text-[#F8F8F6] transition-colors duration-200 hover:bg-[#2563EB]"
              >
                <span>Restore Your Screenshot</span>
                <ArrowUpRight className="h-4 w-4 stroke-[1.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="#how-it-works"
                className="editorial-link py-2 text-xs font-medium tracking-[0.12em] uppercase text-[#111111]"
              >
                <span>Explore How It Works</span>
                <ArrowDownRight className="h-3.5 w-3.5 stroke-[1.5]" />
              </a>
            </div>
          </div>
        </div>

        {/* Full-Width Editorial Visual Comparison */}
        <div className="mt-14 md:mt-20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">
            <span>
              Interactive Comparison · Drag to inspect legacy vs. restored interface
            </span>
            <span>
              {heroSpecimen
                ? `${heroSpecimen.beforeDims} → ${heroSpecimen.afterDims} · 4X`
                : '365 × 228px → 1520 × 950px · 4X'}
            </span>
          </div>

          {heroSpecimen ? (
            <BeforeAfterSlider
              beforeSrc={heroSpecimen.beforeUrl}
              afterSrc={heroSpecimen.afterUrl}
              beforeAlt="Blurry low-resolution legacy product dashboard screenshot"
              afterAlt="Crystal-clear 4x AI-restored product dashboard screenshot"
              beforeLabel="LEGACY · LOW-RES"
              afterLabel="RESTORED · 4X CLARITY"
              initialPosition={48}
              aspectClassName="aspect-[16/10]"
            />
          ) : (
            <div className="aspect-[16/10] w-full animate-pulse bg-[#EAEAEA] hairline-all" />
          )}
        </div>
      </div>
    </section>
  );
};
