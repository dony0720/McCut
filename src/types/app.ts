import type { FrameStyle } from './frame'
import type { BgId } from './bg'

export interface AppState {
  /** 촬영된 8장의 사진 (data URL) */
  capturedPhotos: string[]
  /** 선택된 4장의 사진 인덱스 (선택 순서 유지) */
  selectedIndices: number[]
  /** 선택된 프레임 스타일 */
  frameStyle: FrameStyle
  /** 선택된 배경 이미지 식별자 */
  bgId: BgId
  /** Canvas 합성 결과 이미지 (data URL) */
  composedImage: string | null
  /** 공유용 고유 ID */
  shareId: string | null
}
