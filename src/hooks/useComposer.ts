import { useState, useCallback, useRef, useEffect } from "react";
import type { BgId, FrameStyle } from "@/types";
import { BG_OPTIONS } from "@/components/BgSelectGrid";

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  canvasW: number;
  canvasH: number;
  /** 사진을 감싸는 패널 */
  panel: Cell & { radius: number; color: string };
  cells: Cell[];
}

// ─── 레이아웃 ─────────────────────────────────────────────────────────────────
//
//  CANVAS_H: 배경 이미지 세로 크기 고정 (Portrait 비율 유지)
//  사진은 캔버스 중앙 42% 지점을 기준으로 배치

const CANVAS_H = 1100; // ← 이 값으로 배경 높이 조절

function getLayout(style: FrameStyle): Layout {
  const cw = 1280;
  const ch = CANVAS_H;

  switch (style) {
    // ── classic: 2×2 그리드 ──────────────────────────────────────────────────
    case "classic": {
      const gap = 24;
      const pad = 40;
      const photoW = Math.floor((cw - pad * 2 - gap) / 2);
      const photoH = Math.round(photoW * (3 / 2));
      const panelW = photoW * 2 + gap;
      const panelH = photoH * 2 + gap;
      const panelX = Math.round((cw - panelW) / 2);
      const panelY = Math.round((ch - panelH) * 0.42);
      return {
        canvasW: cw,
        canvasH: ch,
        panel: {
          x: panelX,
          y: panelY,
          w: panelW,
          h: panelH,
          radius: 0,
          color: "transparent",
        },
        cells: [
          { x: panelX, y: panelY, w: photoW, h: photoH },
          { x: panelX + photoW + gap, y: panelY, w: photoW, h: photoH },
          { x: panelX, y: panelY + photoH + gap, w: photoW, h: photoH },
          {
            x: panelX + photoW + gap,
            y: panelY + photoH + gap,
            w: photoW,
            h: photoH,
          },
        ],
      };
    }

    // ── strip: 세로 1×4 ──────────────────────────────────────────────────────
    case "strip": {
      const gap = 24;
      const pad = 40;
      const photoW = Math.floor(cw - pad * 2);
      const photoH = Math.round(photoW * (3 / 4));
      const panelH = photoH * 4 + gap * 3;
      const panelX = Math.round((cw - photoW) / 2);
      const panelY = Math.round((ch - panelH) * 0.42);
      return {
        canvasW: cw,
        canvasH: ch,
        panel: {
          x: panelX,
          y: panelY,
          w: photoW,
          h: panelH,
          radius: 0,
          color: "transparent",
        },
        cells: [0, 1, 2, 3].map((i) => ({
          x: panelX,
          y: panelY + i * (photoH + gap),
          w: photoW,
          h: photoH,
        })),
      };
    }

    // ── dark: 2×2 정사각형 ───────────────────────────────────────────────────
    case "dark": {
      const gap = 24;
      const pad = 40;
      const photoW = Math.floor((cw - pad * 2 - gap) / 2);
      const photoH = Math.round(photoW * (4 / 3));
      const panelW = photoW * 2 + gap;
      const panelH = photoH * 2 + gap;
      const panelX = Math.round((cw - panelW) / 2);
      const panelY = Math.round((ch - panelH) * 0.42);
      return {
        canvasW: cw,
        canvasH: ch,
        panel: {
          x: panelX,
          y: panelY,
          w: panelW,
          h: panelH,
          radius: 0,
          color: "transparent",
        },
        cells: [
          { x: panelX, y: panelY, w: photoW, h: photoH },
          { x: panelX + photoW + gap, y: panelY, w: photoW, h: photoH },
          { x: panelX, y: panelY + photoH + gap, w: photoW, h: photoH },
          {
            x: panelX + photoW + gap,
            y: panelY + photoH + gap,
            w: photoW,
            h: photoH,
          },
        ],
      };
    }

    // ── mint: 좌 1장 + 우 3장(스택) ─────────────────────────────────────────
    case "mint":
    default: {
      const gap = 24;
      const pad = 40;
      const areaW = cw - pad * 2;
      const leftW = Math.round(areaW * 0.54);
      const rightW = areaW - leftW - gap;
      const rCellH = Math.round(rightW * (4 / 3));
      const leftH = rCellH * 3 + gap * 2;
      const panelX = Math.round((cw - areaW) / 2);
      const panelY = Math.round((ch - leftH) * 0.42);
      return {
        canvasW: cw,
        canvasH: ch,
        panel: {
          x: panelX,
          y: panelY,
          w: areaW,
          h: leftH,
          radius: 0,
          color: "transparent",
        },
        cells: [
          { x: panelX, y: panelY, w: leftW, h: leftH },
          { x: panelX + leftW + gap, y: panelY, w: rightW, h: rCellH },
          {
            x: panelX + leftW + gap,
            y: panelY + rCellH + gap,
            w: rightW,
            h: rCellH,
          },
          {
            x: panelX + leftW + gap,
            y: panelY + (rCellH + gap) * 2,
            w: rightW,
            h: rCellH,
          },
        ],
      };
    }
  }
}

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
}

function drawCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cell: Cell,
  radius = 8,
) {
  const { x: dx, y: dy, w: dw, h: dh } = cell;
  const iw = img.naturalWidth,
    ih = img.naturalHeight;
  const ta = dw / dh,
    sa = iw / ih;

  let sx = 0,
    sy = 0,
    sw = iw,
    sh = ih;
  if (sa > ta) {
    sw = ih * ta;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / ta;
    sy = (ih - sh) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, radius);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

// ─── 훅 ──────────────────────────────────────────────────────────────────────

interface UseComposerOptions {
  photos: string[];
  bgId: BgId;
  frameStyle: FrameStyle;
  onComplete: (dataUrl: string) => void;
}

export function useComposer({
  photos,
  bgId,
  frameStyle,
  onComplete,
}: UseComposerOptions) {
  const [isComposing, setIsComposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
    };
  }, []);

  const compose = useCallback(async () => {
    if (photos.length < 4) return;

    abortedRef.current = false;
    setIsComposing(true);
    setError(null);

    try {
      const layout = getLayout(frameStyle);
      const canvas = document.createElement("canvas");
      canvas.width = layout.canvasW;
      canvas.height = layout.canvasH;
      const ctx = canvas.getContext("2d")!;

      // 1. 배경 이미지 (cover)
      const bgOpt = BG_OPTIONS.find((o) => o.id === bgId) ?? BG_OPTIONS[0];
      const bgImg = await loadImage(bgOpt.imagePath);
      if (abortedRef.current) return;
      drawCover(ctx, bgImg, 0, 0, layout.canvasW, layout.canvasH);

      // 2. 로고 (우상단)
      try {
        const logoImg = await loadImage("/logo.png");
        if (!abortedRef.current) {
          const logoH = 100;
          const logoW = Math.round(
            logoImg.naturalWidth * (logoH / logoImg.naturalHeight),
          );
          const logoPad = 20;
          ctx.drawImage(
            logoImg,
            layout.canvasW - logoW - logoPad,
            logoPad,
            logoW,
            logoH,
          );
        }
      } catch {
        // 로고 로드 실패 시 건너뜀
      }

      // 3. 사진 4장
      for (let i = 0; i < 4; i++) {
        if (abortedRef.current) return;

        const cell = layout.cells[i];
        const photo = await loadImage(photos[i]);
        drawCrop(ctx, photo, cell, 8);

      }

      // 4. 브랜드 텍스트 (사진 그리드 아래, 상해찬미 폰트)
      if (!abortedRef.current) {
        const fontFamily = 'SanghaiChanmi'
        try {
          const customFont = new FontFace(
            fontFamily,
            "url('https://cdn.jsdelivr.net/gh/projectnoonnu/naverfont_09@1.0/Sanghea_chanmi.woff') format('woff')",
          )
          await customFont.load()
          document.fonts.add(customFont)
          await document.fonts.ready
        } catch {
          // 폰트 로드 실패 시 기본 폰트로 폴백
        }
        const panel = layout.panel;
        const textY = panel.y + panel.h + 100;
        ctx.font = `40px ${fontFamily}, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.90)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("2026 목천청년교회 달란트마켓", layout.canvasW / 2, textY);
      }

      if (!abortedRef.current) {
        onComplete(canvas.toDataURL("image/jpeg", 1.0));
      }
    } catch (err) {
      if (!abortedRef.current) {
        setError("이미지 합성 중 오류가 발생했습니다");
        console.error("[useComposer]", err);
      }
    } finally {
      if (!abortedRef.current) setIsComposing(false);
    }
  }, [photos, bgId, frameStyle, onComplete]);

  return { compose, isComposing, error };
}
