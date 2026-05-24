interface Props {
  onClose: () => void
  onConfirm: () => void
}

export default function FrameSelectModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />

      {/* 모달 시트 — 모바일: 바텀시트 / 태블릿: 중앙 다이얼로그 */}
      <div className="relative w-full max-w-sm md:max-w-lg bg-cream-100 rounded-t-3xl md:rounded-3xl border-t-[3px] md:border-[3px] border-x-[3px] border-ink px-6 md:px-10 pt-6 pb-8 md:pb-10">

        {/* 핸들 바 */}
        <div className="w-10 h-1 bg-ink/20 rounded-full mx-auto mb-5" />

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-gaegu font-bold text-ink text-3xl tracking-[0.03em]">
              프레임 고르기
            </h2>
            <p className="text-ink/50 text-sm mt-0.5">
              마음에 드는 컷 스타일을 골라봐!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border-[2.5px] border-ink flex items-center justify-center transition-all active:scale-90 hover:bg-ink/5 mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="#1a1614" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 프레임 카드 그리드 — 4-2에서 채움 */}
        <div className="grid grid-cols-2 gap-4 mt-6 mb-8 min-h-[200px]">
          <div className="col-span-2 flex items-center justify-center text-ink/30 text-sm">
            프레임 옵션 준비 중…
          </div>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-ink text-cream-100 font-gaegu font-bold text-xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95 hover:bg-ink/80"
        >
          이 프레임으로 시작하기 →
        </button>
      </div>
    </div>
  )
}
