import { useNavigate } from 'react-router-dom'
import IconBox from '@/components/IconBox'
import { useApp } from '@/context/AppContext'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { reset } = useApp()

  function handleCamera() {
    reset()
    navigate('/camera')
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center">
      <div className="w-full max-w-sm flex flex-col px-6 pt-10 pb-4 flex-1">

        {/* 아이콘 박스 4개 — stagger drop-in */}
        <div className="flex items-end justify-center gap-3 mb-8">
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
        <h1 className="anim-title font-gaegu font-bold text-ink text-6xl leading-tight text-center tracking-[0.05em] mb-2">
          나만의 네컷
        </h1>

        {/* 서브타이틀 */}
        <p className="anim-sub text-center text-ink/50 tracking-[0.3em] uppercase text-[0.65rem] mb-6">
          ✦ McCut · Since 2026 ✦
        </p>

        {/* 스파클 장식 */}
        <div className="anim-sparkle relative h-20 mb-4">
          <span className="absolute left-4 top-4 text-ink text-xl select-none">✦</span>
          <span className="absolute right-6 top-2 text-coral text-sm select-none">✳</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-ink text-lg select-none">✦</span>
        </div>

        {/* 버튼 영역 */}
        <div className="anim-buttons flex flex-col gap-3">

          {/* 코랄 말풍선 버튼 — 텍스트 추후 변경 예정 */}
          <div className="relative pb-3">
            <button className="w-full py-4 bg-coral hover:brightness-95 text-white font-gaegu font-bold text-lg rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95">
              NEW 앨범 이미지로 나만의 네컷 만들기!
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[2px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[11px] border-l-transparent border-r-transparent border-t-ink" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[4px] w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px] border-l-transparent border-r-transparent border-t-coral" />
          </div>

          {/* 촬영하기 */}
          <button
            onClick={handleCamera}
            className="w-full py-4 bg-ink hover:bg-ink/80 text-cream-100 font-gaegu font-bold text-xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95"
          >
            촬영하기
          </button>
        </div>

        {/* 생성된 네컷 카운터 */}
        <p className="anim-counter text-center text-ink/40 text-xs mt-5 tracking-wide">
          생성된 네컷 개수: <span className="font-semibold">1,024</span>
        </p>
      </div>

      {/* 하단 탭바 */}
      <div className="anim-tabbar w-full max-w-sm border-t-[2px] border-ink/10 bg-cream-100">
        <div className="flex items-center justify-around px-4 py-3">

          {/* store */}
          <button className="flex flex-col items-center gap-1 opacity-40 transition-opacity hover:opacity-60">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="text-ink text-[0.6rem] tracking-widest">tabs.store</span>
          </button>

          {/* home — active */}
          <button className="flex flex-col items-center gap-1 transition-opacity">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-ink">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-ink text-[0.6rem] font-bold tracking-widest">tabs.home</span>
            <div className="w-6 h-[3px] bg-ink rounded-full -mt-1" />
          </button>

          {/* gallery */}
          <button className="flex flex-col items-center gap-1 opacity-40 transition-opacity hover:opacity-60">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-ink text-[0.6rem] tracking-widest">tabs.gallery</span>
          </button>
        </div>
      </div>
    </div>
  )
}
