import { useState, useCallback } from 'react'
import type { BgId, FrameStyle } from '@/types'
import { BG_OPTIONS } from '@/components/BgSelectGrid'

// ─── 레이아웃 상수 (useComposer와 동일) ──────────────────────────────────────

const CANVAS_H = 2400
const CW       = 1280
const GAP      = 48
const PAD      = 80

function getClassicCells() {
  const photoW = Math.floor((CW - PAD * 2 - GAP) / 2)
  const photoH = Math.round(photoW * (3 / 2))
  const panelW = photoW * 2 + GAP
  const panelH = photoH * 2 + GAP
  const panelX = Math.round((CW - panelW) / 2)
  const panelY = Math.round((CANVAS_H - panelH) * 0.42)
  return {
    cells: [
      { x: panelX,            y: panelY,            w: photoW, h: photoH },
      { x: panelX + photoW + GAP, y: panelY,            w: photoW, h: photoH },
      { x: panelX,            y: panelY + photoH + GAP, w: photoW, h: photoH },
      { x: panelX + photoW + GAP, y: panelY + photoH + GAP, w: photoW, h: photoH },
    ],
    panelY,
    panelH,
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

function loadVideo(blob: Blob): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(blob)
    video.muted = true
    video.loop  = true
    video.playsInline = true
    video.oncanplay = () => resolve(video)
    video.onerror   = () => reject(new Error('비디오 로드 실패'))
    video.load()
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

function drawVideoCrop(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  cell: { x: number; y: number; w: number; h: number },
  radius = 16,
) {
  const { x: dx, y: dy, w: dw, h: dh } = cell
  const vw = video.videoWidth || dw
  const vh = video.videoHeight || dh
  const ta = dw / dh
  const sa = vw / vh

  let sx = 0, sy = 0, sw = vw, sh = vh
  if (sa > ta) { sw = vh * ta; sx = (vw - sw) / 2 }
  else          { sh = vw / ta; sy = (vh - sh) / 2 }

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(dx, dy, dw, dh, radius)
  ctx.clip()
  ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.restore()
}

// ─── 훅 ──────────────────────────────────────────────────────────────────────

interface UseClipComposerOptions {
  clips: Blob[]
  bgId: BgId
  frameStyle: FrameStyle
  onComplete: (blob: Blob) => void
}

const RECORD_DURATION_MS = 5000  // 5초 녹화

export function useClipComposer({ clips, bgId, frameStyle: _frameStyle, onComplete }: UseClipComposerOptions) {
  const [isComposing, setIsComposing] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const compose = useCallback(async () => {
    if (clips.length < 4) return

    setIsComposing(true)
    setError(null)

    const videoUrls: string[] = []

    try {
      const { cells, panelY, panelH } = getClassicCells()

      // Canvas 설정
      const canvas = document.createElement('canvas')
      canvas.width  = CW
      canvas.height = CANVAS_H
      const ctx = canvas.getContext('2d')!

      // 배경 이미지 로드
      const bgOpt = BG_OPTIONS.find(o => o.id === bgId) ?? BG_OPTIONS[0]
      const bgImg = await loadImage(bgOpt.imagePath)

      // 4개 비디오 로드
      const videos = await Promise.all(clips.slice(0, 4).map(loadVideo))
      videos.forEach(v => videoUrls.push(v.src))

      // 비디오 재생 시작
      await Promise.all(videos.map(v => v.play()))

      // 로고 로드 (실패 시 스킵)
      let logoImg: HTMLImageElement | null = null
      try { logoImg = await loadImage('/logo.png') } catch { /* skip */ }

      // 폰트 로드
      try {
        const font = new FontFace(
          'SanghaiChanmi',
          "url('https://cdn.jsdelivr.net/gh/projectnoonnu/naverfont_09@1.0/Sanghea_chanmi.woff') format('woff')",
        )
        await font.load()
        document.fonts.add(font)
        await document.fonts.ready
      } catch { /* 폰트 로드 실패 시 기본 폰트 사용 */ }

      // Canvas 스트림 캡처 → MediaRecorder
      const stream   = canvas.captureStream(30)
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.start(100)

      // requestAnimationFrame 렌더 루프
      const startTime = performance.now()

      function drawFrame() {
        // 1. 배경
        drawCover(ctx, bgImg, 0, 0, CW, CANVAS_H)

        // 2. 비디오 4개
        videos.forEach((video, i) => {
          if (cells[i]) drawVideoCrop(ctx, video, cells[i])
        })

        // 3. 로고 (우상단)
        if (logoImg) {
          const logoH = 200
          const logoW = Math.round(logoImg.naturalWidth * (logoH / logoImg.naturalHeight))
          ctx.drawImage(logoImg, CW - logoW - 40, 40, logoW, logoH)
        }

        // 4. 브랜드 텍스트
        ctx.font         = '80px SanghaiChanmi, sans-serif'
        ctx.fillStyle    = 'rgba(255,255,255,0.90)'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('2026 목천청년교회 달란트마켓', CW / 2, panelY + panelH + 200)

        if (performance.now() - startTime < RECORD_DURATION_MS) {
          requestAnimationFrame(drawFrame)
        } else {
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' })
            onComplete(blob)
            setIsComposing(false)
            // 비디오 리소스 정리
            videos.forEach(v => { v.pause(); URL.revokeObjectURL(v.src) })
          }
          recorder.stop()
        }
      }

      requestAnimationFrame(drawFrame)

    } catch (err) {
      // 오류 시 blob URL 정리
      videoUrls.forEach(url => URL.revokeObjectURL(url))
      setError('영상 합성 중 오류가 발생했습니다')
      console.error('[useClipComposer]', err)
      setIsComposing(false)
    }
  }, [clips, bgId, onComplete])

  return { compose, isComposing, error }
}
