/** classic=2×2 | strip=1×4 | dark=식스컷2×3 | mint=와이드1+2 */
export type FrameStyle = 'classic' | 'strip' | 'dark' | 'mint'

export interface FrameOption {
  id: FrameStyle
  label: string
  sub: string
  isNew?: boolean
}
