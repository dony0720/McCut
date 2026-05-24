/** 배경 이미지 식별자 — public/backgrounds/ 파일명 기반 */
export type BgId =
  | 'strawberry'
  | 'hamburger'
  | 'fries'
  | 'pudding'
  | 'corn'
  | 'cookie'
  | 'vegetable'

export interface BgOption {
  id: BgId
  label: string
  /** 이미지 로드 실패 시 표시할 대체 색상 */
  fallbackColor: string
  /** public/backgrounds/ 기준 파일 경로 */
  imagePath: string
}
