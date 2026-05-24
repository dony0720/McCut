import { useApp } from '@/context/AppContext'
import type { FrameOption } from '@/types'
import FramePreview from '@/components/FramePreview'

interface Props {
  onClose: () => void
  onConfirm: () => void
}

const FRAME_OPTIONS: FrameOption[] = [
  { id: 'classic', label: '클래식', sub: '2 × 2' },
  { id: 'strip',   label: '스트립', sub: '1 × 4', isNew: true },
  { id: 'dark',    label: '식스컷', sub: '2 × 3' },
  { id: 'mint',    label: '와이드', sub: '1 + 2' },
]

export default function FrameSelectModal({ onClose, onConfirm }: Props) {
  const { state, setFrameStyle } = useApp()
  const selected = state.frameStyle

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      {/* 모달 시트 */}
      <div className="relative w-full max-w-sm md:max-w-lg bg-cream-100 rounded-t-3xl md:rounded-3xl border-t-[3px] md:border-[3px] border-x-[3px] border-ink px-6 md:px-10 pt-6 pb-8 md:pb-10">

        {/* 핸들 바 */}
        <div className="w-10 h-1 bg-ink/20 rounded-full mx-auto mb-5 md:hidden" />

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5 md:mb-7">
          <div>
            <h2 className="font-gaegu font-bold text-ink text-3xl md:text-4xl tracking-[0.03em]">
              프레임 고르기
            </h2>
            <p className="text-ink/50 text-sm md:text-base mt-0.5">
              마음에 드는 컷 스타일을 골라봐!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 md:w-11 md:h-11 rounded-full border-[2.5px] border-ink flex items-center justify-center transition-all active:scale-90 hover:bg-ink/5 mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 프레임 카드 그리드 */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          {FRAME_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setFrameStyle(opt.id)}
                className={[
                  'relative rounded-2xl border-[3px] overflow-hidden transition-all duration-150 active:scale-95 bg-cream-50',
                  isSelected
                    ? 'border-coral shadow-[0_0_0_2px_#e8573a20]'
                    : 'border-ink/20 hover:border-ink/40',
                ].join(' ')}
              >
                {/* 미리보기 */}
                <div className="p-2 md:p-3">
                  <FramePreview variant={opt.id} />
                </div>

                {/* 라벨 */}
                <div className="px-3 pb-3 md:px-4 md:pb-4 text-left">
                  <p className="font-gaegu font-bold text-ink text-base md:text-lg leading-tight">
                    {opt.label}
                  </p>
                  <p className="text-ink/40 text-xs md:text-sm">{opt.sub}</p>
                </div>

                {/* 선택 체크마크 */}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-coral border-[2px] border-white flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                {/* NEW 뱃지 */}
                {opt.isNew && (
                  <div className="absolute top-2 right-2 bg-[#f5c842] border-[2px] border-ink rounded-md px-1.5 py-0.5">
                    <span className="font-gaegu font-bold text-ink text-[0.6rem] md:text-xs tracking-wide">NEW</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full py-4 md:py-5 bg-ink text-cream-100 font-gaegu font-bold text-xl md:text-2xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95 hover:bg-ink/80"
        >
          이 프레임으로 시작하기 →
        </button>
      </div>
    </div>
  )
}
