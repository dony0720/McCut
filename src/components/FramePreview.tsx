import type { FrameStyle } from '@/types'

interface Props {
  variant: FrameStyle
}

const cell = 'bg-cream-300 rounded-sm'

export default function FramePreview({ variant }: Props) {
  if (variant === 'classic') {
    // 2×2
    return (
      <div className="w-full aspect-square grid grid-cols-2 gap-1 p-1">
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
      </div>
    )
  }

  if (variant === 'strip') {
    // 1×4 가로
    return (
      <div className="w-full aspect-[4/1.4] grid grid-cols-4 gap-1 p-1">
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
      </div>
    )
  }

  if (variant === 'dark') {
    // 식스컷 2×3
    return (
      <div className="w-full aspect-[2/3] grid grid-cols-2 gap-1 p-1">
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
        <div className={cell} />
      </div>
    )
  }

  // mint = 와이드 1+2
  return (
    <div className="w-full aspect-square flex gap-1 p-1">
      <div className={`${cell} flex-1`} />
      <div className="flex flex-col gap-1 flex-1">
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
      </div>
    </div>
  )
}
