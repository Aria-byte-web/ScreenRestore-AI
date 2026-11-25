/**
 * Deterministic Canvas renderer for PixelRevive's showcase & hero comparisons.
 * Draws ultra-crisp product UI screenshots at high resolution (After),
 * and generates authentic low-resolution, noisy, soft-focus legacy PNGs (Before)
 * so every pixel, glyph, icon, and chart line aligns 1:1 across sliders.
 */

export type ShowcaseId = 'hero' | 'dashboard' | 'website' | 'mobile' | 'docs' | 'specimen';

export interface RenderedSpecimen {
  id: ShowcaseId;
  title: string;
  category: string;
  caption: string;
  beforeDims: string;
  afterDims: string;
  beforeUrl: string;
  afterUrl: string;
  lowResBlob: Blob;
  highResBlob: Blob;
}

const cache = new Map<ShowcaseId, Promise<RenderedSpecimen>>();

const SPECIMEN_META: Record<
  ShowcaseId,
  {
    title: string;
    category: string;
    caption: string;
    width: number;
    height: number;
    downscaleFactor: number;
  }
> = {
  hero: {
    title: 'Vanguard Telemetry Console',
    category: 'Product Interface',
    caption: '4x super-resolution restoration preserving 11px tabular typography and 1px grid rules.',
    width: 1520,
    height: 950,
    downscaleFactor: 0.24,
  },
  dashboard: {
    title: 'Meridian Analytics Suite',
    category: 'Software Dashboard',
    caption: 'Legacy enterprise dashboard recovered from 320px compressed export to 4x clarity.',
    width: 1080,
    height: 1260,
    downscaleFactor: 0.25,
  },
  website: {
    title: 'Atelier Web Platform',
    category: 'Legacy Website',
    caption: 'Archived marketing & pricing interface restored with sharp editorial typography.',
    width: 1080,
    height: 1260,
    downscaleFactor: 0.25,
  },
  mobile: {
    title: 'Kinetix Mobile Ledger',
    category: 'Mobile Application',
    caption: 'Retina-grade recovery of legacy iOS screen captures, icons, and financial figures.',
    width: 1080,
    height: 1260,
    downscaleFactor: 0.24,
  },
  docs: {
    title: 'Core API Architecture Docs',
    category: 'Product Documentation',
    caption: 'Technical diagrams, monospace code blocks, and callouts restored without halo artifacts.',
    width: 1080,
    height: 1260,
    downscaleFactor: 0.25,
  },
  specimen: {
    title: 'Micro-Typography & Vector Edge Study',
    category: 'Detail Preservation',
    caption: 'Close-range inspection of 1px icons, kerning pairs, and border hairlines.',
    width: 1280,
    height: 860,
    downscaleFactor: 0.22,
  },
};

export function getSpecimen(id: ShowcaseId): Promise<RenderedSpecimen> {
  const existing = cache.get(id);
  if (existing) return existing;

  const promise = renderSpecimenInternal(id);
  cache.set(id, promise);
  return promise;
}

export async function getSampleFile(id: ShowcaseId): Promise<File> {
  const specimen = await getSpecimen(id);
  return new File([specimen.lowResBlob], `legacy-${id}-sample.png`, {
    type: 'image/png',
  });
}

