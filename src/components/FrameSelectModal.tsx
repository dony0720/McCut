import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import type { FrameOption } from '@/types'
import { useModalClose } from '@/hooks/useModalClose'
import FramePreview from '@/components/FramePreview'
import BgSelectGrid, { BG_OPTIONS } from '@/components/BgSelectGrid'

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

type Step = 'frame' | 'bg'

export default function FrameSelectModal({ onClose, onConfirm }: Props) {
  const { state, setFrameStyle, setBgId } = useApp()
  const selected = state.frameStyle
  const { isClosing, handleClose } = useModalClose(onClose)

  const [step, setStep] = useState<Step>('frame')
  const [stepAnim, setStepAnim] = useState<'enter-right' | 'enter-left' | ''>('enter-right')

  function goToStep(next: Step, direction: 'forward' | 'back') {
    setStepAnim(direction === 'forward' ? 'enter-right' : 'enter-left')
    setStep(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* 백드롭 */}
      <div
        className={[
          'absolute inset-0 bg-ink/40',
          isClosing ? 'modal-backdrop-out' : 'modal-backdrop-in',
        ].join(' ')}
        onClick={handleClose}
      />

      {/* 모달 시트 */}
      <div
        className={[
          'relative w-full box-border bg-cream-100 overflow-hidden mx-4',
          'rounded-t-3xl md:rounded-3xl',
          'border-t-[3px] md:border-[3px] border-x-[3px] border-ink',
          isClosing ? 'modal-sheet-out' : 'modal-sheet-in',
        ].join(' ')}
      >
        {/* 스텝 인디케이터 */}
        <div className="flex gap-1.5 justify-center pt-5 md:pt-6 pb-1 md:hidden">
          <div className={`h-1 rounded-full transition-all duration-300 ${step === 'frame' ? 'w-6 bg-ink' : 'w-2 bg-ink/20'}`} />
          <div className={`h-1 rounded-full transition-all duration-300 ${step === 'bg' ? 'w-6 bg-ink' : 'w-2 bg-ink/20'}`} />
        </div>

        {/* 스텝 콘텐츠 래퍼 */}
        <div
          key={step}
          className={[
            'px-6 md:px-10 pt-4 md:pt-6 pb-8 md:pb-10',
            stepAnim === 'enter-right' ? 'step-enter-right' : stepAnim === 'enter-left' ? 'step-enter-left' : '',
          ].join(' ')}
        >
          {step === 'frame' ? (
            <>
              {/* ── Step 1: 프레임 선택 ── */}
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
                  onClick={handleClose}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border-[2.5px] border-ink flex items-center justify-center transition-all active:scale-90 hover:bg-ink/5 mt-1 shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="1" y1="1" x2="13" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="13" y1="1" x2="1" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                {FRAME_OPTIONS.map((opt) => {
                  const isSelected = selected === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFrameStyle(opt.id)}
                      className={[
                        'relative rounded-2xl border-[3px] overflow-hidden bg-cream-50',
                        'transition-all duration-150 active:scale-95',
                        isSelected
                          ? 'border-coral shadow-[0_0_0_2px_#e8573a20]'
                          : 'border-ink/20 hover:border-ink/40',
                      ].join(' ')}
                    >
                      <div className="p-2 md:p-3">
                        <FramePreview variant={opt.id} />
                      </div>
                      <div className="px-3 pb-3 md:px-4 md:pb-4 text-left">
                        <p className="font-gaegu font-bold text-ink text-base md:text-lg leading-tight">{opt.label}</p>
                        <p className="text-ink/40 text-xs md:text-sm">{opt.sub}</p>
                      </div>
                      {isSelected && (
                        <div className="anim-check-bounce absolute top-2 left-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-coral border-[2px] border-white flex items-center justify-center shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      {opt.isNew && (
                        <div className="absolute top-2 right-2 bg-[#f5c842] border-[2px] border-ink rounded-md px-1.5 py-0.5">
                          <span className="font-gaegu font-bold text-ink text-[0.6rem] md:text-xs tracking-wide">NEW</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => goToStep('bg', 'forward')}
                className="w-full py-4 md:py-5 bg-ink text-cream-100 font-gaegu font-bold text-xl md:text-2xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95 hover:bg-ink/80"
              >
                다음 — 배경 고르기 →
              </button>
            </>
          ) : (
            <>
              {/* ── Step 2: 배경 선택 ── */}
              <div className="flex items-start justify-between mb-5 md:mb-7">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => goToStep('frame', 'back')}
                    className="flex items-center gap-1.5 text-ink/50 hover:text-ink text-sm mb-2 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    프레임 다시 고르기
                  </button>
                  <h2 className="font-gaegu font-bold text-ink text-3xl md:text-4xl tracking-[0.03em]">
                    배경 고르기
                  </h2>
                  {/* 선택된 배경 인라인 표시 */}
                  <p className="text-ink/50 text-sm md:text-base mt-0.5">
                    {BG_OPTIONS.find((o) => o.id === state.bgId)
                      ? <><span className="text-coral font-semibold">{BG_OPTIONS.find((o) => o.id === state.bgId)?.label}</span> 선택됨</>
                      : '사진 배경 이미지를 골라봐!'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border-[2.5px] border-ink flex items-center justify-center transition-all active:scale-90 hover:bg-ink/5 mt-1 shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="1" y1="1" x2="13" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="13" y1="1" x2="1" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* 배경 선택 그리드 */}
              <div className="mb-6 md:mb-8">
                <BgSelectGrid
                  selected={state.bgId}
                  onSelect={setBgId}
                />
              </div>

              <button
                onClick={onConfirm}
                className="w-full py-4 md:py-5 bg-ink text-cream-100 font-gaegu font-bold text-xl md:text-2xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95 hover:bg-ink/80"
              >
                촬영 시작하기 →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
