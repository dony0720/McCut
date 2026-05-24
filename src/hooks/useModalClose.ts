import { useState, useCallback } from 'react'

/**
 * 모달 퇴장 애니메이션 후 실제로 언마운트하는 훅.
 * isClosing이 true인 동안 out 애니메이션 클래스를 적용하고,
 * 애니메이션 완료 후 onClose 콜백을 호출한다.
 */
export function useModalClose(onClose: () => void, durationMs = 220) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, durationMs)
  }, [onClose, durationMs])

  return { isClosing, handleClose }
}