async function renderSpecimenInternal(id: ShowcaseId): Promise<RenderedSpecimen> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  const meta = SPECIMEN_META[id];
  const hiCanvas = document.createElement('canvas');
  hiCanvas.width = meta.width;
  hiCanvas.height = meta.height;
  const ctx = hiCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  // Render crisp high-resolution master UI
  switch (id) {
    case 'hero':
      drawHeroConsole(ctx, meta.width, meta.height);
      break;
    case 'dashboard':
      drawDashboardUI(ctx, meta.width, meta.height);
      break;
    case 'website':
      drawWebsiteUI(ctx, meta.width, meta.height);
      break;
    case 'mobile':
      drawMobileUI(ctx, meta.width, meta.height);
      break;
    case 'docs':
      drawDocsUI(ctx, meta.width, meta.height);
      break;
    case 'specimen':
      drawSpecimenUI(ctx, meta.width, meta.height);
      break;
  }

  // Create authentic low-resolution degraded version
  const lowW = Math.round(meta.width * meta.downscaleFactor);
  const lowH = Math.round(meta.height * meta.downscaleFactor);

  const lowCanvas = document.createElement('canvas');
  lowCanvas.width = lowW;
  lowCanvas.height = lowH;
  const lowCtx = lowCanvas.getContext('2d')!;
  lowCtx.imageSmoothingEnabled = true;
  lowCtx.imageSmoothingQuality = 'low';
  lowCtx.filter = 'blur(0.75px) contrast(0.94)';
  lowCtx.drawImage(hiCanvas, 0, 0, lowW, lowH);
  lowCtx.filter = 'none';

  // Add subtle deterministic sensor / JPEG-style grain to the low-res capture
  addLegacyNoise(lowCtx, lowW, lowH, 9);

  // Upscale low-res back to display canvas with blurry + blocky legacy interpolation
  const beforeDisplayCanvas = document.createElement('canvas');
  beforeDisplayCanvas.width = meta.width;
  beforeDisplayCanvas.height = meta.height;
  const bCtx = beforeDisplayCanvas.getContext('2d')!;
  bCtx.imageSmoothingEnabled = true;
  bCtx.imageSmoothingQuality = 'low';
  bCtx.filter = 'blur(1.2px)';
  bCtx.drawImage(lowCanvas, 0, 0, meta.width, meta.height);
  bCtx.filter = 'none';

  const [highResBlob, beforeDisplayBlob, lowResBlob] = await Promise.all([
    canvasToBlob(hiCanvas, 'image/png'),
    canvasToBlob(beforeDisplayCanvas, 'image/png'),
    canvasToBlob(lowCanvas, 'image/png'),
  ]);

  return {
    id,
    title: meta.title,
    category: meta.category,
    caption: meta.caption,
    beforeDims: `${lowW} × ${lowH}px`,
    afterDims: `${meta.width} × ${meta.height}px`,
    beforeUrl: URL.createObjectURL(beforeDisplayBlob),
    afterUrl: URL.createObjectURL(highResBlob),
    lowResBlob,
    highResBlob,
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas encoding failed'));
    }, type);
  });
}

function addLegacyNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  let seed = 1337;
  for (let i = 0; i < d.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const n = ((seed % (intensity * 2 + 1)) - intensity) | 0;
    d[i] = clampByte(d[i] + n);
    d[i + 1] = clampByte(d[i + 1] + n);
    d[i + 2] = clampByte(d[i + 2] + n);
  }
  ctx.putImageData(imgData, 0, 0);
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* ============================================================================
   1. HERO CONSOLE (1520 x 950)
   ============================================================================ */
