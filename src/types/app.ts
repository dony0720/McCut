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
  /** 촬영 중 녹화된 영상 Blob (전체 세션) */
  videoBlob: Blob | null
  /** 카운트다운별 개별 클립 Blob 배열 (최대 8개) */
  clipBlobs: Blob[]
  /** 각 클립의 실제 녹화 길이 (ms) */
  clipDurations: number[]
  /** 공유용 고유 ID */
  shareId: string | null
}
