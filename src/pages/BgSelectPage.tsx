import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useComposer } from '@/hooks/useComposer'
import BgPickerModal from '@/components/BgPickerModal'

export default function BgSelectPage() {
  const navigate = useNavigate()
  const { state, setComposedImage } = useApp()
  const { capturedPhotos, selectedIndices, bgId, frameStyle } = state

  const selectedPhotos = selectedIndices.map((i) => capturedPhotos[i])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false)

  const handleComposed = useCallback((dataUrl: string) => {
    setPreviewUrl(dataUrl)
  }, [])

  const { compose, isComposing } = useComposer({
    photos: selectedPhotos,
    bgId,
    frameStyle,
    onComplete: handleComposed,
  })

  // 페이지 진입 & bgId 변경 시 재합성
  useEffect(() => {
    if (selectedPhotos.length === 4) compose()
  }, [bgId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleConfirm() {
    if (previewUrl) setComposedImage(previewUrl)
    navigate('/result')
  }

  return (
    <div className="h-[100dvh] bg-[#1c1814] flex flex-col items-center overflow-hidden">
      <div className="w-full box-border flex flex-col h-full">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-7 pb-3 shrink-0">
          <button
            onClick={() => navigate('/select')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
            aria-label="뒤로가기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-gaegu font-bold text-white text-xl md:text-2xl">배경 고르기</h1>
          <div className="w-10 h-10" />
        </div>

        {/* ── 합성 미리보기 ── */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-6 min-h-0">
          <div className="relative h-full max-h-full rounded-2xl overflow-hidden flex items-center justify-center aspect-[1280/2200]">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="합성 미리보기"
                  className="h-full w-full object-cover"
                />
                {isComposing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
                <p className="text-white/40 text-sm font-gaegu">합성 중…</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 하단 버튼 영역 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-3 pb-10 md:pb-12 flex gap-3">
          {/* 배경 고르기 */}
          <button
            onClick={() => setIsBgPickerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 border-white/30 bg-white/10 text-white font-gaegu font-bold text-base md:text-lg transition-all active:scale-95 hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            배경 고르기
          </button>

          {/* 결정 */}
          <button
            onClick={handleConfirm}
            disabled={isComposing || !previewUrl}
            className={[
              'flex-1 py-3.5 font-gaegu font-bold text-xl rounded-full border-[3px] transition-all duration-150',
              isComposing || !previewUrl
                ? 'bg-white/20 text-white/40 border-white/20 cursor-not-allowed'
                : 'bg-coral text-white border-coral active:scale-95 hover:brightness-110',
            ].join(' ')}
          >
            {isComposing ? '합성 중…' : '결정 →'}
          </button>
        </div>

      </div>

      {/* 배경 선택 모달 */}
      {isBgPickerOpen && (
        <BgPickerModal onClose={() => setIsBgPickerOpen(false)} />
      )}
    </div>
  )
}
