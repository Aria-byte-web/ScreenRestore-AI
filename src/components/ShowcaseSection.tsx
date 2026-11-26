import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Reveal } from './Reveal';
import { getSpecimen, RenderedSpecimen, ShowcaseId } from '../utils/showcaseRenderer';

interface ShowcaseSectionProps { onLoadSampleInStudio: (id: ShowcaseId) => void; }
const SHOWCASE_IDS: ShowcaseId[] = ['dashboard', 'website', 'mobile', 'docs'];

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ onLoadSampleInStudio }) => {
  const [specimens, setSpecimens] = useState<Partial<Record<ShowcaseId, RenderedSpecimen>>>({});
  useEffect(() => {
    let active = true;
    Promise.all(SHOWCASE_IDS.map((id) => getSpecimen(id))).then((results) => {
      if (!active) return;
      const map: Partial<Record<ShowcaseId, RenderedSpecimen>> = {};
      for (const item of results) map[item.id] = item;
      setSpecimens(map);
    });
    return () => { active = false; };
  }, []);
  return (
    <section id="showcase" className="scroll-mt-20 bg-[#EAEAEA]/45 py-24 md:py-36 hairline-t hairline-b">
      <div className="editorial-container">
        <Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">Illustrative Showcase · Sample Comparisons</p>
              <h2 className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-normal leading-[1.04] tracking-[-0.03em] text-[#111111]">From Legacy to Remarkable.</h2>
            </div>
            <div className="md:col-span-5 md:flex md:flex-col md:items-end md:text-right">
              <p className="max-w-sm text-sm leading-relaxed text-[#555550]">These are illustrative before-and-after samples, not results from the live AI model. Real-ESRGAN may change text, logos, or interface details.</p>
              <a href="#studio" className="editorial-link mt-5 text-xs font-medium tracking-[0.14em] uppercase text-[#111111]"><span>Open AI Studio</span><ArrowUpRight className="h-3.5 w-3.5 stroke-[1.5]" /></a>
            </div>
          </div>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12">
          {SHOWCASE_IDS.map((id, index) => {
            const spec = specimens[id];
            const isWide = index === 0 || index === 3;
            const colSpanClass = isWide ? 'lg:col-span-7' : 'lg:col-span-5';
            const offsetClass = index === 1 ? 'lg:mt-16' : index === 2 ? 'lg:-mt-6' : '';
            return (
              <Reveal key={id} delayMs={index * 70} className={colSpanClass + ' ' + offsetClass}>
                <article className="group flex flex-col">
                  {spec ? <BeforeAfterSlider beforeSrc={spec.beforeUrl} afterSrc={spec.afterUrl} beforeAlt={'Illustrative sample: ' + spec.category} afterAlt={'Illustrative enlarged sample: ' + spec.category} beforeLabel="SAMPLE INPUT" afterLabel="ILLUSTRATIVE SAMPLE" initialPosition={46} aspectClassName={isWide ? 'aspect-[6/5]' : 'aspect-[5/6]'} /> : <div className={'w-full animate-pulse bg-[#E2E2DE] hairline-all ' + (isWide ? 'aspect-[6/5]' : 'aspect-[5/6]')} />}
                  <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-md">
                      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] uppercase text-[#666660]"><span>0{index + 1}</span><span>·</span><span>{spec?.category ?? 'UI Specimen'}</span>{spec && <><span>·</span><span>{spec.beforeDims} → {spec.afterDims}</span></>}</div>
                      <h3 className="mt-2 font-display text-2xl font-normal tracking-[-0.02em] text-[#111111]">{spec?.title ?? 'Loading specimen...'}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#555550]">{spec?.caption}</p>
                    </div>
                    <button type="button" onClick={() => onLoadSampleInStudio(id)} className="mt-1 inline-flex items-center gap-1.5 border border-[#111111]/25 bg-[#F8F8F6] px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] uppercase text-[#111111] transition-colors duration-200 hover:border-[#2563EB] hover:text-[#2563EB]"><span>Open AI Studio</span><ArrowUpRight className="h-3.5 w-3.5 stroke-[1.5]" /></button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
