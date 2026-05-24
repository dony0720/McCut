import { useState, useRef, useCallback, useEffect } from 'react'

interface UseCountdownOptions {
  from?: number
  onComplete: () => void
}

/**
 * 카운트다운 훅
 * - count: 현재 숫자 (null = 비활성)
 * - start(): 카운트다운 시작
 * - cancel(): 카운트다운 취소
 */
export function useCountdown({ from = 3, onComplete }: UseCountdownOptions) {
  const [count, setCount] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCount(null)
  }, [])

  const start = useCallback(() => {
    cancel()
    setCount(from)

    let current = from
    timerRef.current = setInterval(() => {
      current -= 1
      if (current <= 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setCount(null)
        onComplete()
      } else {
        setCount(current)
      }
    }, 1000)
  }, [from, cancel, onComplete])

  // 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return { count, start, cancel, isRunning: count !== null }
}
