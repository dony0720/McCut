import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import RouteGuard from '@/components/RouteGuard'
import WelcomePage from '@/pages/WelcomePage'
import CameraPage from '@/pages/CameraPage'
import SelectPage from '@/pages/SelectPage'
import BgSelectPage from '@/pages/BgSelectPage'
import FramePage from '@/pages/FramePage'
import ResultPage from '@/pages/ResultPage'
import SharePage from '@/pages/SharePage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* 시작 */}
          <Route path="/" element={<WelcomePage />} />

          {/* 촬영 */}
          <Route path="/camera" element={<CameraPage />} />

          {/* 사진 선택 — 8장이 없으면 /camera 로 */}
          <Route
            path="/select"
            element={
              <RouteGuard require="photos">
                <SelectPage />
              </RouteGuard>
            }
          />

          {/* 배경 선택 — 4장 선택이 없으면 /select 로 */}
          <Route
            path="/bg-select"
            element={
              <RouteGuard require="selection">
                <BgSelectPage />
              </RouteGuard>
            }
          />

          {/* 프레임 선택 — 4장 선택이 없으면 /select 로 */}
          <Route
            path="/frame"
            element={
              <RouteGuard require="selection">
                <FramePage />
              </RouteGuard>
            }
          />

          {/* 결과 — 4장 선택이 없으면 /select 로 (합성은 ResultPage 내부에서 수행) */}
          <Route
            path="/result"
            element={
              <RouteGuard require="selection">
                <ResultPage />
              </RouteGuard>
            }
          />

          {/* QR 공유 — 독립 접근 가능 */}
          <Route path="/share/:id" element={<SharePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