function drawHeroConsole(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Warm dark slate outer studio backdrop
  ctx.fillStyle = '#ECECE8';
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural grid on backdrop
  ctx.strokeStyle = 'rgba(17,17,17,0.04)';
  ctx.lineWidth = 1;
  for (let x = 40; x < w; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Main macOS / Desktop Window Frame
  const winX = 64;
  const winY = 56;
  const winW = w - 128;
  const winH = h - 112;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(winX, winY, winW, winH);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(winX, winY, winW, winH);

  // Top Window Chrome
  ctx.fillStyle = '#F7F7F5';
  ctx.fillRect(winX, winY, winW, 54);
  ctx.strokeStyle = 'rgba(17,17,17,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(winX, winY + 54);
  ctx.lineTo(winX + winW, winY + 54);
  ctx.stroke();

  // Window Traffic Dots
  ['#111111', '#9A9A96', '#D4D4D0'].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(winX + 28 + i * 18, winY + 27, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Top Bar Breadcrumb
  ctx.fillStyle = '#111111';
  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillText('Vanguard Telemetry  /  Production Cluster EU-West', winX + 105, winY + 32);

  ctx.fillStyle = '#2563EB';
  ctx.fillRect(winX + winW - 154, winY + 14, 128, 26);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText('LIVE · 99.98%', winX + winW - 138, winY + 31);

  // Left Sidebar
  const sideW = 248;
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(winX + 1, winY + 55, sideW, winH - 56);
  ctx.strokeStyle = 'rgba(17,17,17,0.1)';
  ctx.beginPath();
  ctx.moveTo(winX + sideW, winY + 55);
  ctx.lineTo(winX + sideW, winY + winH);
  ctx.stroke();

  const navItems = [
    'Overview',
    'Latency & SLA',
    'Release Audit',
    'Edge Nodes',
    'Error Budgets',
    'API Tokens',
    'Billing Ledger',
  ];
  navItems.forEach((label, idx) => {
    const ny = winY + 94 + idx * 46;
    if (idx === 0) {
      ctx.fillStyle = '#111111';
      ctx.fillRect(winX + 18, ny - 22, sideW - 36, 36);
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = '#444440';
    }
    ctx.font = idx === 0 ? '500 14px "Inter", sans-serif' : '400 14px "Inter", sans-serif';
    ctx.fillText(label, winX + 34, ny);
  });

  // Main Content Area
  const mainX = winX + sideW + 44;
  const mainW = winW - sideW - 88;
  let curY = winY + 104;

  ctx.fillStyle = '#111111';
  ctx.font = '500 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText('System Performance & Revenue', mainX, curY);

  ctx.fillStyle = '#6B6B66';
  ctx.font = '400 14px "Inter", sans-serif';
  ctx.fillText('Q3 Consolidated Snapshot · UTC 14:20:00 · Build #4092', mainX, curY + 26);

  // 3 KPI Blocks
  curY += 58;
  const kpiW = (mainW - 40) / 3;
  const kpis = [
    { label: 'MONTHLY RECURRING', value: '$148,920', delta: '+18.4% vs prior', accent: '#2563EB' },
    { label: 'P95 API LATENCY', value: '14.2 ms', delta: '-3.1 ms improved', accent: '#111111' },
    { label: 'ACTIVE WORKSPACES', value: '12,480', delta: '99.98% uptime', accent: '#111111' },
  ];

  kpis.forEach((kpi, i) => {
    const kx = mainX + i * (kpiW + 20);
    ctx.fillStyle = '#F8F8F6';
    ctx.fillRect(kx, curY, kpiW, 118);
    ctx.strokeStyle = 'rgba(17,17,17,0.14)';
    ctx.strokeRect(kx, curY, kpiW, 118);

    ctx.fillStyle = '#6B6B66';
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.fillText(kpi.label, kx + 22, curY + 32);

    ctx.fillStyle = '#111111';
    ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(kpi.value, kx + 22, curY + 76);

    ctx.fillStyle = kpi.accent;
    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillText(kpi.delta, kx + 22, curY + 100);
  });

  // Chart Box
  curY += 146;
  const chartH = 264;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(mainX, curY, mainW, chartH);
  ctx.strokeStyle = 'rgba(17,17,17,0.14)';
  ctx.strokeRect(mainX, curY, mainW, chartH);

  ctx.fillStyle = '#111111';
  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillText('Throughput & Request Volume (req/sec)', mainX + 24, curY + 34);

  // Horizontal grid lines & labels
  const plotX = mainX + 70;
  const plotY = curY + 62;
  const plotW = mainW - 104;
  const plotH = 165;
  ['120k', '90k', '60k', '30k'].forEach((tick, i) => {
    const ty = plotY + (i * plotH) / 3;
    ctx.strokeStyle = 'rgba(17,17,17,0.08)';
    ctx.beginPath();
    ctx.moveTo(plotX, ty);
    ctx.lineTo(plotX + plotW, ty);
    ctx.stroke();

    ctx.fillStyle = '#777772';
    ctx.font = '400 11px "IBM Plex Mono", monospace';
    ctx.fillText(tick, mainX + 24, ty + 4);
  });

  // Crisp Primary Line + Area
  const pts = [0.68, 0.62, 0.54, 0.58, 0.44, 0.48, 0.35, 0.31, 0.25, 0.28, 0.16, 0.12];
  ctx.beginPath();
  pts.forEach((p, i) => {
    const px = plotX + (i / (pts.length - 1)) * plotW;
    const py = plotY + p * plotH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Secondary electric blue baseline
  const pts2 = [0.82, 0.78, 0.75, 0.79, 0.69, 0.65, 0.61, 0.56, 0.51, 0.49, 0.43, 0.39];
  ctx.beginPath();
  pts2.forEach((p, i) => {
    const px = plotX + (i / (pts2.length - 1)) * plotW;
    const py = plotY + p * plotH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data nodes
  pts.forEach((p, i) => {
    const px = plotX + (i / (pts.length - 1)) * plotW;
    const py = plotY + p * plotH;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Release Table
  curY += chartH + 26;
  const rows = [
    ['REL-4092', 'core-gateway-eu', '200 OK · 12ms', 'Verified', '14:18 UTC'],
    ['REL-4091', 'billing-worker-v4', '200 OK · 18ms', 'Verified', '13:42 UTC'],
    ['REL-4090', 'edge-cache-sync', '200 OK · 09ms', 'Verified', '12:05 UTC'],
  ];

  ctx.fillStyle = '#111111';
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText('BUILD ID', mainX, curY);
  ctx.fillText('SERVICE', mainX + 180, curY);
  ctx.fillText('HEALTH', mainX + 460, curY);
  ctx.fillText('STATUS', mainX + 700, curY);
  ctx.fillText('TIMESTAMP', mainX + 860, curY);

  rows.forEach((row, rIdx) => {
    const ry = curY + 20 + rIdx * 44;
    ctx.strokeStyle = 'rgba(17,17,17,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mainX, ry);
    ctx.lineTo(mainX + mainW, ry);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '500 13px "IBM Plex Mono", monospace';
    ctx.fillText(row[0], mainX, ry + 28);
    ctx.font = '400 14px "Inter", sans-serif';
    ctx.fillText(row[1], mainX + 180, ry + 28);
    ctx.fillStyle = '#555550';
    ctx.fillText(row[2], mainX + 460, ry + 28);
    ctx.fillStyle = '#2563EB';
    ctx.font = '500 13px "Inter", sans-serif';
    ctx.fillText(row[3], mainX + 700, ry + 28);
    ctx.fillStyle = '#6B6B66';
    ctx.font = '400 13px "IBM Plex Mono", monospace';
    ctx.fillText(row[4], mainX + 860, ry + 28);
  });
}

/* ============================================================================
   2. DASHBOARD UI (1080 x 1260)
   ============================================================================ */
function drawDashboardUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#F2F2EF';
  ctx.fillRect(0, 0, w, h);

  const pad = 52;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  // Header
  ctx.fillStyle = '#111111';
  ctx.fillRect(pad, pad, w - pad * 2, 74);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MERIDIAN LEDGER · v3.8', pad + 36, pad + 44);
  ctx.font = '400 13px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#A8A8A4';
  ctx.fillText('FISCAL Q4  ·  USD', w - pad - 180, pad + 44);

  const innerX = pad + 42;
  const innerW = w - (pad + 42) * 2;
  let y = pad + 132;

  ctx.fillStyle = '#111111';
  ctx.font = '500 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Net Operating Margin', innerX, y);
  ctx.fillStyle = '#2563EB';
  ctx.font = '600 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('$4,820,410.00', innerX, y + 60);
  ctx.fillStyle = '#6B6B66';
  ctx.font = '400 15px "Inter", sans-serif';
  ctx.fillText('Consolidated across 14 operating entities (+12.6% YoY)', innerX, y + 92);

  // Bar Chart
  y += 140;
  ctx.fillStyle = '#F8F8F6';
  ctx.fillRect(innerX, y, innerW, 330);
  ctx.strokeStyle = 'rgba(17,17,17,0.14)';
  ctx.strokeRect(innerX, y, innerW, 330);

  const bars = [0.42, 0.56, 0.49, 0.68, 0.61, 0.77, 0.72, 0.88, 0.81, 0.94];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];
  const barGap = 24;
  const barW = (innerW - 80 - barGap * (bars.length - 1)) / bars.length;

  bars.forEach((val, i) => {
    const bx = innerX + 40 + i * (barW + barGap);
    const bh = val * 200;
    const by = y + 255 - bh;
    ctx.fillStyle = i === bars.length - 1 ? '#2563EB' : '#111111';
    ctx.fillRect(bx, by, barW, bh);

    ctx.fillStyle = '#666660';
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.fillText(months[i], bx + 8, y + 286);
  });

  // Ledger Breakdown Table
  y += 374;
  ctx.fillStyle = '#111111';
  ctx.font = '600 16px "Inter", sans-serif';
  ctx.fillText('Regional Breakdown', innerX, y);

  const ledger = [
    ['North America Enterprise', '$2,140,800', '+14.2%', 'Settled'],
    ['EMEA Institutional', '$1,482,300', '+11.8%', 'Settled'],
    ['APAC Cloud Core', '$894,110', '+19.1%', 'Pending'],
    ['Latin America Direct', '$303,200', '+6.4%', 'Settled'],
  ];

  ledger.forEach((row, idx) => {
    const ry = y + 32 + idx * 92;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(innerX, ry, innerW, 74);
    ctx.strokeStyle = 'rgba(17,17,17,0.14)';
    ctx.strokeRect(innerX, ry, innerW, 74);

    ctx.fillStyle = '#111111';
    ctx.font = '500 17px "Inter", sans-serif';
    ctx.fillText(row[0], innerX + 24, ry + 43);

    ctx.font = '500 17px "IBM Plex Mono", monospace';
    ctx.fillText(row[1], innerX + 420, ry + 43);

    ctx.fillStyle = '#2563EB';
    ctx.fillText(row[2], innerX + 610, ry + 43);

    ctx.fillStyle = '#6B6B66';
    ctx.font = '400 14px "Inter", sans-serif';
    ctx.fillText(row[3], innerX + 750, ry + 43);
  });
}

/* ============================================================================
   3. LEGACY WEBSITE INTERFACE (1080 x 1260)
   ============================================================================ */
function drawWebsiteUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#E8E8E4';
  ctx.fillRect(0, 0, w, h);

  const pad = 48;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  // Browser URL bar
  ctx.fillStyle = '#F7F7F5';
  ctx.fillRect(pad, pad, w - pad * 2, 54);
  ctx.strokeStyle = 'rgba(17,17,17,0.12)';
  ctx.beginPath();
  ctx.moveTo(pad, pad + 54);
  ctx.lineTo(w - pad, pad + 54);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(pad + 180, pad + 12, 540, 30);
  ctx.strokeRect(pad + 180, pad + 12, 540, 30);
  ctx.fillStyle = '#555550';
  ctx.font = '400 13px "IBM Plex Mono", monospace';
  ctx.fillText('https://ateliercloud.io/platform/v2', pad + 200, pad + 32);

  // Page Navbar
  const px = pad + 54;
  const pw = w - (pad + 54) * 2;
  let y = pad + 114;

  ctx.fillStyle = '#111111';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ATELIER', px, y);
  ctx.font = '400 14px "Inter", sans-serif';
  ctx.fillText('Platform     Pricing     Docs     Sign In', w - pad - 310, y);

  ctx.strokeStyle = 'rgba(17,17,17,0.14)';
  ctx.beginPath();
  ctx.moveTo(px, y + 26);
  ctx.lineTo(px + pw, y + 26);
  ctx.stroke();

  // Editorial Web Hero
  y += 116;
  ctx.fillStyle = '#2563EB';
  ctx.font = '500 13px "IBM Plex Mono", monospace';
  ctx.fillText('RELEASE 2.0  ·  DESIGN INFRASTRUCTURE', px, y);

  ctx.fillStyle = '#111111';
  ctx.font = '600 58px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Ship interfaces at', px, y + 70);
  ctx.fillText('typographic precision.', px, y + 136);

  ctx.fillStyle = '#555550';
  ctx.font = '400 20px "Inter", sans-serif';
  ctx.fillText('Unified design tokens, versioned component kits, and', px, y + 190);
  ctx.fillText('automated visual regression across every deployment.', px, y + 220);

  // CTA buttons
  ctx.fillStyle = '#111111';
  ctx.fillRect(px, y + 258, 210, 54);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillText('Start Free Trial', px + 46, y + 291);

  ctx.strokeStyle = '#111111';
  ctx.strokeRect(px + 230, y + 258, 200, 54);
  ctx.fillStyle = '#111111';
  ctx.fillText('Read Changelog', px + 268, y + 291);

  // Feature Preview Strip
  y += 364;
  const colW = (pw - 32) / 2;
  [
    {
      num: '01 / TOKENS',
      title: 'Sub-pixel token sync',
      desc: 'Compile Figma variables directly into CSS custom properties with zero drift.',
    },
    {
      num: '02 / DIFF',
      title: 'Visual snapshots',
      desc: 'Compare every commit against baseline frames at 4K density.',
    },
  ].forEach((card, i) => {
    const cx = px + i * (colW + 32);
    ctx.fillStyle = '#F8F8F6';
    ctx.fillRect(cx, y, colW, 330);
    ctx.strokeStyle = 'rgba(17,17,17,0.14)';
    ctx.strokeRect(cx, y, colW, 330);

    ctx.fillStyle = '#6B6B66';
    ctx.font = '500 12px "IBM Plex Mono", monospace';
    ctx.fillText(card.num, cx + 32, y + 48);

    ctx.fillStyle = '#111111';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(card.title, cx + 32, y + 104);

    ctx.fillStyle = '#444440';
    ctx.font = '400 16px "Inter", sans-serif';
    ctx.fillText(card.desc.slice(0, 40), cx + 32, y + 154);
    ctx.fillText(card.desc.slice(40), cx + 32, y + 180);

    // Mini graphic inside card
    ctx.fillStyle = i === 0 ? '#111111' : '#2563EB';
    ctx.fillRect(cx + 32, y + 232, colW - 64, 62);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 13px "IBM Plex Mono", monospace';
    ctx.fillText(i === 0 ? '--color-ink: #111111;' : 'DIFF: 0.00% DRIFT', cx + 52, y + 268);
  });
}

/* ============================================================================
   4. MOBILE APPLICATION SCREENSHOT (1080 x 1260)
   ============================================================================ */
function drawMobileUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#EAEAE6';
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural framing lines
  ctx.strokeStyle = 'rgba(17,17,17,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, w - 96, h - 96);

  // Centered Smartphone Screen
  const phoneW = 540;
  const phoneH = 1080;
  const px = (w - phoneW) / 2;
  const py = (h - phoneH) / 2;

  ctx.fillStyle = '#111111';
  drawRoundedRect(ctx, px - 14, py - 14, phoneW + 28, phoneH + 28, 44);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, px, py, phoneW, phoneH, 32);
  ctx.fill();

  // Status bar
  ctx.fillStyle = '#111111';
  ctx.font = '600 16px "Inter", sans-serif';
  ctx.fillText('9:41', px + 36, py + 42);
  ctx.font = '500 14px "IBM Plex Mono", monospace';
  ctx.fillText('5G   100%', px + phoneW - 122, py + 42);

  // App Header
  ctx.font = '500 14px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#6B6B66';
  ctx.fillText('KINETIX TREASURY', px + 36, py + 102);

  ctx.fillStyle = '#111111';
  ctx.font = '600 46px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('$84,290.50', px + 36, py + 162);

  ctx.fillStyle = '#2563EB';
  ctx.font = '500 15px "Inter", sans-serif';
  ctx.fillText('+4.82% (+$3,872.10) this month', px + 36, py + 198);

  // Virtual Card
  const cardY = py + 240;
  ctx.fillStyle = '#111111';
  drawRoundedRect(ctx, px + 36, cardY, phoneW - 72, 210, 16);
  ctx.fill();

  ctx.fillStyle = '#9A9A96';
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText('CORPORATE RESERVE', px + 64, cardY + 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillText('4921  ••••  ••••  8840', px + 64, cardY + 128);
  ctx.font = '400 14px "Inter", sans-serif';
  ctx.fillText('EXP 09/29   VALID', px + 64, cardY + 174);

  // Action Pills
  const actY = cardY + 244;
  ['Transfer', 'Deposit', 'Statements'].forEach((act, i) => {
    const ax = px + 36 + i * 160;
    ctx.fillStyle = '#F8F8F6';
    ctx.fillRect(ax, actY, 144, 48);
    ctx.strokeStyle = 'rgba(17,17,17,0.16)';
    ctx.strokeRect(ax, actY, 144, 48);
    ctx.fillStyle = '#111111';
    ctx.font = '500 14px "Inter", sans-serif';
    ctx.fillText(act, ax + 34, actY + 30);
  });

  // Transactions
  let ty = actY + 96;
  ctx.fillStyle = '#111111';
  ctx.font = '600 16px "Inter", sans-serif';
  ctx.fillText('Recent Activity', px + 36, ty);

  const txns = [
    ['AWS Cloud Services', 'Infrastructure · 10:14 AM', '-$2,410.00'],
    ['Stripe Settlement', 'Payout #8831 · Yesterday', '+$18,920.00'],
    ['Linear Workspace', 'Software · Nov 22', '-$320.00'],
    ['Figma Organization', 'Design Tools · Nov 20', '-$540.00'],
  ];

  txns.forEach((t, idx) => {
    const rowY = ty + 28 + idx * 88;
    ctx.strokeStyle = 'rgba(17,17,17,0.1)';
    ctx.beginPath();
    ctx.moveTo(px + 36, rowY);
    ctx.lineTo(px + phoneW - 36, rowY);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '500 16px "Inter", sans-serif';
    ctx.fillText(t[0], px + 36, rowY + 36);

    ctx.fillStyle = '#6B6B66';
    ctx.font = '400 13px "Inter", sans-serif';
    ctx.fillText(t[1], px + 36, rowY + 60);

    ctx.fillStyle = t[2].startsWith('+') ? '#2563EB' : '#111111';
    ctx.font = '500 16px "IBM Plex Mono", monospace';
    ctx.fillText(t[2], px + phoneW - 165, rowY + 42);
  });
}

/* ============================================================================
   5. PRODUCT DOCUMENTATION IMAGE (1080 x 1260)
   ============================================================================ */
function drawDocsUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#EFEFEB';
  ctx.fillRect(0, 0, w, h);

  const pad = 48;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  // Left Docs TOC
  const tocW = 240;
  ctx.fillStyle = '#F8F8F6';
  ctx.fillRect(pad + 1, pad + 1, tocW, h - pad * 2 - 2);
  ctx.strokeStyle = 'rgba(17,17,17,0.12)';
  ctx.beginPath();
  ctx.moveTo(pad + tocW, pad);
  ctx.lineTo(pad + tocW, h - pad);
  ctx.stroke();

  ctx.fillStyle = '#111111';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SDK v3.2 Reference', pad + 28, pad + 58);

  const sections = [
    'Introduction',
    'Authentication',
    'POST /v1/restore',
    'Scale Parameters',
    'Webhook Events',
    'Error Codes',
    'OpenCV Pipeline',
  ];
  sections.forEach((sec, idx) => {
    const sy = pad + 114 + idx * 44;
    ctx.fillStyle = idx === 2 ? '#2563EB' : '#555550';
    ctx.font = idx === 2 ? '600 14px "Inter", sans-serif' : '400 14px "Inter", sans-serif';
    ctx.fillText(sec, pad + 28, sy);
  });

  // Main Documentation Body
  const dx = pad + tocW + 46;
  const dw = w - pad - dx - 46;
  let y = pad + 72;

  ctx.fillStyle = '#2563EB';
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText('ENDPOINT SPECIFICATION', dx, y);

  ctx.fillStyle = '#111111';
  ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Restore Legacy Screenshot', dx, y + 48);

  ctx.fillStyle = '#444440';
  ctx.font = '400 16px "Inter", sans-serif';
  ctx.fillText('Upscales raster captures 2x or 4x while preserving glyph', dx, y + 88);
  ctx.fillText('geometry, 1px vector borders, and UI iconography.', dx, y + 114);

  // Code Block
  y += 156;
  ctx.fillStyle = '#111111';
  ctx.fillRect(dx, y, dw, 286);

  const codeLines = [
    { color: '#9A9A96', text: '// Request: POST /api/v1/restore' },
    { color: '#F8F8F6', text: 'const form = new FormData();' },
    { color: '#F8F8F6', text: 'form.append("file", legacyScreenshot);' },
    { color: '#60A5FA', text: 'form.append("scale", "4");' },
    { color: '#60A5FA', text: 'form.append("preserve_ui_text", "true");' },
    { color: '#F8F8F6', text: '' },
    { color: '#F8F8F6', text: 'const res = await fetch(API_URL, {' },
    { color: '#F8F8F6', text: '  method: "POST", body: form' },
    { color: '#F8F8F6', text: '});' },
  ];
  codeLines.forEach((line, i) => {
    ctx.fillStyle = line.color;
    ctx.font = '400 15px "IBM Plex Mono", monospace';
    ctx.fillText(line.text, dx + 28, y + 46 + i * 26);
  });

  // Pipeline Architecture Diagram
  y += 332;
  ctx.fillStyle = '#111111';
  ctx.font = '600 16px "Inter", sans-serif';
  ctx.fillText('Restoration Pipeline Architecture', dx, y);

  const nodes = [
    { title: '01. Ingest', sub: 'PNG / JPG / WEBP' },
    { title: '02. Denoise', sub: 'OpenCV NLM Pass' },
    { title: '03. Upscale', sub: 'Upscale 4x' },
  ];

  const boxW = (dw - 48) / 3;
  nodes.forEach((node, i) => {
    const bx = dx + i * (boxW + 24);
    const by = y + 28;
    ctx.fillStyle = '#F8F8F6';
    ctx.fillRect(bx, by, boxW, 130);
    ctx.strokeStyle = i === 2 ? '#2563EB' : '#111111';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, boxW, 130);

    ctx.fillStyle = '#111111';
    ctx.font = '600 16px "Inter", sans-serif';
    ctx.fillText(node.title, bx + 20, by + 56);

    ctx.fillStyle = '#6B6B66';
    ctx.font = '400 12px "IBM Plex Mono", monospace';
    ctx.fillText(node.sub, bx + 20, by + 88);
  });

  // Parameter Table
  y += 206;
  const params = [
    ['scale', '2 | 4', 'Target resolution multiplier'],
    ['denoise_strength', '0.0 – 1.0', 'Compression artifact suppression'],
    ['preserve_ui_text', 'boolean', 'High-frequency glyph sharpening'],
  ];
  params.forEach((p, i) => {
    const py = y + i * 56;
    ctx.strokeStyle = 'rgba(17,17,17,0.12)';
    ctx.beginPath();
    ctx.moveTo(dx, py);
    ctx.lineTo(dx + dw, py);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '500 14px "IBM Plex Mono", monospace';
    ctx.fillText(p[0], dx, py + 34);
    ctx.fillStyle = '#2563EB';
    ctx.fillText(p[1], dx + 200, py + 34);
    ctx.fillStyle = '#555550';
    ctx.font = '400 14px "Inter", sans-serif';
    ctx.fillText(p[2], dx + 320, py + 34);
  });
}

