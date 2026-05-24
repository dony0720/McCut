import { useState, useCallback, useRef, useEffect } from 'react'
import type { BgId, FrameStyle } from '@/types'
import { BG_OPTIONS } from '@/components/BgSelectGrid'

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface Cell { x: number; y: number; w: number; h: number }

interface Layout {
  canvasW: number
  canvasH: number
  /** 사진을 감싸는 패널 */
  panel: Cell & { radius: number; color: string }
  cells: Cell[]
}

// ─── 레이아웃 ─────────────────────────────────────────────────────────────────
//
//  배경 이미지가 전체 캔버스를 채우고,
//  그 위에 스타일된 패널 + 사진 4장이 그려집니다.
//  배경 이미지 자체에 하단 텍스트/로고가 포함되어 있는 경우를 고려해
//  패널은 캔버스 상단 60~65% 영역에 배치합니다.

function getLayout(style: FrameStyle): Layout {
  const cw = 640

  switch (style) {

    // ── classic: 다크 패널 + 2×2 그리드 ─────────────────────────────────────
    case 'classic': {
      const gap    = 16
      const pad    = 16
      const photoW = Math.floor((cw * 0.82 - pad * 2 - gap) / 2)
      const photoH = Math.round(photoW * (4 / 3))
      const panelW = photoW * 2 + gap + pad * 2
      const panelH = photoH * 2 + gap + pad * 2
      const panelX = Math.round((cw - panelW) / 2)
      const panelY = 40
      const ch     = panelY + panelH + 50
      return {
        canvasW: cw, canvasH: ch,
        panel: { x: panelX, y: panelY, w: panelW, h: panelH, radius: 20, color: 'rgba(28,16,8,0.72)' },
        cells: [
          { x: panelX + pad,                y: panelY + pad,                w: photoW, h: photoH },
          { x: panelX + pad + photoW + gap,  y: panelY + pad,                w: photoW, h: photoH },
          { x: panelX + pad,                y: panelY + pad + photoH + gap,  w: photoW, h: photoH },
          { x: panelX + pad + photoW + gap,  y: panelY + pad + photoH + gap, w: photoW, h: photoH },
        ],
      }
    }

    // ── strip: 세로 스트립 패널 ───────────────────────────────────────────────
    case 'strip': {
      const gap    = 12
      const pad    = 12
      const photoW = Math.round(cw * 0.78)
      const photoH = Math.round(photoW * (9 / 16))
      const panelW = photoW + pad * 2
      const panelH = photoH * 4 + gap * 3 + pad * 2
      const panelX = Math.round((cw - panelW) / 2)
      const panelY = 48
      const ch     = panelY + panelH + Math.round(panelH * 0.20)
      return {
        canvasW: cw, canvasH: ch,
        panel: { x: panelX, y: panelY, w: panelW, h: panelH, radius: 16, color: 'rgba(20,12,6,0.70)' },
        cells: [0, 1, 2, 3].map(i => ({
          x: panelX + pad,
          y: panelY + pad + i * (photoH + gap),
          w: photoW,
          h: photoH,
        })),
      }
    }

    // ── dark: 2×2 정사각 크롭 + 더 진한 패널 ────────────────────────────────
    case 'dark': {
      const gap    = 16
      const pad    = 16
      const photoW = Math.floor((cw * 0.82 - pad * 2 - gap) / 2)
      const photoH = photoW
      const panelW = photoW * 2 + gap + pad * 2
      const panelH = photoH * 2 + gap + pad * 2
      const panelX = Math.round((cw - panelW) / 2)
      const panelY = 40
      const ch     = panelY + panelH + 50
      return {
        canvasW: cw, canvasH: ch,
        panel: { x: panelX, y: panelY, w: panelW, h: panelH, radius: 16, color: 'rgba(0,0,0,0.80)' },
        cells: [
          { x: panelX + pad,                y: panelY + pad,                w: photoW, h: photoH },
          { x: panelX + pad + photoW + gap,  y: panelY + pad,                w: photoW, h: photoH },
          { x: panelX + pad,                y: panelY + pad + photoH + gap,  w: photoW, h: photoH },
          { x: panelX + pad + photoW + gap,  y: panelY + pad + photoH + gap, w: photoW, h: photoH },
        ],
      }
    }

    // ── mint: 좌 1장(크게) + 우 3장(스택) ────────────────────────────────────
    case 'mint':
    default: {
      const gap    = 16
      const pad    = 16
      const areaW  = Math.round(cw * 0.82)
      const leftW  = Math.round(areaW * 0.54)
      const rightW = areaW - leftW - gap
      const rCellH = rightW
      const leftH  = rCellH * 3 + gap * 2
      const panelW = areaW + pad * 2
      const panelH = leftH + pad * 2
      const panelX = Math.round((cw - panelW) / 2)
      const panelY = 40
      const ch     = panelY + panelH + 60
      return {
        canvasW: cw, canvasH: ch,
        panel: { x: panelX, y: panelY, w: panelW, h: panelH, radius: 20, color: 'rgba(40,100,80,0.65)' },
        cells: [
          { x: panelX + pad,               y: panelY + pad, w: leftW,  h: leftH  },
          { x: panelX + pad + leftW + gap,  y: panelY + pad,                       w: rightW, h: rCellH },
          { x: panelX + pad + leftW + gap,  y: panelY + pad + rCellH + gap,         w: rightW, h: rCellH },
          { x: panelX + pad + leftW + gap,  y: panelY + pad + (rCellH + gap) * 2,   w: rightW, h: rCellH },
        ],
      }
    }
  }
}

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`))
    img.src = src
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = img.naturalWidth  * scale
  const sh = img.naturalHeight * scale
  ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh)
}

function drawCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cell: Cell,
  radius = 8,
) {
  const { x: dx, y: dy, w: dw, h: dh } = cell
  const iw = img.naturalWidth, ih = img.naturalHeight
  const ta = dw / dh, sa = iw / ih

  let sx = 0, sy = 0, sw = iw, sh = ih
  if (sa > ta) { sw = ih * ta; sx = (iw - sw) / 2 }
  else          { sh = iw / ta; sy = (ih - sh) / 2 }

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(dx, dy, dw, dh, radius)
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.restore()
}

// ─── 훅 ──────────────────────────────────────────────────────────────────────

interface UseComposerOptions {
  photos: string[]
  bgId: BgId
  frameStyle: FrameStyle
  onComplete: (dataUrl: string) => void
}

export function useComposer({ photos, bgId, frameStyle, onComplete }: UseComposerOptions) {
  const [isComposing, setIsComposing] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const abortedRef                    = useRef(false)

  useEffect(() => {
    return () => { abortedRef.current = true }
  }, [])

  const compose = useCallback(async () => {
    if (photos.length < 4) return

    abortedRef.current = false
    setIsComposing(true)
    setError(null)

    try {
      const layout = getLayout(frameStyle)
      const canvas = document.createElement('canvas')
      canvas.width  = layout.canvasW
      canvas.height = layout.canvasH
      const ctx = canvas.getContext('2d')!

      // 1. 배경 이미지 (cover)
      const bgOpt = BG_OPTIONS.find(o => o.id === bgId) ?? BG_OPTIONS[0]
      const bgImg = await loadImage(bgOpt.imagePath)
      if (abortedRef.current) return
      drawCover(ctx, bgImg, 0, 0, layout.canvasW, layout.canvasH)

      // 2. 사진 4장
      for (let i = 0; i < 4; i++) {
        if (abortedRef.current) return

        const cell  = layout.cells[i]
        const photo = await loadImage(photos[i])
        drawCrop(ctx, photo, cell, 8)

        // 번호 라벨 (우상단)
        const lW = 32, lH = 18
        const lx = cell.x + cell.w - lW - 4
        const ly = cell.y + 4
        ctx.fillStyle = 'rgba(255,255,255,0.82)'
        ctx.beginPath()
        ctx.roundRect(lx, ly, lW, lH, 9)
        ctx.fill()
        ctx.fillStyle = 'rgba(26,22,20,0.85)'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`0${i + 1}`, lx + lW / 2, ly + lH / 2)
      }

      if (!abortedRef.current) {
        onComplete(canvas.toDataURL('image/jpeg', 0.92))
      }
    } catch (err) {
      if (!abortedRef.current) {
        setError('이미지 합성 중 오류가 발생했습니다')
        console.error('[useComposer]', err)
      }
    } finally {
      if (!abortedRef.current) setIsComposing(false)
    }
  }, [photos, bgId, frameStyle, onComplete])

  return { compose, isComposing, error }
}
