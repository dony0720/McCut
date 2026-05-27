import { useApp } from '@/context/AppContext'
import BgSelectGrid from '@/components/BgSelectGrid'

interface Props {
  onClose: () => void
}

export default function BgPickerModal({ onClose }: Props) {
  const { state, setBgId } = useApp()

  function handleSelect(id: Parameters<typeof setBgId>[0]) {
    setBgId(id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />

      {/* 모달 시트 */}
      <div className="relative w-full mx-4 bg-cream-100 rounded-3xl border-[3px] border-ink max-h-[60dvh] flex flex-col overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="font-gaegu font-bold text-ink text-xl md:text-2xl">배경 선택</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-ink/20 flex items-center justify-center hover:bg-ink/5 transition-all active:scale-90"
            aria-label="닫기"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#1a1614" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 배경 그리드 */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <BgSelectGrid selected={state.bgId} onSelect={handleSelect} />
        </div>

      </div>
    </div>
  )
}
