import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  RefreshCw,
  Server,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Reveal } from './Reveal';
import {
  BackendHealth,
  checkBackendHealth,
  readImageDimensions,
  RestorationResult,
  RestorationScale,
  restoreScreenshot,
} from '../services/restorationService';
import { getSampleFile, ShowcaseId } from '../utils/showcaseRenderer';

interface RestorationStudioProps {
  externalSampleRequest?: { id: ShowcaseId; nonce: number } | null;
}

type ViewerTab = 'compare' | 'restored' | 'original';

const SAMPLE_PRESETS: { id: ShowcaseId; label: string }[] = [
  { id: 'dashboard', label: 'Legacy Dashboard' },
  { id: 'website', label: 'Web Interface' },
  { id: 'mobile', label: 'Mobile App' },
  { id: 'docs', label: 'API Docs' },
];

export const RestorationStudio: React.FC<RestorationStudioProps> = ({
  externalSampleRequest,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [sourceDims, setSourceDims] = useState<{ width: number; height: number } | null>(
    null
  );

  const [scale, setScale] = useState<RestorationScale>(4);
  const [preserveUiText, setPreserveUiText] = useState<boolean>(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RestorationResult | null>(null);
  const [viewerTab, setViewerTab] = useState<ViewerTab>('compare');

  // Backend status & optional FastAPI endpoint configuration
  const [apiEndpoint, setApiEndpoint] = useState<string>(
    (import.meta.env.VITE_RESTORATION_API_URL as string | undefined) || ''
  );
  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealth>({
    connected: false,
    endpoint: 'Not configured',
    engineName: 'Client Preview Only',
    checkedAt: 0,
  });

  const refreshHealth = useCallback(
    async (endpointToTest?: string) => {
      const health = await checkBackendHealth(endpointToTest ?? apiEndpoint);
      setBackendHealth(health);
      return health;
    },
    [apiEndpoint]
  );

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  // Clean up object URL when source file changes
  useEffect(() => {
    return () => {
      if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
    };
  }, [sourcePreviewUrl]);

  const acceptFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid PNG, JPG, or WebP screenshot.');
      return;
    }

    setErrorMessage(null);
    setResult(null);
    setViewerTab('original');

    const objectUrl = URL.createObjectURL(file);
    setSourceFile(file);
    setSourcePreviewUrl(objectUrl);

    try {
      const dims = await readImageDimensions(file);
      setSourceDims(dims);
    } catch {
      setSourceDims(null);
    }
  }, []);

  const handleLoadSample = useCallback(
    async (id: ShowcaseId) => {
      try {
        const sampleFile = await getSampleFile(id);
        await acceptFile(sampleFile);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Could not load sample screenshot.'
        );
      }
    },
    [acceptFile]
  );

  // Triggered when user clicks "Test in Studio" from Section 3 Showcase
  useEffect(() => {
    if (!externalSampleRequest) return;
    handleLoadSample(externalSampleRequest.id);
    const el = document.getElementById('studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [externalSampleRequest, handleLoadSample]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handleRestore = async () => {
    if (!sourceFile) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const output = await restoreScreenshot({
        file: sourceFile,
        scale,
        preserveUiText,
        denoiseStrength: 0.5,
        endpointOverride: apiEndpoint,
      });
      setResult(output);
      setViewerTab('compare');
      // Refresh health badge after call
      refreshHealth();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Restoration request failed.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !sourceFile) return;
    const baseName = sourceFile.name.replace(/\.[^/.]+$/, '') || 'screenshot';
    const suffix = result.mode === 'fastapi-opencv' ? `restored-${result.scale}x` : `preview-${result.scale}x`;
    const link = document.createElement('a');
    link.href = result.restoredDataUrl;
    link.download = `pixelrevive-${baseName}-${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const targetDimsLabel = sourceDims
    ? `${sourceDims.width * scale} × ${sourceDims.height * scale}px`
    : `${scale}× Original`;

  return (
    <section id="studio" className="scroll-mt-20 bg-[#EAEAEA]/40 py-24 md:py-36 hairline-t">
      <div className="editorial-container">
        {/* Studio Header */}
        <Reveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-[#666660]">
                Interactive Restoration Studio
              </p>
              <h2 className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-normal leading-[1.04] tracking-[-0.03em] text-[#111111]">
                Restore a Screenshot.
              </h2>
            </div>

            <div className="lg:col-span-5 lg:flex lg:flex-col lg:items-end">
              {/* Honest Backend Connection Pill */}
              <div className="inline-flex flex-wrap items-center gap-3 border border-[#111111]/18 bg-[#F8F8F6] px-4 py-2.5">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    backendHealth.connected ? 'bg-emerald-600' : 'bg-[#2563EB]'
                  }`}
                />
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#111111]">
                  {backendHealth.connected
                    ? `OpenCV Backend Online · ${backendHealth.engineName}`
                    : 'Client Preview Mode · FastAPI Backend Offline'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowBackendConfig((prev) => !prev)}
                  className="ml-1 inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[#666660] underline underline-offset-4 hover:text-[#111111]"
                >
                  <Server className="h-3 w-3" />
                  <span>{showBackendConfig ? 'Hide API' : 'API Config'}</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Collapsible FastAPI Endpoint Configuration Drawer */}
        {showBackendConfig && (
          <div className="mt-6 border border-[#111111]/18 bg-[#FFFFFF] p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <label
                  htmlFor="fastapi-endpoint"
                  className="block font-mono text-[11px] tracking-[0.14em] uppercase text-[#666660]"
                >
                  Python FastAPI Endpoint (OpenCV processing)
                </label>
                <input
                  id="fastapi-endpoint"
                  type="url"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="mt-2 w-full border border-[#111111]/25 bg-[#F8F8F6] px-3.5 py-2.5 font-mono text-xs text-[#111111] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 md:col-span-5">
                <button
                  type="button"
                  onClick={() => refreshHealth(apiEndpoint)}
                  className="inline-flex items-center gap-2 border border-[#111111] bg-[#111111] px-4 py-2.5 font-mono text-[11px] tracking-[0.12em] uppercase text-[#F8F8F6] transition-colors hover:bg-[#2563EB] hover:border-[#2563EB]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Verify Connection</span>
                </button>
                <span className="font-mono text-[11px] text-[#666660]">
                  {backendHealth.connected
                    ? 'Connected (POST /api/v1/restore)'
                    : backendHealth.error
                    ? `Offline (${backendHealth.error})`
                    : 'No server connected'}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#555550]">
              PixelRevive separates UI preview from actual neural inference.
              Without a connected FastAPI server, the Studio runs a deterministic
              local browser Canvas preview and labels exports accordingly. Start
              the included <code className="font-mono">backend/main.py</code>{' '}
              service to run OpenCV denoising, Lanczos resizing, and sharpening. This backend does not use an AI model.
            </p>
          </div>
        )}

        {/* Main Studio Workspace */}
        <div className="mt-10 grid grid-cols-1 border border-[#111111]/16 bg-[#FFFFFF] lg:grid-cols-12">
          {/* Left Column: Controls, Dropzone & Metadata */}
          <div className="flex flex-col justify-between border-b border-[#111111]/14 p-6 md:p-8 lg:col-span-4 lg:border-r lg:border-b-0">
            <div className="space-y-8">
              {/* Step 1: Upload */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#666660]">
                    01 · Source Screenshot
                  </span>
                  {sourceFile && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#2563EB] underline underline-offset-4 hover:text-[#111111]"
                    >
                      Replace
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileInputChange}
                  className="sr-only"
                  aria-label="Upload screenshot file"
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleDrop}
                  className={`mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isDraggingOver
                      ? 'border-[#2563EB] bg-[#2563EB]/5'
                      : 'border-[#111111]/25 bg-[#F8F8F6] hover:border-[#111111]'
                  }`}
                >
                  <Upload className="h-5 w-5 stroke-[1.5] text-[#111111]" />
                  <p className="mt-3 text-sm font-medium text-[#111111]">
                    Drop screenshot here or browse
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[#666660]">
                    PNG, JPG or WebP · Max precision
                  </p>
                </div>

                {/* Sample Presets */}
                <div className="mt-4">
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#666660]">
                    Or load a legacy sample:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SAMPLE_PRESETS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleLoadSample(sample.id)}
                        className="border border-[#111111]/18 bg-[#F8F8F6] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-[#111111] transition-colors hover:border-[#111111] hover:bg-[#111111] hover:text-[#F8F8F6]"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* File Specs */}
              {sourceFile && (
                <div className="border-t border-[#111111]/12 pt-6">
                  <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#666660]">
                    Input Telemetry
                  </span>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#666660]">Filename</dt>
                      <dd className="truncate font-mono text-[#111111]">
                        {sourceFile.name}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#666660]">Original Size</dt>
                      <dd className="font-mono text-[#111111]">
                        {sourceDims
                          ? `${sourceDims.width} × ${sourceDims.height}px`
                          : 'Reading...'}{' '}
                        · {formatFileSize(sourceFile.size)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#666660]">Target Output</dt>
                      <dd className="font-mono text-[#2563EB]">
                        {targetDimsLabel}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Step 2: Scale & Preservation Options */}
              <div className="border-t border-[#111111]/12 pt-6">
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#666660]">
                  02 · Enhancement Scale
                </span>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([2, 4] as RestorationScale[]).map((factor) => {
                    const active = scale === factor;
                    return (
                      <button
                        key={factor}
                        type="button"
                        onClick={() => setScale(factor)}
                        aria-pressed={active}
                        className={`flex flex-col items-start border px-4 py-3 text-left transition-colors duration-150 ${
                          active
                            ? 'border-[#111111] bg-[#111111] text-[#F8F8F6]'
                            : 'border-[#111111]/20 bg-[#F8F8F6] text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        <span className="font-display text-lg font-medium">
                          {factor}× Upscale
                        </span>
                        <span
                          className={`mt-0.5 font-mono text-[10px] uppercase ${
                            active ? 'text-[#F8F8F6]/70' : 'text-[#666660]'
                          }`}
                        >
                          {factor === 2 ? 'Docs & Web' : 'Retina & Print'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* UI Text Preservation Toggle */}
                <label className="mt-4 flex cursor-pointer items-center justify-between border border-[#111111]/14 bg-[#F8F8F6] px-4 py-3">
                  <span className="flex items-center gap-2.5 text-xs font-medium text-[#111111]">
                    <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.5]" />
                    <span>Preserve UI Text &amp; 1px Borders</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={preserveUiText}
                    onChange={(e) => setPreserveUiText(e.target.checked)}
                    className="h-4 w-4 accent-[#111111]"
                  />
                </label>
              </div>
            </div>

            {/* Step 3: Action Buttons */}
            <div className="mt-8 space-y-3 border-t border-[#111111]/12 pt-6">
              <button
                type="button"
                disabled={!sourceFile || isProcessing}
                onClick={handleRestore}
                className="flex w-full items-center justify-center gap-2.5 bg-[#111111] px-6 py-4 text-xs font-medium tracking-[0.14em] uppercase text-[#F8F8F6] transition-colors duration-200 hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:bg-[#111111]/30"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing {scale}×...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 stroke-[1.5]" />
                    <span>
                      {backendHealth.connected
                        ? 'Restore Image (AI)'
                        : 'Restore Image (Preview)'}
                    </span>
                  </>
                )}
              </button>

              {result && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-2.5 border border-[#111111] bg-[#FFFFFF] px-6 py-3.5 text-xs font-medium tracking-[0.14em] uppercase text-[#111111] transition-colors duration-200 hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  <Download className="h-4 w-4 stroke-[1.5]" />
                  <span>
                    Download {result.outputWidth}×{result.outputHeight} PNG
                  </span>
                </button>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2 border border-red-600/30 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Light-Table Canvas & Comparison Viewport */}
          <div className="flex flex-col justify-between p-6 md:p-8 lg:col-span-8">
            {/* Viewport Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#111111]/12 pb-4">
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: 'compare', label: 'Before / After Slider' },
                    { key: 'restored', label: 'Restored Output' },
                    { key: 'original', label: 'Original Preview' },
                  ] as { key: ViewerTab; label: string }[]
                ).map((tab) => {
                  const disabled =
                    (tab.key === 'compare' || tab.key === 'restored') && !result;
                  const active = viewerTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      disabled={disabled}
                      onClick={() => setViewerTab(tab.key)}
                      className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
                        active
                          ? 'bg-[#111111] text-[#F8F8F6]'
                          : 'text-[#666660] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-35'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {result && (
                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#666660]">
                  {result.originalWidth}×{result.originalHeight} →{' '}
                  <strong className="font-medium text-[#111111]">
                    {result.outputWidth}×{result.outputHeight}px
                  </strong>{' '}
                  · {result.processingTimeMs}ms
                </span>
              )}
            </div>

            {/* Viewport Stage */}
            <div className="studio-grid-bg relative flex min-h-[420px] flex-1 items-center justify-center border border-[#111111]/14 p-4 md:p-8">
              {!sourcePreviewUrl && (
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#111111]/20 bg-[#F8F8F6]">
                    <ImagePlus className="h-6 w-6 stroke-[1.25] text-[#111111]" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-normal tracking-[-0.02em] text-[#111111]">
                    Light Table Ready
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#555550]">
                    Upload any low-resolution product screenshot or load one of
                    the legacy presets on the left to inspect 2× or 4×
                    restoration.
                  </p>
                </div>
              )}

              {sourcePreviewUrl && (!result || viewerTab === 'original') && (
                <div className="w-full max-w-3xl">
                  <div className="relative overflow-hidden border border-[#111111]/20 bg-[#FFFFFF]">
                    <span className="absolute top-3 left-3 z-10 border border-[#111111]/15 bg-[#F8F8F6]/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[#111111]">
                      ORIGINAL INPUT
                    </span>
                    <img
                      src={sourcePreviewUrl}
                      alt="Uploaded original screenshot preview"
                      className="mx-auto max-h-[540px] w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {sourcePreviewUrl && result && viewerTab === 'compare' && (
                <div className="w-full max-w-3xl">
                  <BeforeAfterSlider
                    beforeSrc={sourcePreviewUrl}
                    afterSrc={result.restoredDataUrl}
                    beforeAlt="Original uploaded low-resolution screenshot"
                    afterAlt="Restored upscaled screenshot"
                    beforeLabel={`ORIGINAL · ${result.originalWidth}×${result.originalHeight}`}
                    afterLabel={
                      result.mode === 'fastapi-opencv'
                        ? `AI RESTORED · ${result.outputWidth}×${result.outputHeight}`
                        : `PREVIEW ${result.scale}X · ${result.outputWidth}×${result.outputHeight}`
                    }
                    initialPosition={50}
                    aspectClassName="aspect-[16/11]"
                    fitMode="contain"
                    pixelatedBefore={true}
                    className="bg-[#FFFFFF]"
                  />
                </div>
              )}

              {sourcePreviewUrl && result && viewerTab === 'restored' && (
                <div className="w-full max-w-3xl">
                  <div className="relative overflow-hidden border border-[#111111]/20 bg-[#FFFFFF]">
                    <span className="absolute top-3 right-3 z-10 bg-[#111111]/90 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[#F8F8F6]">
                      {result.mode === 'fastapi-opencv'
                        ? `AI RESTORED · ${result.scale}X`
                        : `BROWSER PREVIEW · ${result.scale}X`}
                    </span>
                    <img
                      src={result.restoredDataUrl}
                      alt="Restored output screenshot"
                      className="mx-auto max-h-[540px] w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Honest Mode & Pipeline Banner */}
            <div className="mt-5">
              {result ? (
                <div
                  className={`flex items-start gap-3 border px-4 py-3.5 text-xs leading-relaxed ${
                    result.mode === 'fastapi-opencv'
                      ? 'border-emerald-700/30 bg-emerald-50/60 text-emerald-950'
                      : 'border-[#2563EB]/30 bg-[#2563EB]/[0.05] text-[#111111]'
                  }`}
                >
                  {result.mode === 'fastapi-opencv' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                  )}
                  <div>
                    <p className="font-mono text-[11px] font-medium tracking-[0.1em] uppercase">
                      {result.pipelineLabel}
                    </p>
                    <p className="mt-0.5 text-[#444440]">{result.note}</p>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#666660]">
                  Ready · Modular adapter supports FastAPI + OpenCV classical processing
                  when connected, or transparent browser preview offline.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
