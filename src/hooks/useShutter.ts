import { useState, useCallback, useRef, useEffect } from 'react'
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
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([])

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timeoutIds.current.push(id)
    return id
  }, [])

  // 언마운트 시 모든 타임아웃 정리
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout)
      timeoutIds.current = []
    }
  }, [])

  const capture = useCallback(() => {
    if (isCapturing || currentCount >= totalShots) return
    if (!webcamRef.current) return

    const dataUrl = webcamRef.current.getScreenshot()
    if (!dataUrl) return

    setIsCapturing(true)
    setFlashVisible(true)

    scheduleTimeout(() => setFlashVisible(false), 150)

    onCapture(dataUrl)

    const nextCount = currentCount + 1
    if (nextCount >= totalShots && !completedRef.current) {
      completedRef.current = true
      scheduleTimeout(() => onComplete(), 400)
    }

    scheduleTimeout(() => setIsCapturing(false), 300)
  }, [isCapturing, currentCount, totalShots, webcamRef, onCapture, onComplete, scheduleTimeout])

  return { capture, isCapturing, flashVisible }
}
