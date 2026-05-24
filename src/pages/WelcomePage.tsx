import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconBox from '@/components/IconBox'
import FrameSelectModal from '@/components/FrameSelectModal'
import { useApp } from '@/context/AppContext'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { reset } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleOpenModal() {
    reset()
    setIsModalOpen(true)
  }

  function handleConfirm() {
    setIsModalOpen(false)
    navigate('/camera')
  }

  function handleCloseModal() {
    setIsModalOpen(false)
  }

  return (
    <div className="h-[100dvh] bg-cream-100 flex flex-col items-center overflow-hidden">

      {/* 메인 콘텐츠 — 화면 전체를 3개 영역으로 균등 분배 */}
      <div className="w-full max-w-sm md:max-w-3xl flex flex-col flex-1 px-6 md:px-12">

        {/* ── 상단 영역: 아이콘 + 타이틀 ── */}
        <div className="flex flex-col items-center pt-10 md:pt-16">
          {/* 아이콘 박스 4개 */}
          <div className="flex items-end justify-center gap-3 md:gap-6 mb-8 md:mb-10">
            <div className="anim-icon-1">
              <IconBox variant="hatch" size={60} />
            </div>
            <div className="anim-icon-2">
              <IconBox variant="smile" size={68} />
            </div>
            <div className="anim-icon-3">
              <IconBox variant="plug" size={60} />
            </div>
            <div className="anim-icon-4 -translate-y-2">
              <IconBox variant="dead" size={68} />
            </div>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="anim-title font-gaegu font-bold text-ink text-5xl md:text-7xl leading-tight text-center tracking-[0.05em] whitespace-nowrap mb-2 md:mb-3">
            나만의 네컷
          </h1>

          {/* 서브타이틀 */}
          <p className="anim-sub text-center text-ink/50 tracking-[0.3em] uppercase text-[0.65rem] md:text-sm">
            ✦ McCut · Since 2026 ✦
          </p>
        </div>

        {/* ── 중간 영역: 스파클 장식 (남은 공간 채움) ── */}
        <div className="anim-sparkle flex-1 relative min-h-[80px]">
          <span className="absolute left-4 top-8 md:top-12 text-ink text-xl md:text-3xl select-none">✦</span>
          <span className="absolute right-6 top-6 md:top-10 text-coral text-sm md:text-xl select-none">✳</span>
          <span className="absolute left-1/4 bottom-1/3 text-ink/30 text-base md:text-2xl select-none">✦</span>
          <span className="absolute right-1/4 bottom-1/4 text-ink/20 text-sm md:text-lg select-none">✳</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-4 text-ink text-lg md:text-2xl select-none">✦</span>
        </div>

        {/* ── 하단 영역: 버튼 + 카운터 ── */}
        <div className="pb-4 md:pb-8">
          <div className="anim-buttons flex flex-col gap-3 md:gap-4">

            {/* 코랄 말풍선 버튼 */}
            <div className="relative pb-3">
              <button className="w-full py-4 md:py-5 bg-coral hover:brightness-95 text-white font-gaegu font-bold text-lg md:text-xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95">
                NEW 앨범 이미지로 나만의 네컷 만들기!
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[2px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[11px] border-l-transparent border-r-transparent border-t-ink" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[4px] w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px] border-l-transparent border-r-transparent border-t-coral" />
            </div>

            {/* 촬영하기 */}
            <button
              onClick={handleOpenModal}
              className="w-full py-4 md:py-5 bg-ink hover:bg-ink/80 text-cream-100 font-gaegu font-bold text-xl md:text-2xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95"
            >
              촬영하기
            </button>
          </div>

          {/* 생성된 네컷 카운터 */}
          <p className="anim-counter text-center text-ink/40 text-xs md:text-sm mt-5 tracking-wide">
            생성된 네컷 개수: <span className="font-semibold">1,024</span>
          </p>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="anim-tabbar w-full max-w-sm md:max-w-3xl border-t-[2px] border-ink/10 bg-cream-100">
        <div className="flex items-center justify-around px-4 py-3 md:py-5">

          {/* store */}
          <button className="flex flex-col items-center gap-1 opacity-40 transition-opacity hover:opacity-60">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink md:w-7 md:h-7">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="text-ink text-[0.6rem] md:text-xs tracking-widest">tabs.store</span>
          </button>

          {/* home — active */}
          <button className="flex flex-col items-center gap-1 transition-opacity">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-ink md:w-7 md:h-7">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-ink text-[0.6rem] md:text-xs font-bold tracking-widest">tabs.home</span>
            <div className="w-6 h-[3px] bg-ink rounded-full -mt-1" />
          </button>

          {/* gallery */}
          <button className="flex flex-col items-center gap-1 opacity-40 transition-opacity hover:opacity-60">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink md:w-7 md:h-7">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-ink text-[0.6rem] md:text-xs tracking-widest">tabs.gallery</span>
          </button>
        </div>
      </div>

      {/* 프레임 선택 모달 */}
      {isModalOpen && (
        <FrameSelectModal
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
