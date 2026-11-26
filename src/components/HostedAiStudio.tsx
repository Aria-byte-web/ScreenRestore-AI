import { ExternalLink, Sparkles } from 'lucide-react';
import { Reveal } from './Reveal';

const MODEL_URL = 'https://arasg14-pixelrevive-genai.hf.space';

export function HostedAiStudio() {
  return (
    <section id="ai-studio" className="scroll-mt-20 bg-[#F8F8F6] py-24 md:py-32 hairline-t">
      <div className="editorial-container">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                Generative AI · Real-ESRGAN
              </p>
              <h2 className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-normal leading-[1.04] tracking-[-0.03em] text-[#111111]">
                Restore with a real neural model.
              </h2>
            </div>
            <div className="md:col-span-5 md:flex md:flex-col md:items-end md:text-right">
              <p className="max-w-md text-sm leading-relaxed text-[#555550]">
                Real-ESRGAN uses a pretrained generative adversarial network to infer
                plausible detail while enlarging an image 2× or 4×. Results can
                change tiny text and logos, so review them before using as exact UI.
              </p>
              <a className="editorial-link mt-5 text-xs font-medium tracking-[0.14em] uppercase text-[#111111]" href={MODEL_URL} target="_blank" rel="noreferrer">
                <span>Open AI studio separately</span>
                <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
              </a>
            </div>
          </div>
        </Reveal>
        <div className="mt-10 overflow-hidden border border-[#111111]/15 bg-white shadow-[0_24px_80px_rgba(17,17,17,0.08)]">
          <iframe title="PixelRevive Real-ESRGAN screenshot restoration studio" src={MODEL_URL} className="block h-[960px] w-full bg-white" loading="lazy" allow="clipboard-read; clipboard-write" />
        </div>
        <p className="mt-4 max-w-3xl font-mono text-[10px] leading-relaxed text-[#666660]">
          AI processing runs on Hugging Face and uses its free shared GPU when available.
          Images are sent to Hugging Face for processing. Use non-sensitive screenshots
          for this public demo. Inference may be queued or temporarily unavailable.
        </p>
      </div>
    </section>
  );
}
