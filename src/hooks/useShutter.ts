import { useState, useCallback, useRef } from 'react'
import type Webcam from 'react-webcam'

interface UseShutterOptions {
  webcamRef: React.RefObject<Webcam | null>
  onCapture: (dataUrl: string) => void
  onComplete: () => void
  totalShots: number
  currentCount: number
}

/**
 * 셔터 촬영 로직 훅
 * - 촬영 → flash 효과 → addPhoto → 완료 시 콜백
 */
export function useShutter({
  webcamRef,
  onCapture,
  onComplete,
  totalShots,
  currentCount,
}: UseShutterOptions) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [flashVisible, setFlashVisible] = useState(false)
  const completedRef = useRef(false)

  const capture = useCallback(() => {
    if (isCapturing || currentCount >= totalShots) return
    if (!webcamRef.current) return

    const dataUrl = webcamRef.current.getScreenshot()
    if (!dataUrl) return

    setIsCapturing(true)
    setFlashVisible(true)

    // 플래시 효과
    setTimeout(() => setFlashVisible(false), 150)

    onCapture(dataUrl)

    const nextCount = currentCount + 1
    if (nextCount >= totalShots && !completedRef.current) {
      completedRef.current = true
      setTimeout(() => onComplete(), 400)
    }

    setTimeout(() => setIsCapturing(false), 300)
  }, [isCapturing, currentCount, totalShots, webcamRef, onCapture, onComplete])

  return { capture, isCapturing, flashVisible }
}
