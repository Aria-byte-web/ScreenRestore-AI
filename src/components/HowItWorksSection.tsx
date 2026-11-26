import React from 'react';
import { Reveal } from './Reveal';

const STEPS = [
  { number: '01', label: 'Upload', description: 'Choose a PNG, JPG, or WebP screenshot. The image is sent to the public Hugging Face Space, where the model runs.', meta: 'UPLOAD · HUGGING FACE HOSTED' },
  { number: '02', label: 'Restore', description: 'Real-ESRGAN uses a pretrained generative adversarial network to enlarge the image 2× or 4× and infer plausible detail. Fine text and logos can change.', meta: 'INFERENCE · PRETRAINED GAN' },
  { number: '03', label: 'Compare & download', description: 'Review the original and generated result side by side. Use the result image download control to save the output, then check important details.', meta: 'COMPARE · REVIEW · DOWNLOAD' },
];

export const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="scroll-mt-20 py-24 md:py-36">
    <div className="editorial-container">
      <Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">Workflow · Minimal Precision</p>
            <h2 className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-normal leading-[1.04] tracking-[-0.03em] text-[#111111]">Three Steps. A Better Image.</h2>
          </div>
          <div className="md:col-span-5 md:text-right">
            <p className="font-mono text-xs tracking-[0.12em] uppercase text-[#666660]">Pretrained image model · No prompt needed</p>
          </div>
        </div>
      </Reveal>
      <div className="mt-16 grid grid-cols-1 hairline-t md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Reveal key={step.number} delayMs={index * 90} className={"flex flex-col justify-between py-10 md:py-14 " + (index < 2 ? 'hairline-b md:border-b-0 md:border-r md:border-[#111111]/14 md:pr-10 ' : '') + (index > 0 ? 'md:pl-10' : '')}>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl font-light tracking-[-0.04em] text-[#111111] md:text-6xl">{step.number}</span>
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#2563EB]">Step {step.number}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-normal tracking-[-0.02em] text-[#111111]">{step.number} – {step.label}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#555550]">{step.description}</p>
            </div>
            <p className="mt-10 pt-5 font-mono text-[11px] tracking-[0.14em] uppercase text-[#666660] hairline-t">{step.meta}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
