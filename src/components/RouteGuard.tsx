import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useApp } from '@/context/AppContext'

interface Props {
  children: ReactNode
  /** 이 라우트에 진입하기 위한 최소 조건 */
  require: 'photos' | 'selection' | 'composed'
}

/**
 * 흐름 순서를 강제하는 라우트 가드.
 * 조건이 충족되지 않으면 적절한 이전 단계로 리다이렉트한다.
 */
export default function RouteGuard({ children, require }: Props) {
  const { state } = useApp()

  if (require === 'photos' && state.capturedPhotos.length < 8) {
    return <Navigate to="/camera" replace />
  }

  if (require === 'selection' && state.selectedIndices.length < 4) {
    return <Navigate to="/select" replace />
  }

  if (require === 'composed' && !state.composedImage) {
    return <Navigate to="/frame" replace />
  }

  return <>{children}</>
}
