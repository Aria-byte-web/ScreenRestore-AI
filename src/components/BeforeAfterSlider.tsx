import React, { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
  aspectClassName?: string;
  fitMode?: 'cover' | 'contain';
  pixelatedBefore?: boolean;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  initialPosition = 52,
  aspectClassName = 'aspect-[16/10]',
  fitMode = 'cover',
  pixelatedBefore = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<number>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, pct)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPosition((p) => Math.max(2, p - 3));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPosition((p) => Math.min(98, p + 3));
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Before and after image comparison slider"
      aria-valuemin={2}
      aria-valuemax={98}
      aria-valuenow={Math.round(position)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`group relative w-full select-none overflow-hidden bg-[#EAEAEA] hairline-all cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${aspectClassName} ${className}`}
    >
      {/* After (Restored) Layer — Full Base */}
      <img
        src={afterSrc}
        alt={afterAlt}
        draggable={false}
        className={`pointer-events-none block h-full w-full object-center ${
          fitMode === 'contain' ? 'object-contain' : 'object-cover'
        }`}
      />

      {/* Before (Original Legacy) Layer — Clipped Left Side */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          draggable={false}
          style={pixelatedBefore ? { imageRendering: 'pixelated' } : undefined}
          className={`block h-full w-full object-center ${
            fitMode === 'contain' ? 'object-contain' : 'object-cover'
          }`}
        />
      </div>

      {/* Micro editorial tags */}
      <span className="pointer-events-none absolute top-3.5 left-3.5 z-10 border border-[#111111]/15 bg-[#F8F8F6]/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[#111111] backdrop-blur-xs">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3.5 right-3.5 z-10 border border-[#111111]/15 bg-[#111111]/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[#F8F8F6] backdrop-blur-xs">
        {afterLabel}
      </span>

      {/* Divider Hairline & Handle */}
      <div
        className="pointer-events-none absolute inset-y-0 z-20 w-px bg-[#111111]"
        style={{ left: `${position}%` }}
      >
        <div
          className={`absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[#111111] bg-[#F8F8F6] text-[#111111] transition-transform duration-150 ${
            isDragging
              ? 'scale-105 border-[#2563EB] text-[#2563EB]'
              : 'group-hover:scale-105'
          }`}
        >
          <MoveHorizontal className="h-4 w-4 stroke-[1.5]" />
        </div>
      </div>
    </div>
  );
};
