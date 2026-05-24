interface IconBoxProps {
  variant: 'hatch' | 'smile' | 'plug' | 'dead'
  size?: number
}

export default function IconBox({ variant, size = 64 }: IconBoxProps) {
  const base = `inline-flex items-center justify-center rounded-2xl border-[3px] border-ink`

  if (variant === 'hatch') {
    return (
      <div
        className={`${base} overflow-hidden`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 64 64">
          <rect width="64" height="64" fill="white" />
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={i}
              x1={i * 10 - 20}
              y1="0"
              x2={i * 10 + 44}
              y2="64"
              stroke="#1a1614"
              strokeWidth="3.5"
            />
          ))}
        </svg>
      </div>
    )
  }

  if (variant === 'smile') {
    return (
      <div
        className={`${base} bg-ink`}
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 42 42">
          {/* 눈 */}
          <circle cx="13" cy="16" r="3.5" fill="white" />
          <circle cx="29" cy="16" r="3.5" fill="white" />
          {/* 입 */}
          <path
            d="M11 26 Q21 35 31 26"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (variant === 'plug') {
    return (
      <div
        className={`${base} bg-white`}
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 38 38">
          {/* 플러그 몸통 */}
          <rect x="10" y="16" width="18" height="14" rx="3" fill="none" stroke="#1a1614" strokeWidth="3" />
          {/* 핀 */}
          <line x1="14" y1="10" x2="14" y2="17" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
          <line x1="24" y1="10" x2="24" y2="17" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
          {/* 코드 */}
          <line x1="19" y1="30" x2="19" y2="36" stroke="#1a1614" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // dead (XX face)
  return (
    <div
      className={`${base} bg-ink`}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 42 42">
        {/* X 눈 왼쪽 */}
        <line x1="9" y1="11" x2="17" y2="19" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="17" y1="11" x2="9" y2="19" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* X 눈 오른쪽 */}
        <line x1="25" y1="11" x2="33" y2="19" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="33" y1="11" x2="25" y2="19" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* 일자 입 */}
        <line x1="13" y1="30" x2="29" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}
