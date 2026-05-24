import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { useApp } from '@/context/AppContext'

const TOTAL_SHOTS = 8

export default function CameraPage() {
  const navigate = useNavigate()
  const { state } = useApp()
  const webcamRef = useRef<Webcam>(null)

  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isFlashOn, setIsFlashOn] = useState(false)

  const shotCount = state.capturedPhotos.length

  const handleUserMedia = useCallback(() => {
    setHasPermission(true)
  }, [])

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false)
  }, [])

  function toggleFacing() {
    setFacing((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  return (
    <div className="min-h-screen bg-[#1c1814] flex flex-col items-center">
      <div className="w-full max-w-sm md:max-w-lg flex flex-col min-h-screen">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-7 pb-3 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 진행 표시 */}
          <span className="font-gaegu font-bold text-white text-xl md:text-2xl tracking-wide">
            {shotCount} / {TOTAL_SHOTS} 컷
          </span>

          {/* 플래시 버튼 */}
          <button
            onClick={() => setIsFlashOn((v) => !v)}
            className={[
              'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-90',
              isFlashOn ? 'bg-coral' : 'bg-white/10 hover:bg-white/20',
            ].join(' ')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M10 2L4 10h6l-2 6 8-9h-6l2-7z" fill={isFlashOn ? 'white' : '#ffffff99'} />
            </svg>
          </button>
        </div>

        {/* ── 뷰파인더 ── */}
        <div className="flex-1 flex flex-col px-4 md:px-6 min-h-0">
          <div className="relative rounded-3xl overflow-hidden bg-[#2a2420] flex-1">

            {/* 진행 바 (상단 내부) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-1.5 w-7 md:w-9 rounded-full transition-all duration-300',
                    i < shotCount ? 'bg-coral' : 'bg-white/25',
                  ].join(' ')}
                />
              ))}
            </div>

            {/* 모서리 브라켓 */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-[3px] border-l-[3px] border-white/70 rounded-tl-lg z-10" />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-[3px] border-r-[3px] border-white/70 rounded-tr-lg z-10" />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-[3px] border-l-[3px] border-white/70 rounded-bl-lg z-10" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-[3px] border-r-[3px] border-white/70 rounded-br-lg z-10" />

            {/* 카메라 스트림 */}
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p className="text-white/60 text-sm md:text-base">
                  카메라 접근 권한이 필요합니다
                </p>
                <p className="text-white/40 text-xs md:text-sm">
                  브라우저 설정에서 카메라를 허용해주세요
                </p>
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                mirrored={facing === 'user'}
                videoConstraints={{ facingMode: facing, aspectRatio: 3 / 4 }}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* ── 하단 컨트롤 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-5 pb-8 md:pb-10 flex flex-col items-center gap-5">

          {/* 컨트롤 아이콘 3개 */}
          <div className="flex items-center justify-center gap-10 md:gap-14">
            {/* 타이머 */}
            <button className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8"/>
                <path d="M12 9v4l3 3"/>
                <path d="M9 3h6"/>
                <path d="M12 3v2"/>
              </svg>
              <span className="text-white text-[0.65rem] md:text-xs font-semibold tracking-widest">3s</span>
            </button>

            {/* FLIP */}
            <button
              onClick={toggleFacing}
              className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity active:scale-90"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <polyline points="15 13 18 10 21 13"/>
                <polyline points="9 13 6 10 3 13"/>
              </svg>
              <span className="text-white text-[0.65rem] md:text-xs font-semibold tracking-widest">FLIP</span>
            </button>

            {/* AUTO */}
            <button className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span className="text-white text-[0.65rem] md:text-xs font-semibold tracking-widest">AUTO</span>
            </button>
          </div>

          {/* 셔터 버튼 — 6-2에서 기능 연결 */}
          <button className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-coral border-[4px] border-white/30 flex items-center justify-center transition-all active:scale-90 hover:brightness-110 shadow-lg">
            <span className="font-gaegu font-bold text-white text-lg md:text-xl">찰칵</span>
          </button>
        </div>
      </div>
    </div>
  )
}
