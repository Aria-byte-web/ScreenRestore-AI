/**
 * PixelRevive Modular Restoration Service
 *
 * Designed as an adapter boundary between the frontend Interactive Studio
 * and a Python FastAPI backend using classical OpenCV processing.
 *
 * When no backend URL responds, this service never simulates AI success —
 * it runs a transparent client-side Canvas preview upscale and explicitly
 * marks the result as `client-preview`.
 */

export type RestorationScale = 2 | 4;
export type RestorationMode = 'fastapi-opencv' | 'client-preview';

export interface BackendHealth {
  connected: boolean;
  endpoint: string;
  engineName: string;
  version?: string;
  checkedAt: number;
  error?: string;
}

export interface RestorationRequest {
  file: File;
  scale: RestorationScale;
  denoiseStrength?: number;
  preserveUiText?: boolean;
  endpointOverride?: string;
}

export interface RestorationResult {
  mode: RestorationMode;
  restoredDataUrl: string;
  restoredBlob: Blob;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  scale: RestorationScale;
  processingTimeMs: number;
  pipelineLabel: string;
  note: string;
}

const DEFAULT_API_ENDPOINT =
  (import.meta.env.VITE_RESTORATION_API_URL as string | undefined)?.replace(/\/$/, '') ||
  '';

const MAX_CLIENT_PREVIEW_EDGE = 3840;

/**
 * Checks whether a FastAPI OpenCV restoration server is reachable.
 */
