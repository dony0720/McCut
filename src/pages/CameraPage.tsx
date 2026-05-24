import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { useApp } from '@/context/AppContext'
import { useShutter } from '@/hooks/useShutter'
import { useCountdown } from '@/hooks/useCountdown'

const TOTAL_SHOTS = 8

export default function CameraPage() {
  const navigate = useNavigate()
  const { state, addPhoto } = useApp()
  const webcamRef = useRef<Webcam>(null)

  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [captureFlash, setCaptureFlash] = useState(false)
  const [viewfinderBlink, setViewfinderBlink] = useState(false)

  const autoActiveRef = useRef(false)
  const shotCountRef = useRef(state.capturedPhotos.length)
  shotCountRef.current = state.capturedPhotos.length

  const shotCount = state.capturedPhotos.length

  const handleUserMedia = useCallback(() => setHasPermission(true), [])
  const handleUserMediaError = useCallback(() => setHasPermission(false), [])

  const triggerCaptureEffect = useCallback(() => {
    setCaptureFlash(true)
    setViewfinderBlink(true)
    setTimeout(() => setCaptureFlash(false), 120)
    setTimeout(() => setViewfinderBlink(false), 250)
  }, [])

  const handleCountdownComplete = useCallback(() => {
    if (!webcamRef.current) return
    const dataUrl = webcamRef.current.getScreenshot()
    if (!dataUrl) return

    triggerCaptureEffect()
    addPhoto(dataUrl)
    const nextCount = shotCountRef.current + 1

    if (nextCount >= TOTAL_SHOTS) {
      autoActiveRef.current = false
      setTimeout(() => navigate('/select'), 400)
      return
    }

    if (autoActiveRef.current) {
      setTimeout(() => {
        if (autoActiveRef.current) startCountdown()
      }, 300)
    }
  }, [addPhoto, navigate, triggerCaptureEffect])

  const { capture, flashVisible } = useShutter({
    webcamRef,
    onCapture: addPhoto,
    onComplete: () => navigate('/select'),
    totalShots: TOTAL_SHOTS,
    currentCount: shotCount,
  })

  const { count, start: startCountdown, cancel: cancelCountdown, isRunning } = useCountdown({
    from: 3,
    onComplete: handleCountdownComplete,
  })

  useEffect(() => {
    if (flashVisible) triggerCaptureEffect()
  }, [flashVisible, triggerCaptureEffect])

  function handleShutter() {
    if (shotCount >= TOTAL_SHOTS || hasPermission === false) return

    if (autoActiveRef.current || isRunning) {
      autoActiveRef.current = false
      cancelCountdown()
    } else {
      autoActiveRef.current = true
      startCountdown()
    }
  }

  // capture는 더 이상 수동 촬영에 사용하지 않으므로 lint 방지
  void capture

  const isActive = autoActiveRef.current || isRunning
  const isDisabled = shotCount >= TOTAL_SHOTS || hasPermission === false

  return (
    <div className="min-h-screen bg-[#1c1814] flex flex-col items-center">
      <div className="w-full max-w-sm md:max-w-lg flex flex-col min-h-screen">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-7 pb-3 shrink-0">
          <button
            onClick={() => { autoActiveRef.current = false; cancelCountdown(); navigate('/') }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <span className="font-gaegu font-bold text-white text-xl md:text-2xl tracking-wide">
            {shotCount} / {TOTAL_SHOTS} 컷
          </span>

          {/* 카메라 전환 */}
          <button
            onClick={() => { autoActiveRef.current = false; cancelCountdown(); setFacing(f => f === 'user' ? 'environment' : 'user') }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <polyline points="15 13 18 10 21 13"/>
              <polyline points="9 13 6 10 3 13"/>
            </svg>
          </button>
        </div>

        {/* ── 뷰파인더 ── */}
        <div className="flex-1 flex flex-col px-4 md:px-6 min-h-0">
          <div className={[
            'relative rounded-3xl overflow-hidden bg-[#2a2420] flex-1 transition-all duration-150',
            viewfinderBlink ? 'ring-4 ring-white/80' : '',
          ].join(' ')}>

            {/* 화이트 플래시 오버레이 */}
            {captureFlash && (
              <div className="absolute inset-0 bg-white z-20 pointer-events-none rounded-3xl" />
            )}

            {/* 카운트다운 오버레이 */}
            {isRunning && count !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black/50 border-[3px] border-white flex items-center justify-center">
                  <span key={count} className="anim-count-pop font-gaegu font-bold text-white text-7xl md:text-8xl">
                    {count}
                  </span>
                </div>
              </div>
            )}

            {/* 진행 바 */}
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
                <p className="text-white/60 text-sm md:text-base">카메라 접근 권한이 필요합니다</p>
                <p className="text-white/40 text-xs md:text-sm">브라우저 설정에서 카메라를 허용해주세요</p>
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

        {/* ── 셔터 버튼 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-5 pb-10 md:pb-14 flex flex-col items-center">
          <button
            onClick={handleShutter}
            disabled={isDisabled}
            className={[
              'w-20 h-20 md:w-24 md:h-24 rounded-full border-[4px] border-white/30 flex items-center justify-center',
              'transition-all shadow-lg',
              isDisabled
                ? 'bg-coral/50 cursor-not-allowed'
                : isActive
                  ? 'bg-white/20 hover:bg-white/30 active:scale-90'
                  : 'bg-coral hover:brightness-110 active:scale-90',
            ].join(' ')}
          >
            <span className="font-gaegu font-bold text-white text-lg md:text-xl">
              {isActive ? '정지' : '찰칵'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
