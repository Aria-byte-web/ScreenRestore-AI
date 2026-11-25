import React, { useEffect, useState } from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Reveal } from './Reveal';
import { getSpecimen, RenderedSpecimen } from '../utils/showcaseRenderer';

const FEATURES = [
  {
    index: '01',
    title: 'Screenshot Upscaling',
    summary:
      'Reconstructs crisp 2x and 4x pixel density from aging 72dpi exports, recovering readable micro-labels and subtle interface depth.',
  },
  {
    index: '02',
    title: 'Smart Denoising',
    summary:
      'Strips away JPEG compression ringing, mosquito artifacts around dark typography, and flat-surface color banding.',
  },
  {
    index: '03',
    title: 'Text and UI Preservation',
    summary:
      'Strictly preserves original typography, glyphs, icons, spacing, and alignment—never hallucinating altered buttons or fake words.',
  },
  {
    index: '04',
    title: 'Edge Sharpening',
    summary:
      'Restores razor-clean 1px borders, vector divider hairlines, chart strokes, and window chrome without artificial haloing.',
  },
  {
    index: '05',
    title: '2x / 4x Upscaling',
    summary:
      'Choose 2x for quick documentation updates or 4x for Retina hero showcases, pitch decks, and high-resolution print collateral.',
  },
  {
    index: '06',
    title: 'Before-and-After Comparison',
    summary:
      'Verify every restored screen with an interactive split-screen optical slider before committing your final export.',
  },
];

export const FeaturesSection: React.FC = () => {
  const [specimen, setSpecimen] = useState<RenderedSpecimen | null>(null);

  useEffect(() => {
    let active = true;
    getSpecimen('specimen').then((res) => {
      if (active) setSpecimen(res);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {/* SECTION 5 – Core Features (Editorial Alternating Layout) */}
      <section id="features" className="scroll-mt-20 py-24 md:py-36 hairline-t">
        <div className="editorial-container">
          {/* Top Alternating Image-and-Text Feature Showcase */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">
                Core Capabilities · Optical Fidelity
              </p>
              <h2 className="font-display text-[clamp(2.15rem,4vw,3.4rem)] font-normal leading-[1.06] tracking-[-0.03em] text-[#111111]">
                Built for Interfaces, Not Generic Photos.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#555550]">
                Conventional upscalers soften crisp software edges or invent
                unwanted textures across clean UI panels. PixelRevive pairs
                structure-preserving super-resolution with UI-aware denoising so
                every glyph and 1px hairline remains faithful to your product.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-6 pt-8 hairline-t">
                <div>
                  <span className="font-display text-3xl font-normal tracking-[-0.02em] text-[#111111]">
                    2× / 4×
                  </span>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">
                    Resolution Scales
                  </p>
                </div>
                <div>
                  <span className="font-display text-3xl font-normal tracking-[-0.02em] text-[#111111]">
                    100%
                  </span>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">
                    Layout Integrity
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={100} className="lg:col-span-7">
              {specimen ? (
                <BeforeAfterSlider
                  beforeSrc={specimen.beforeUrl}
                  afterSrc={specimen.afterUrl}
                  beforeAlt="Blurry legacy UI typography and vector border specimen"
                  afterAlt="Crisp restored UI typography and vector border specimen"
                  beforeLabel="RAW COMPRESSED"
                  afterLabel="EDGE RESTORED"
                  initialPosition={50}
                  aspectClassName="aspect-[16/11]"
                />
              ) : (
                <div className="aspect-[16/11] w-full animate-pulse bg-[#EAEAEA] hairline-all" />
              )}
              <p className="mt-3 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">
                Specimen 05 · Sub-pixel glyph recovery &amp; chroma noise elimination
              </p>
            </Reveal>
          </div>

          {/* Editorial Ledger of All 6 Core Capabilities (No Repetitive Cards) */}
          <div className="mt-24 grid grid-cols-1 gap-x-12 hairline-t md:grid-cols-2">
            {FEATURES.map((feat, idx) => (
              <Reveal
                key={feat.index}
                delayMs={idx * 50}
                className="flex items-start gap-6 py-8 hairline-b"
              >
                <span className="pt-1 font-mono text-xs tracking-[0.14em] text-[#2563EB]">
                  {feat.index}
                </span>
                <div>
                  <h3 className="font-display text-xl font-normal tracking-[-0.015em] text-[#111111]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#555550]">
                    {feat.summary}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial About / Manifesto Band inspired by McCurry's dark contrast band */}
      <section id="about" className="scroll-mt-20 bg-[#111111] py-24 text-[#F8F8F6] md:py-32">
        <div className="editorial-container">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-8 font-mono text-[11px] tracking-[0.22em] uppercase text-[#9A9A96]">
                About PixelRevive · Preservation Manifesto
              </p>
              <blockquote className="font-display text-[clamp(1.85rem,4vw,3.35rem)] font-light leading-[1.18] tracking-[-0.025em] text-[#F8F8F6]">
                Every legacy screenshot is an artifact of your product’s
                history—clarity should elevate it without rewriting a single
                pixel of its truth.
              </blockquote>
              <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-[#9A9A96]">
                Designed for product teams, design historians, technical writers,
                and marketing studios migrating decade-old visual archives to
                modern high-DPI displays.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};
