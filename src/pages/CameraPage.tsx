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
  const [isStreamReady, setIsStreamReady] = useState(false)
  const [cameraError, setCameraError] = useState<'permission' | 'other' | null>(null)
  const [captureFlash, setCaptureFlash] = useState(false)
  const [viewfinderBlink, setViewfinderBlink] = useState(false)
  const [filledBars, setFilledBars] = useState<number[]>([])

  const [autoActive, setAutoActiveState] = useState(false)
  const autoActiveRef = useRef(false)
  const shotCountRef = useRef(state.capturedPhotos.length)

  // state와 ref를 항상 동기화 — ref는 콜백 stale closure 방지용
  const setAutoActive = useCallback((val: boolean) => {
    autoActiveRef.current = val
    setAutoActiveState(val)
  }, [])
  shotCountRef.current = state.capturedPhotos.length

  const shotCount = state.capturedPhotos.length

  // 진행 바: 새로 채워진 칸 추적 (애니메이션용)
  const prevShotCount = useRef(shotCount)
  useEffect(() => {
    if (shotCount > prevShotCount.current) {
      setFilledBars(prev => [...prev, shotCount - 1])
    }
    prevShotCount.current = shotCount
  }, [shotCount])

  const handleUserMedia = useCallback(() => {
    setIsStreamReady(true)
    setCameraError(null)
  }, [])

  const handleUserMediaError = useCallback((err: string | DOMException) => {
    const name = typeof err === 'string' ? err : err.name

    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      // 실제 권한 거부 — 브라우저 설정에서만 복구 가능
      setCameraError('permission')
    } else if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
      // facingMode 제약 실패 → 이미 'user'면 소프트 오류로 전환, 아니면 폴백
      if (facing !== 'user') {
        setFacing('user')
      } else {
        setCameraError('other')
      }
    } else {
      // NotFoundError(장치 없음), NotReadableError(장치 사용 중), 기타 일시적 오류
      setCameraError('other')
    }
  }, [facing])

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
      setAutoActive(false)
      setTimeout(() => navigate('/select'), 400)
      return
    }

    if (autoActiveRef.current) {
      setTimeout(() => {
        if (autoActiveRef.current) startCountdown()
      }, 300)
    }
  }, [addPhoto, navigate, triggerCaptureEffect, setAutoActive])

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
    if (shotCount >= TOTAL_SHOTS || !isStreamReady || cameraError === 'permission') return

    if (autoActive || isRunning) {
      setAutoActive(false)
      cancelCountdown()
    } else {
      setAutoActive(true)
      startCountdown()
    }
  }

  void capture

  const isActive = autoActive || isRunning
  const isDisabled = shotCount >= TOTAL_SHOTS || !isStreamReady || cameraError === 'permission'

  return (
    <div className="h-[100dvh] bg-[#1c1814] flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-sm md:max-w-3xl flex flex-col h-full">

        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-7 pb-4 shrink-0">
          <button
            onClick={() => { setAutoActive(false); cancelCountdown(); navigate('/') }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
            aria-label="뒤로가기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 카메라 전환 */}
          <button
            onClick={() => { setAutoActive(false); cancelCountdown(); setIsStreamReady(false); setFacing(f => f === 'user' ? 'environment' : 'user') }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
            aria-label="카메라 전환"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <polyline points="15 13 18 10 21 13"/>
              <polyline points="9 13 6 10 3 13"/>
            </svg>
          </button>
        </div>

        {/* ── 진행 바 ── */}
        <div className="px-4 md:px-6 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/15"
                >
                  {i < shotCount && (
                    <div
                      className={[
                        'h-full w-full rounded-full bg-coral',
                        filledBars.includes(i) ? 'anim-bar-fill' : '',
                      ].join(' ')}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="font-gaegu text-white/60 text-sm md:text-base tabular-nums shrink-0 ml-1">
              {shotCount}/{TOTAL_SHOTS}
            </span>
          </div>
        </div>

        {/* ── 뷰파인더 ── */}
        <div className="flex-1 flex flex-col px-4 md:px-6 min-h-0">
          <div className={[
            'relative rounded-3xl overflow-hidden bg-[#2a2420] flex-1 transition-all duration-150',
            viewfinderBlink ? 'ring-4 ring-coral/80' : '',
          ].join(' ')}>

            {/* 화이트 플래시 오버레이 */}
            {captureFlash && (
              <div className="absolute inset-0 bg-white z-20 pointer-events-none rounded-3xl" />
            )}

            {/* 카운트다운 오버레이 */}
            {isRunning && count !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    key={count}
                    className="anim-count-pop font-gaegu font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                    style={{ fontSize: 'clamp(7rem, 20vw, 10rem)', lineHeight: 1 }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            )}

            {/* 모서리 브라켓 */}
            <div className="absolute top-3 left-3 w-6 h-6 md:w-7 md:h-7 border-t-[2.5px] border-l-[2.5px] border-white/60 rounded-tl-md z-10" />
            <div className="absolute top-3 right-3 w-6 h-6 md:w-7 md:h-7 border-t-[2.5px] border-r-[2.5px] border-white/60 rounded-tr-md z-10" />
            <div className="absolute bottom-3 left-3 w-6 h-6 md:w-7 md:h-7 border-b-[2.5px] border-l-[2.5px] border-white/60 rounded-bl-md z-10" />
            <div className="absolute bottom-3 right-3 w-6 h-6 md:w-7 md:h-7 border-b-[2.5px] border-r-[2.5px] border-white/60 rounded-br-md z-10" />

            {/* 카메라 스트림 */}
            {cameraError === 'permission' ? (
              /* 실제 권한 거부 — 브라우저 설정에서만 복구 가능 */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-40">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p className="text-white/60 text-sm md:text-base">카메라 접근 권한이 필요합니다</p>
                <p className="text-white/40 text-xs md:text-sm">브라우저 설정에서 카메라를 허용해주세요</p>
              </div>
            ) : (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.92}
                  mirrored={facing === 'user'}
                  videoConstraints={{ facingMode: { ideal: facing } }}
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                />
                {/* 일시적 오류 — 소프트 오버레이 + 재시도 (Webcam 유지) */}
                {cameraError === 'other' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 z-10 p-8 text-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="opacity-50">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p className="text-white/80 text-sm md:text-base">카메라를 불러오지 못했습니다</p>
                    <p className="text-white/40 text-xs md:text-sm">다른 앱에서 카메라를 사용 중이거나<br/>장치를 찾을 수 없습니다</p>
                    <button
                      onClick={() => { setCameraError(null); setIsStreamReady(false); }}
                      className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all active:scale-95"
                    >
                      다시 시도
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── 셔터 버튼 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-6 pb-10 md:pb-14 flex flex-col items-center gap-3">
          <button
            onClick={handleShutter}
            disabled={isDisabled}
            className={[
              'w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center',
              'transition-all duration-200',
              isDisabled
                ? 'bg-coral/40 border-[4px] border-white/20 cursor-not-allowed'
                : isActive
                  ? 'bg-white/20 border-[4px] border-white/40 hover:bg-white/30 active:scale-90'
                  : 'bg-coral border-[4px] border-white/30 hover:brightness-110 active:scale-90 anim-shutter-idle',
            ].join(' ')}
          >
            <span className="font-gaegu font-bold text-white text-lg md:text-xl">
              {isActive ? '정지' : '찰칵'}
            </span>
          </button>

          {isActive && (
            <p className="text-white/40 text-xs font-gaegu animate-pulse">
              자동 촬영 중…
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