/* ============================================================================
   6. MICRO-TYPOGRAPHY & EDGE SPECIMEN (1280 x 860)
   ============================================================================ */
function drawSpecimenUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, w, h);

  // Crisp inner white editorial card
  const pad = 56;
  ctx.fillStyle = '#F8F8F6';
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);

  const ix = pad + 56;
  const iw = w - (pad + 56) * 2;

  ctx.fillStyle = '#6B6B66';
  ctx.font = '500 13px "IBM Plex Mono", monospace';
  ctx.fillText('OPTICAL SPECIMEN · SUB-PIXEL GLYPH & HAIRLINE PRESERVATION', ix, pad + 68);

  ctx.fillStyle = '#111111';
  ctx.font = '500 74px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Aa Bb Cc 123.45', ix, pad + 188);

  ctx.strokeStyle = 'rgba(17,17,17,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ix, pad + 228);
  ctx.lineTo(ix + iw, pad + 228);
  ctx.stroke();

  // Dense UI precision grid
  const cols = [
    { code: 'GLYPH EDGE', val: '0.0px Halo', note: 'Crisp serif & sans stems' },
    { code: 'CHROMA NOISE', val: 'Removed', note: 'Flat UI surfaces restored' },
    { code: 'SCALE FACTOR', val: '4.0× Output', note: 'Zero layout distortion' },
  ];

  const colW = (iw - 48) / 3;
  cols.forEach((c, i) => {
    const cx = ix + i * (colW + 24);
    const cy = pad + 276;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx, cy, colW, 180);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, colW, 180);

    ctx.fillStyle = '#2563EB';
    ctx.font = '500 12px "IBM Plex Mono", monospace';
    ctx.fillText(c.code, cx + 26, cy + 44);

    ctx.fillStyle = '#111111';
    ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(c.val, cx + 26, cy + 100);

    ctx.fillStyle = '#555550';
    ctx.font = '400 14px "Inter", sans-serif';
    ctx.fillText(c.note, cx + 26, cy + 140);
  });

  // Micro icon & hairline bar
  const barY = pad + 510;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(ix, barY, iw, 160);
  ctx.strokeStyle = 'rgba(17,17,17,0.18)';
  ctx.strokeRect(ix, barY, iw, 160);

  ctx.fillStyle = '#111111';
  ctx.font = '500 14px "IBM Plex Mono", monospace';
  ctx.fillText('STATUS: 200 OK', ix + 34, barY + 54);
  ctx.fillText('CHECKPOINT: UPSCALE-4X', ix + 270, barY + 54);
  ctx.fillStyle = '#2563EB';
  ctx.fillText('UI INTEGRITY: 100%', ix + 640, barY + 54);

  // Waveform lines
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= iw - 68; x += 12) {
    const yOff = Math.sin(x * 0.045) * 16 + Math.cos(x * 0.11) * 8;
    if (x === 0) ctx.moveTo(ix + 34 + x, barY + 112 + yOff);
    else ctx.lineTo(ix + 34 + x, barY + 112 + yOff);
  }
  ctx.stroke();
}
