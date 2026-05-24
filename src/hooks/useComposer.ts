import { useState, useCallback, useRef, useEffect } from 'react'
import type { BgId, FrameStyle } from '@/types'
import { BG_OPTIONS } from '@/components/BgSelectGrid'

// ─── 캔버스 레이아웃 상수 ───────────────────────────────────────────────────

const CANVAS_W  = 640
const PAD_X     = 20           // 좌우 여백
const PAD_TOP   = 32           // 상단 여백
const PHOTO_W   = CANVAS_W - PAD_X * 2   // 600
const PHOTO_H   = Math.round(PHOTO_W * (9 / 16))  // ≈ 338 (crop to 16:9 landscape)
const GAP       = 10           // 사진 사이 간격
const BRAND_H   = 100          // 하단 브랜딩 영역 높이

const CANVAS_H  =
  PAD_TOP +
  4 * PHOTO_H +
  3 * GAP +
  GAP +          // 마지막 사진 ~ 브랜딩 여백
  BRAND_H

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`))
    img.src = src
  })
}

/** 이미지를 영역 전체에 cover 방식으로 그린다 */
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

/** 소스 이미지를 대상 비율(landscape crop)에 맞게 center-crop 후 그린다 */
function drawCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
  radius = 6,
) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const targetAspect = dw / dh
  const srcAspect    = iw / ih

  let sx = 0, sy = 0, sw = iw, sh = ih
  if (srcAspect > targetAspect) {
    sw = ih * targetAspect
    sx = (iw - sw) / 2
  } else {
    sh = iw / targetAspect
    sy = (ih - sh) / 2
  }

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(dx, dy, dw, dh, radius)
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.restore()
}

/** 프레임 스타일에 따른 오버레이/테마 색상 반환 */
function getTheme(frameStyle: FrameStyle) {
  switch (frameStyle) {
    case 'strip': return { overlay: 'rgba(0,0,0,0.25)', brand: '#1a1614', brandText: '#ffffff', dateText: 'rgba(255,255,255,0.6)' }
    case 'dark':  return { overlay: 'rgba(0,0,0,0.40)', brand: '#111111', brandText: '#ffffff', dateText: 'rgba(255,255,255,0.5)' }
    case 'mint':  return { overlay: 'rgba(0,0,0,0.10)', brand: '#d4f0e8', brandText: '#1a4a3a', dateText: 'rgba(26,74,58,0.6)' }
    default:      return { overlay: 'rgba(0,0,0,0.12)', brand: '#ffffff', brandText: '#1a1614', dateText: 'rgba(26,22,20,0.5)' }
  }
}

// ─── 훅 ─────────────────────────────────────────────────────────────────────

interface UseComposerOptions {
  /** 선택된 사진 dataURL 배열 (4장) */
  photos: string[]
  bgId: BgId
  frameStyle: FrameStyle
  onComplete: (dataUrl: string) => void
}

export function useComposer({ photos, bgId, frameStyle, onComplete }: UseComposerOptions) {
  const [isComposing, setIsComposing] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const abortedRef                    = useRef(false)

  // 언마운트 시 진행 중인 합성 무효화
  useEffect(() => {
    return () => { abortedRef.current = true }
  }, [])

  const compose = useCallback(async () => {
    if (photos.length < 4) return

    abortedRef.current = false
    setIsComposing(true)
    setError(null)

    try {
      const canvas = document.createElement('canvas')
      canvas.width  = CANVAS_W
      canvas.height = CANVAS_H
      const ctx = canvas.getContext('2d')!

      // 1. 배경 이미지 (cover)
      const bgOpt = BG_OPTIONS.find(o => o.id === bgId) ?? BG_OPTIONS[0]
      const bgImg = await loadImage(bgOpt.imagePath)
      if (abortedRef.current) return
      drawCover(ctx, bgImg, 0, 0, CANVAS_W, CANVAS_H)

      // 2. 오버레이 (테마별 어둡기)
      const theme = getTheme(frameStyle)
      ctx.fillStyle = theme.overlay
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      // 3. 사진 4장
      for (let i = 0; i < 4; i++) {
        if (abortedRef.current) return

        const photo = await loadImage(photos[i])
        const px = PAD_X
        const py = PAD_TOP + i * (PHOTO_H + GAP)
        drawCrop(ctx, photo, px, py, PHOTO_W, PHOTO_H, 6)

        // 사진 번호 라벨 (우하단)
        const labelW = 34
        const labelH = 20
        const lx = px + PHOTO_W - labelW - 6
        const ly = py + PHOTO_H - labelH - 6
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.beginPath()
        ctx.roundRect(lx, ly, labelW, labelH, 10)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`0${i + 1}`, lx + labelW / 2, ly + labelH / 2)
      }

      // 4. 하단 브랜딩 영역
      const brandY = PAD_TOP + 4 * PHOTO_H + 3 * GAP + GAP
      ctx.fillStyle = theme.brand
      ctx.beginPath()
      ctx.roundRect(PAD_X, brandY, PHOTO_W, BRAND_H - GAP, 6)
      ctx.fill()

      // 로고 (우상단 브랜딩 영역 내)
      try {
        const logo = await loadImage('/logo.png')
        if (!abortedRef.current) {
          const logoH = 36
          const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH
          ctx.drawImage(logo, PAD_X + PHOTO_W - logoW - 10, brandY + 10, logoW, logoH)
        }
      } catch {
        // 로고 없으면 건너뜀
      }

      // "McCut" 텍스트
      ctx.fillStyle = theme.brandText
      ctx.font = 'bold 28px Gaegu, cursive'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText('McCut', PAD_X + 12, brandY + 44)

      // 날짜 텍스트
      const today = new Date()
      const dateStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join(' . ')
      ctx.fillStyle = theme.dateText
      ctx.font = '15px Gaegu, cursive'
      ctx.fillText(dateStr, PAD_X + 12, brandY + 68)

      if (!abortedRef.current) {
        onComplete(canvas.toDataURL('image/jpeg', 0.92))
      }
    } catch (err) {
      if (!abortedRef.current) {
        setError('이미지 합성 중 오류가 발생했습니다')
        console.error('[useComposer]', err)
      }
    } finally {
      if (!abortedRef.current) {
        setIsComposing(false)
      }
    }
  }, [photos, bgId, frameStyle, onComplete])

  return { compose, isComposing, error }
}
