import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'

const OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const ITEM_H = 64   // 각 아이템 높이 (px)
const VISIBLE = 5   // 보이는 아이템 수 (홀수)

interface TimerModalProps {
  onClose: () => void
}

export default function TimerModal({ onClose }: TimerModalProps) {
  const { state, setTimerSeconds } = useApp()
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(state.timerSeconds)

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = OPTIONS.indexOf(state.timerSeconds)
    el.scrollTop = idx * ITEM_H
  }, [state.timerSeconds])

  // 스크롤 멈추면 가장 가까운 값으로 스냅
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let rafId: number
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!el) return
        const idx = Math.round(el.scrollTop / ITEM_H)
        const clamped = Math.max(0, Math.min(OPTIONS.length - 1, idx))
        setSelected(OPTIONS[clamped])
      })
    }

    // 스크롤 끝 감지 — 스크롤 멈추면 snap
    let stopTimer: ReturnType<typeof setTimeout>
    function onScrollEnd() {
      clearTimeout(stopTimer)
      stopTimer = setTimeout(() => {
        if (!el) return
        const idx = Math.round(el.scrollTop / ITEM_H)
        const clamped = Math.max(0, Math.min(OPTIONS.length - 1, idx))
        el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' })
        setSelected(OPTIONS[clamped])
      }, 80)
    }

    el.addEventListener('scroll', onScroll)
    el.addEventListener('scroll', onScrollEnd)
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scroll', onScrollEnd)
      cancelAnimationFrame(rafId)
      clearTimeout(stopTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleConfirm() {
    setTimerSeconds(selected)
    onClose()
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  const containerH = ITEM_H * VISIBLE
  const pad = ITEM_H * Math.floor(VISIBLE / 2)

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
    >
      <div className="w-full max-w-md bg-cream-100 rounded-t-3xl px-6 pt-5 pb-10 flex flex-col gap-5">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-ink/20 rounded-full mx-auto" />

        {/* 타이틀 */}
        <div>
          <h2 className="font-gaegu font-bold text-ink text-2xl">타이머 설정</h2>
          <p className="text-ink/50 text-sm mt-0.5">카운트다운 길이 = 클립 길이 = 영상 길이</p>
        </div>

        {/* 드럼롤 피커 */}
        <div className="relative mx-auto w-40" style={{ height: containerH }}>
          {/* 선택 영역 하이라이트 */}
          <div
            className="absolute left-0 right-0 pointer-events-none rounded-2xl bg-ink/8 border-y-2 border-ink/10 z-10"
            style={{ top: pad, height: ITEM_H }}
          />

          {/* 위/아래 페이드 */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-cream-100 to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream-100 to-transparent pointer-events-none z-20" />

          {/* 스크롤 영역 */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* 상단 패딩 */}
            <div style={{ height: pad }} />

            {OPTIONS.map((sec) => {
              const isSelected = sec === selected
              return (
                <div
                  key={sec}
                  style={{ height: ITEM_H }}
                  className="flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const el = scrollRef.current
                    const idx = OPTIONS.indexOf(sec)
                    el?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
                    setSelected(sec)
                  }}
                >
                  <span
                    className={[
                      'font-gaegu font-bold transition-all duration-150 select-none',
                      isSelected
                        ? 'text-ink text-5xl'
                        : 'text-ink/25 text-3xl',
                    ].join(' ')}
                  >
                    {sec}초
                  </span>
                </div>
              )
            })}

            {/* 하단 패딩 */}
            <div style={{ height: pad }} />
          </div>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-full bg-ink text-cream-100 font-gaegu font-bold text-xl active:scale-95 transition-all hover:brightness-110"
        >
          {selected}초로 설정하기
        </button>
      </div>
    </div>
  )
}
