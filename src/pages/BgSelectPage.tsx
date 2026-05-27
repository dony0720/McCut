import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import BgSelectGrid from '@/components/BgSelectGrid'

export default function BgSelectPage() {
  const navigate = useNavigate()
  const { state, setBgId } = useApp()
  const { capturedPhotos, selectedIndices, bgId } = state

  const selectedPhotos = selectedIndices.map((i) => capturedPhotos[i])

  return (
    <div className="h-[100dvh] bg-cream-50 flex flex-col items-center overflow-hidden">
      <div className="w-full box-border flex flex-col h-full">

        {/* ── 헤더 ── */}
        <div className="flex items-center gap-3 px-4 md:px-6 pt-5 md:pt-7 pb-3 shrink-0">
          <button
            onClick={() => navigate('/select')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ink/5 flex items-center justify-center transition-all active:scale-90 hover:bg-ink/10 shrink-0"
            aria-label="뒤로가기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="#1a1614" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-gaegu font-bold text-ink text-2xl md:text-3xl">배경 고르기</h1>
        </div>

        {/* ── 선택된 사진 2×2 미리보기 ── */}
        <div className="px-4 md:px-6 pb-4 shrink-0">
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {selectedPhotos.map((photo, i) => (
              <div key={i} className="aspect-[3/4] overflow-hidden">
                <img
                  src={photo}
                  alt={`선택 사진 ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── 배경 선택 그리드 ── */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4">
          <p className="font-gaegu text-ink/60 text-sm md:text-base mb-3">배경을 선택하세요</p>
          <BgSelectGrid selected={bgId} onSelect={setBgId} />
        </div>

        {/* ── 결정 버튼 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-3 pb-10 md:pb-12 bg-cream-50 border-t border-ink/10">
          <button
            onClick={() => navigate('/result')}
            className="w-full py-4 md:py-5 bg-ink text-cream-100 font-gaegu font-bold text-xl md:text-2xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95 hover:bg-ink/80"
          >
            결정 →
          </button>
        </div>

      </div>
    </div>
  )
}
