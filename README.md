# PixelRevive

PixelRevive is an editorial-style screenshot restoration interface for reviewing and enlarging legacy product screenshots. The React studio supports image upload and drag-and-drop, 2×/4× output sizing, before-and-after comparison, sample screenshots, and PNG download.

## Current processing behavior

The browser studio works without a server. Its local preview uses Canvas interpolation and a light edge-sharpening pass; it is not AI restoration and does not reconstruct missing detail.

An optional FastAPI backend is included. It uses OpenCV denoising, Lanczos resizing, and optional sharpening. It does not currently load Real-ESRGAN or another AI model. The studio labels both modes so users can tell which processing was used.

## Run the frontend

Requirements: Node.js and npm.

```bash
npm ci
npm run dev
```

To build the production frontend:

```bash
npm run build
```

## Run the optional backend

Requirements: Python 3.10+.

```bash
python -m pip install -r backend/requirements.txt
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

Set `VITE_RESTORATION_API_URL=http://127.0.0.1:8000` before starting Vite to let the studio use the OpenCV endpoint. The API exposes `GET /health` and `POST /api/v1/restore`.

## Stack

- React 19, TypeScript, and Vite
- Tailwind CSS 4
- FastAPI and OpenCV for the optional server-side processing path

An AI restoration model can be integrated behind the existing service boundary later. Until then, the app does not claim that AI processing is available.
