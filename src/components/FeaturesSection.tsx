import React, { useEffect, useState } from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Reveal } from './Reveal';
import { getSpecimen, RenderedSpecimen } from '../utils/showcaseRenderer';

const FEATURES = [
  { index: '01', title: '2× / 4× Enlargement', summary: 'Choose an output scale. The browser creates a larger image using standard Canvas interpolation.' },
  { index: '02', title: 'Local Browser Preview', summary: 'Preview your image in this page. No AI restoration model runs on the hosted website.' },
  { index: '03', title: 'Before-and-After Comparison', summary: 'Move the slider to inspect the original beside the enlarged preview.' },
  { index: '04', title: 'PNG Download', summary: 'Download the enlarged browser preview as a PNG image.' },
  { index: '05', title: 'Sample Screens', summary: 'Load illustrative interface samples to explore the studio controls.' },
  { index: '06', title: 'Optional OpenCV Backend', summary: 'The repository includes a separate FastAPI/OpenCV processing path; it is not hosted by this GitHub Pages website.' },
];

export const FeaturesSection: React.FC = () => {
  const [specimen, setSpecimen] = useState<RenderedSpecimen | null>(null);
  useEffect(() => {
    let active = true;
    getSpecimen('specimen').then((res) => { if (active) setSpecimen(res); });
    return () => { active = false; };
  }, []);
  return (
    <>
      <section id="features" className="scroll-mt-20 py-24 md:py-36 hairline-t">
        <div className="editorial-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">Current Features · Browser Preview</p>
              <h2 className="font-display text-[clamp(2.15rem,4vw,3.4rem)] font-normal leading-[1.06] tracking-[-0.03em] text-[#111111]">Built for Interfaces, Not Generic Photos.</h2>
              <p className="mt-6 text-base leading-relaxed text-[#555550]">This website enlarges screenshots in your browser and lets you compare the result. It does not reconstruct lost detail or run an AI model.</p>
              <div className="mt-8 grid grid-cols-2 gap-6 pt-8 hairline-t">
                <div><span className="font-display text-3xl font-normal tracking-[-0.02em] text-[#111111]">2× / 4×</span><p className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">Enlargement Options</p></div>
                <div><span className="font-display text-3xl font-normal tracking-[-0.02em] text-[#111111]">PNG</span><p className="mt-1 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">Download Format</p></div>
              </div>
            </Reveal>
            <Reveal delayMs={100} className="lg:col-span-7">
              {specimen ? <BeforeAfterSlider beforeSrc={specimen.beforeUrl} afterSrc={specimen.afterUrl} beforeAlt="Illustrative interface sample" afterAlt="Illustrative interface sample at a larger browser preview size" beforeLabel="ORIGINAL SAMPLE" afterLabel="ENLARGED PREVIEW" initialPosition={50} aspectClassName="aspect-[16/11]" /> : <div className="aspect-[16/11] w-full animate-pulse bg-[#EAEAEA] hairline-all" />}
              <p className="mt-3 font-mono text-[11px] tracking-[0.12em] uppercase text-[#666660]">Illustrative sample · Browser-enlarged preview</p>
            </Reveal>
          </div>
          <div className="mt-24 grid grid-cols-1 gap-x-12 hairline-t md:grid-cols-2">
            {FEATURES.map((feat, idx) => <Reveal key={feat.index} delayMs={idx * 50} className="flex items-start gap-6 py-8 hairline-b"><span className="pt-1 font-mono text-xs tracking-[0.14em] text-[#2563EB]">{feat.index}</span><div><h3 className="font-display text-xl font-normal tracking-[-0.015em] text-[#111111]">{feat.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#555550]">{feat.summary}</p></div></Reveal>)}
          </div>
        </div>
      </section>
      <section id="about" className="scroll-mt-20 bg-[#111111] py-24 text-[#F8F8F6] md:py-32">
        <div className="editorial-container"><Reveal><div className="mx-auto max-w-4xl text-center"><p className="mb-8 font-mono text-[11px] tracking-[0.22em] uppercase text-[#9A9A96]">About PixelRevive · Preservation Manifesto</p><blockquote className="font-display text-[clamp(1.85rem,4vw,3.35rem)] font-light leading-[1.18] tracking-[-0.025em] text-[#F8F8F6]">Every legacy screenshot is an artifact of your product’s history—clarity should elevate it without rewriting a single pixel of its truth.</blockquote><p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-[#9A9A96]">Designed for product teams, design historians, technical writers, and marketing studios migrating decade-old visual archives to modern high-DPI displays.</p></div></Reveal></div>
      </section>
    </>
  );
};
