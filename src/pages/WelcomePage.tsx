import { useNavigate } from 'react-router-dom'
import IconBox from '@/components/IconBox'
import { useApp } from '@/context/AppContext'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { reset } = useApp()

  function handleStart() {
    reset()
    navigate('/camera')
  }

  return (
    <div className="min-h-full bg-cream-100 flex flex-col items-center">
      {/* 모바일 컨테이너 */}
      <div className="w-full max-w-sm flex flex-col min-h-screen px-6 pt-10 pb-8">

        {/* 아이콘 박스 4개 */}
        <div className="flex items-end justify-center gap-3 mb-8">
          <IconBox variant="hatch" size={60} />
          <IconBox variant="smile" size={68} />
          <IconBox variant="plug" size={60} />
          {/* 마지막 박스는 살짝 위로 떠 있는 효과 */}
          <div className="-translate-y-2">
            <IconBox variant="dead" size={68} />
          </div>
        </div>

        {/* 메인 타이틀 */}
        <div className="text-center mb-2">
          <h1
            className="font-gaegu font-bold text-ink leading-tight"
            style={{ fontSize: 'clamp(3rem, 16vw, 4rem)', letterSpacing: '0.05em' }}
          >
            나만의 네컷
          </h1>
        </div>

        {/* 서브타이틀 */}
        <p
          className="text-center text-ink/50 font-sans tracking-[0.3em] uppercase mb-1"
          style={{ fontSize: '0.65rem' }}
        >
          ✦ McCut · Since 2026 ✦
        </p>

        {/* 스파클 장식 영역 */}
        <div className="relative flex-1 flex items-center justify-center min-h-[80px]">
          <span className="absolute left-6 top-4 text-ink text-xl select-none">✦</span>
          <span className="absolute right-8 top-2 text-coral text-sm select-none">✳</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-ink text-lg select-none">✦</span>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* 촬영하기 — 메인 CTA */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-ink text-cream-100 font-gaegu font-bold text-xl rounded-full border-[3px] border-ink transition-transform active:scale-95"
          >
            촬영하기
          </button>
        </div>

        {/* 생성된 네컷 카운터 (장식용) */}
        <p className="text-center text-ink/40 text-xs mt-5 tracking-wide">
          생성된 네컷 개수: <span className="font-semibold">1,024</span>
        </p>
      </div>
    </div>
  )
}