export async function checkBackendHealth(
  endpointOverride?: string,
  timeoutMs = 2200
): Promise<BackendHealth> {
  const endpoint = (endpointOverride ?? DEFAULT_API_ENDPOINT).trim().replace(/\/$/, '');
  const checkedAt = Date.now();

  if (!endpoint) {
    return {
      connected: false,
      endpoint: 'Not configured (VITE_RESTORATION_API_URL unset)',
      engineName: 'Client Preview Only',
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        connected: false,
        endpoint,
        engineName: 'Backend Unreachable',
        checkedAt,
        error: `HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as {
      status?: string;
      engine?: string;
      version?: string;
    };

    return {
      connected: payload.status === 'ok' || payload.status === 'ready',
      endpoint,
      engineName: payload.engine || 'FastAPI + OpenCV (classical processing)',
      version: payload.version,
      checkedAt,
    };
  } catch (err) {
    return {
      connected: false,
      endpoint,
      engineName: 'Backend Offline',
      checkedAt,
      error: err instanceof Error ? err.message : 'Connection failed',
    };
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Main restoration entrypoint used by the Studio UI.
 * Attempts FastAPI OpenCV processing when an endpoint is configured and healthy;
 * otherwise runs a clearly labeled client-side Canvas preview upscale.
 */
export async function restoreScreenshot(
  request: RestorationRequest
): Promise<RestorationResult> {
  const endpoint = (request.endpointOverride ?? DEFAULT_API_ENDPOINT)
    .trim()
    .replace(/\/$/, '');

  if (endpoint) {
    const health = await checkBackendHealth(endpoint, 1800);
    if (health.connected) {
      return restoreViaFastApi(request, endpoint);
    }
  }

  return runClientPreviewUpscale(request);
}

/**
 * Sends multipart image payload to Python FastAPI `/api/v1/restore`.
 */
async function restoreViaFastApi(
  request: RestorationRequest,
  endpoint: string
): Promise<RestorationResult> {
  const startedAt = performance.now();
  const originalDims = await readImageDimensions(request.file);

  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('scale', String(request.scale));
  formData.append('denoise_strength', String(request.denoiseStrength ?? 0.5));
  formData.append('preserve_ui_text', String(request.preserveUiText ?? true));

  const response = await fetch(`${endpoint}/api/v1/restore`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `FastAPI restoration failed (${response.status}): ${detail || response.statusText}`
    );
  }

  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  const restoredDims = await readDataUrlDimensions(dataUrl);
  const elapsed = Math.round(performance.now() - startedAt);

  const pipelineHeader =
    response.headers.get('X-Restoration-Pipeline') || 'OpenCV Lanczos + denoise/sharpen';

  return {
    mode: 'fastapi-opencv',
    restoredDataUrl: dataUrl,
    restoredBlob: blob,
    originalWidth: originalDims.width,
    originalHeight: originalDims.height,
    outputWidth: restoredDims.width,
    outputHeight: restoredDims.height,
    scale: request.scale,
    processingTimeMs: elapsed,
    pipelineLabel: pipelineHeader,
    note: `Processed via connected FastAPI OpenCV pipeline (${endpoint}).`,
  };
}

/**
 * Deterministic client-side Canvas preview pipeline.
 * Clearly labeled as a browser preview — never misrepresented as neural AI restoration.
 */
async function runClientPreviewUpscale(
  request: RestorationRequest
): Promise<RestorationResult> {
  const startedAt = performance.now();
  const img = await loadImageFromFile(request.file);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // Compute target dimensions, bounded safely for browser canvas memory
  let targetWidth = originalWidth * request.scale;
  let targetHeight = originalHeight * request.scale;
  const maxEdge = Math.max(targetWidth, targetHeight);
  if (maxEdge > MAX_CLIENT_PREVIEW_EDGE) {
    const ratio = MAX_CLIENT_PREVIEW_EDGE / maxEdge;
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Multi-step progressive canvas upscale for cleaner edge interpolation
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D canvas context for preview upscale.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (request.scale === 4 && targetWidth >= originalWidth * 2) {
    const midCanvas = document.createElement('canvas');
    midCanvas.width = Math.round(targetWidth / 2);
    midCanvas.height = Math.round(targetHeight / 2);
    const midCtx = midCanvas.getContext('2d');
    if (midCtx) {
      midCtx.imageSmoothingEnabled = true;
      midCtx.imageSmoothingQuality = 'high';
      midCtx.drawImage(img, 0, 0, midCanvas.width, midCanvas.height);
      ctx.drawImage(midCanvas, 0, 0, targetWidth, targetHeight);
    } else {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    }
  } else {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }

  // Subtle unsharp-mask style local contrast pass for UI preview clarity
  if (request.preserveUiText !== false) {
    applySubtlePreviewSharpen(ctx, targetWidth, targetHeight, 0.28);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error('Failed to encode preview PNG.'));
      },
      'image/png',
      1.0
    );
  });

  const dataUrl = await blobToDataUrl(blob);
  const elapsed = Math.round(performance.now() - startedAt);

  return {
    mode: 'client-preview',
    restoredDataUrl: dataUrl,
    restoredBlob: blob,
    originalWidth,
    originalHeight,
    outputWidth: targetWidth,
    outputHeight: targetHeight,
    scale: request.scale,
    processingTimeMs: elapsed,
    pipelineLabel: 'Local Browser Preview (Canvas Interpolation + Edge Pass)',
    note: 'AI backend not connected. Showing deterministic browser preview so you can inspect framing, 2x/4x scale, comparison slider, and PNG export. Connect an AI model separately for neural restoration; this preview uses browser interpolation only.',
  };
}

function applySubtlePreviewSharpen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
): void {
  // Skip convolution on huge canvases to keep UI responsive
  if (width * height > 3840 * 2400) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;

  const centerWeight = 1 + 4 * amount;
  const sideWeight = -amount;

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = (rowOffset + x) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (rowOffset + (x - 1)) * 4;
      const right = (rowOffset + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          src[idx + c] * centerWeight +
          (src[up + c] + src[down + c] + src[left + c] + src[right + c]) * sideWeight;
        dst[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export async function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImageFromFile(file);
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to decode uploaded image file.'));
    };
    img.src = url;
  });
}

function readDataUrlDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Unable to read restored image dimensions.'));
    img.src = dataUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert blob to data URL.'));
    };
    reader.onerror = () => reject(new Error('FileReader error.'));
    reader.readAsDataURL(blob);
  });
}
