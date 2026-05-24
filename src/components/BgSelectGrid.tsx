import { useState } from 'react'
import type { BgId, BgOption } from '@/types'

export const BG_OPTIONS: BgOption[] = [
  { id: 'strawberry', label: '딸기',    fallbackColor: '#fce4ec', imagePath: '/backgrounds/strawberry.jpeg' },
  { id: 'hamburger',  label: '햄버거',  fallbackColor: '#fff8e1', imagePath: '/backgrounds/hamburger.jpeg' },
  { id: 'fries',      label: '감자튀김', fallbackColor: '#fff3e0', imagePath: '/backgrounds/fries.jpeg' },
  { id: 'pudding',    label: '푸딩',    fallbackColor: '#f3e5f5', imagePath: '/backgrounds/pudding.jpeg' },
  { id: 'corn',       label: '옥수수',  fallbackColor: '#fffde7', imagePath: '/backgrounds/corn.jpeg' },
  { id: 'cookie',     label: '쿠키',    fallbackColor: '#efebe9', imagePath: '/backgrounds/cookie.jpeg' },
  { id: 'vegetable',  label: '채소',    fallbackColor: '#e8f5e9', imagePath: '/backgrounds/Vegetable.jpeg' },
]

interface Props {
  selected: BgId
  onSelect: (id: BgId) => void
}

function BgThumb({ opt, isSelected, onSelect }: {
  opt: BgOption
  isSelected: boolean
  onSelect: () => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={onSelect}
      className={[
        'relative rounded-2xl overflow-hidden border-[3px] aspect-square',
        'transition-all duration-150 active:scale-95',
        isSelected
          ? 'border-coral shadow-[0_0_0_2px_#e8573a20]'
          : 'border-ink/20 hover:border-ink/40',
      ].join(' ')}
    >
      {/* 배경 이미지 or 대체 색상 */}
      {!imgError ? (
        <img
          src={opt.imagePath}
          alt={opt.label}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ backgroundColor: opt.fallbackColor }}
        />
      )}

      {/* 라벨 오버레이 */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent pt-4 pb-1.5 px-2">
        <p className="font-gaegu font-bold text-white text-xs md:text-sm text-center drop-shadow">
          {opt.label}
        </p>
      </div>

      {/* 선택 체크마크 */}
      {isSelected && (
        <div className="anim-check-bounce absolute top-2 left-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-coral border-[2px] border-white flex items-center justify-center shadow-sm">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  )
}

export default function BgSelectGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5 md:gap-3">
      {BG_OPTIONS.map((opt) => (
        <BgThumb
          key={opt.id}
          opt={opt}
          isSelected={selected === opt.id}
          onSelect={() => onSelect(opt.id)}
        />
      ))}
    </div>
  )
}
