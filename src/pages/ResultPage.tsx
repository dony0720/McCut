import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useComposer } from '@/hooks/useComposer'

/** 6자리 디스플레이 ID 생성 (세션당 고정) */
function makeDisplayId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function ResultPage() {
  const navigate  = useNavigate()
  const { state, setComposedImage, reset } = useApp()
  const { capturedPhotos, selectedIndices, frameStyle, bgId, composedImage } = state

  const displayId = useRef(makeDisplayId())

  const selectedPhotos = selectedIndices.map(i => capturedPhotos[i])

  const handleComposed = useCallback((dataUrl: string) => {
    setComposedImage(dataUrl)
  }, [setComposedImage])

  const { compose, isComposing, error } = useComposer({
    photos:      selectedPhotos,
    bgId,
    frameStyle,
    onComplete:  handleComposed,
  })

  // 마운트 시 자동 합성 (이미 합성된 경우 스킵)
  useEffect(() => {
    if (!composedImage && selectedPhotos.length === 4) {
      compose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 저장하기 ──────────────────────────────────────────────────────────────
  function handleSave() {
    if (!composedImage) return
    const a = document.createElement('a')
    a.href     = composedImage
    a.download = `mccut_${displayId.current}.jpg`
    a.click()
  }

  // ── 공유 ──────────────────────────────────────────────────────────────────
  async function handleShare() {
    if (!composedImage) return

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(composedImage)).blob()
        const file = new File([blob], `mccut_${displayId.current}.jpg`, { type: 'image/jpeg' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'McCut 사진' })
          return
        }
      } catch { /* 공유 취소 또는 미지원 */ }
    }

    // Web Share 미지원 → 클립보드 복사 fallback
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    } catch {
      alert('공유 기능을 지원하지 않는 환경입니다.')
    }
  }

  // ── 다시 찍기 ─────────────────────────────────────────────────────────────
  function handleReset() {
    reset()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-sm md:max-w-lg flex flex-col min-h-screen">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-7 pb-2 shrink-0">
          <button
            onClick={handleReset}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ink/5 flex items-center justify-center transition-all active:scale-90 hover:bg-ink/10"
            aria-label="처음으로"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="#1a1614" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <h1 className="font-gaegu font-bold text-ink text-2xl md:text-3xl">완성됐어!</h1>

          {/* ID 배지 */}
          <div className="border-[1.5px] border-ink/30 rounded-full px-3 py-1">
            <span className="font-mono text-xs md:text-sm text-ink/60 tracking-wider">
              #{displayId.current}
            </span>
          </div>
        </div>

        {/* ── 카드 영역 ── */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-12 py-2 relative">

          {/* 배경 스파클 */}
          <span className="absolute top-10 left-6 text-coral/60 text-2xl select-none pointer-events-none">✦</span>
          <span className="absolute top-24 right-5 text-ink/20 text-base select-none pointer-events-none">✦</span>
          <span className="absolute bottom-16 left-10 text-ink/15 text-xs select-none pointer-events-none">✳</span>
          <span className="absolute bottom-28 right-8 text-coral/50 text-lg select-none pointer-events-none">✦</span>

          {/* 폰 카드 */}
          <div className="relative rotate-[-3deg] drop-shadow-[0_12px_32px_rgba(0,0,0,0.18)]">

            {/* 테이프 장식 */}
            <div className="absolute -top-3.5 left-8 w-14 h-6 md:w-16 md:h-7 rounded-sm bg-[rgba(255,224,102,0.85)] z-10 rotate-[-2deg]" />
            <div className="absolute -top-3.5 right-8 w-14 h-6 md:w-16 md:h-7 rounded-sm bg-[rgba(168,230,207,0.85)] z-10 rotate-[2deg]" />

            {/* 카드 본체 */}
            <div className="bg-white rounded-2xl overflow-hidden border-[2px] border-ink/10 w-full">
              {isComposing && (
                <div className="aspect-[640/1440] flex flex-col items-center justify-center gap-4 bg-cream-100">
                  <div className="w-10 h-10 rounded-full border-[3px] border-coral border-t-transparent animate-spin" />
                  <p className="font-gaegu text-ink/50 text-sm">사진 합성 중…</p>
                </div>
              )}

              {error && !isComposing && (
                <div className="aspect-[640/1440] flex flex-col items-center justify-center gap-4 bg-cream-100 p-8 text-center">
                  <p className="text-ink/60 text-sm">{error}</p>
                  <button
                    onClick={compose}
                    className="px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold active:scale-95 transition-all"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {composedImage && !isComposing && (
                <img
                  src={composedImage}
                  alt="완성된 네컷 사진"
                  className="w-full block"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── 하단 버튼 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-4 pb-10 md:pb-12 flex gap-3 bg-cream-50 border-t border-ink/10">
          {/* 다시 */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3.5 rounded-full border-2 border-ink/20 bg-white text-ink font-semibold text-sm md:text-base transition-all active:scale-95 hover:bg-ink/5 shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            다시
          </button>

          {/* 공유 */}
          <button
            onClick={handleShare}
            disabled={!composedImage}
            className="flex items-center gap-2 px-4 py-3.5 rounded-full border-2 border-ink/20 bg-white text-ink font-semibold text-sm md:text-base transition-all active:scale-95 hover:bg-ink/5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            공유
          </button>

          {/* 저장하기 */}
          <button
            onClick={handleSave}
            disabled={!composedImage}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full',
              'font-semibold text-base md:text-lg transition-all',
              composedImage
                ? 'bg-coral text-white hover:brightness-110 active:scale-95'
                : 'bg-coral/40 text-white/70 cursor-not-allowed',
            ].join(' ')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            저장하기
          </button>
        </div>

      </div>
    </div>
  )
}
