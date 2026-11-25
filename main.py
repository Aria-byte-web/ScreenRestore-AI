"""
PixelRevive — FastAPI + OpenCV Restoration Backend
-------------------------------------------------------------
Classical image processing only: OpenCV denoising, Lanczos resizing, and optional sharpening. No AI model is connected.
Run locally with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from io import BytesIO
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image

app = FastAPI(
    title="PixelRevive Restoration API",
    version="1.0.0",
    description="OpenCV denoising, Lanczos resizing, and optional sharpening for legacy product screenshots. No AI model is connected.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Restoration-Pipeline"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "FastAPI + OpenCV classical processing (no AI model)",
        "version": "1.0.0",
    }


@app.post("/api/v1/restore")
async def restore_screenshot(
    file: UploadFile = File(...),
    scale: Literal[2, 4] = Form(4),
    denoise_strength: float = Form(0.5),
    preserve_ui_text: bool = Form(True),
):
    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Empty image upload.")

    np_arr = np.frombuffer(raw_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Unsupported or corrupted image.")

    # 1. Optional gentle UI-aware denoising prior to upscaling
    if denoise_strength > 0:
        h_val = max(2.0, min(10.0, denoise_strength * 8.0))
        img_bgr = cv2.fastNlMeansDenoisingColored(img_bgr, None, h_val, h_val, 7, 21)

    # 2. Replace this block with RealESRGANer(scale=scale, model_path=...) in production
    height, width = img_bgr.shape[:2]
    upscaled = cv2.resize(
        img_bgr,
        (width * scale, height * scale),
        interpolation=cv2.INTER_LANCZOS4,
    )

    # 3. Crisp UI text & vector edge preservation pass
    if preserve_ui_text:
        blurred = cv2.GaussianBlur(upscaled, (0, 0), sigmaX=1.0)
        upscaled = cv2.addWeighted(upscaled, 1.35, blurred, -0.35, 0)

    rgb = cv2.cvtColor(upscaled, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    output_buf = BytesIO()
    pil_img.save(output_buf, format="PNG", optimize=True)

    return Response(
        content=output_buf.getvalue(),
        media_type="image/png",
        headers={
            "X-Restoration-Pipeline": f"OpenCV Lanczos + denoise/sharpen ({scale}x)",
        },
    )
