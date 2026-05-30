import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useComposer } from "@/hooks/useComposer";
import { useClipComposer } from "@/hooks/useClipComposer";
import { uploadResult } from "@/lib/uploadResult";
import ShareModal from "@/components/ShareModal";

/** 6자리 디스플레이 ID 생성 (세션당 고정) */
function makeDisplayId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { state, setComposedImage, setVideoBlob, setShareId, reset } = useApp();
  const { capturedPhotos, selectedIndices, frameStyle, bgId, composedImage, videoBlob, clipBlobs, clipDurations } =
    state;

  const selectedClips = selectedIndices.map((i) => clipBlobs[i]).filter(Boolean) as Blob[]
  const selectedDurations = selectedIndices.map((i) => clipDurations[i] ?? 0)

  const displayId = useRef(makeDisplayId());
  const pendingVideoResolveRef = useRef<((blob: Blob) => void) | null>(null)
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, [])

  const selectedPhotos = selectedIndices.map((i) => capturedPhotos[i]);

  const handleComposed = useCallback(
    (dataUrl: string) => {
      setComposedImage(dataUrl);
    },
    [setComposedImage],
  );

  const { compose, isComposing, error } = useComposer({
    photos: selectedPhotos,
    bgId,
    frameStyle,
    onComplete: handleComposed,
  });

  const handleClipComposed = useCallback((blob: Blob) => {
    setVideoBlob(blob)

    // 저장하기 버튼이 영상 합성을 기다리는 중이면 resolve 후 다운로드 생략
    if (pendingVideoResolveRef.current) {
      pendingVideoResolveRef.current(blob)
      pendingVideoResolveRef.current = null
      return
    }

    // 영상 저장 버튼으로 수동 실행한 경우 → 로컬 자동 다운로드
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mccut_${displayId.current}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showToast('영상이 저장되었습니다 🎬')
  }, [showToast, setVideoBlob])

  const { compose: composeClip } = useClipComposer({
    clips: selectedClips,
    clipDurations: selectedDurations,
    bgId,
    frameStyle,
    onComplete: handleClipComposed,
  })

  // 마운트 시 자동 합성 (이미 합성된 경우 스킵)
  useEffect(() => {
    if (!composedImage && selectedPhotos.length === 4) {
      compose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 저장하기 (영상 합성 → 업로드 → QR) ──────────────────────────────────
  async function handleSave() {
    if (!composedImage || isUploading) return
    setIsUploading(true)
    try {
      // 영상이 아직 합성되지 않았으면 자동으로 합성 후 기다림
      let videoToUpload = videoBlob
      if (!videoToUpload && selectedClips.length >= 4) {
        showToast('영상 합성 중…')
        videoToUpload = await new Promise<Blob>((resolve) => {
          pendingVideoResolveRef.current = resolve
          composeClip()
        })
      }

      showToast('클라우드에 저장 중…')
      const result = await uploadResult({
        imageDataUrl: composedImage,
        videoBlob: videoToUpload ?? undefined,
      })
      setShareId(result.shareId)
      setShareImageUrl(result.imageUrl)
      setShowShareModal(true)
    } catch (e) {
      console.error('[handleSave]', e)
      showToast('저장에 실패했습니다. 다시 시도해 주세요 😥')
    } finally {
      setIsUploading(false)
    }
  }

  // ── 다시 찍기 ─────────────────────────────────────────────────────────────
  function handleReset() {
    reset();
    navigate("/");
  }

  return (
    <>
    <div className="h-screen bg-cream-50 flex flex-col items-center overflow-hidden relative">
      <div className="w-full box-border flex flex-col h-full">
        {/* ── 헤더 ── */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-7 pb-2 shrink-0">
          <button
            onClick={handleReset}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ink/5 flex items-center justify-center transition-all active:scale-90 hover:bg-ink/10"
            aria-label="처음으로"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4L14 14M14 4L4 14"
                stroke="#1a1614"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h1 className="font-gaegu font-bold text-ink text-2xl md:text-3xl">
            완성됐어!
          </h1>

          {/* ID 배지 */}
          <div className="border-[1.5px] border-ink/30 rounded-full px-3 py-1">
            <span className="font-mono text-xs md:text-sm text-ink/60 tracking-wider">
              #{displayId.current}
            </span>
          </div>
        </div>

        {/* ── 카드 영역 (스크롤 없음) ── */}
        <div className="flex-1 min-h-0 overflow-hidden px-8 md:px-12 py-4 flex flex-col items-center justify-center relative">
          {/* 배경 스파클 */}
          <span className="absolute top-10 left-6 text-coral/60 text-2xl select-none pointer-events-none">
            ✦
          </span>
          <span className="absolute top-24 right-5 text-ink/20 text-base select-none pointer-events-none">
            ✦
          </span>
          <span className="absolute bottom-16 left-10 text-ink/15 text-xs select-none pointer-events-none">
            ✳
          </span>
          <span className="absolute bottom-28 right-8 text-coral/50 text-lg select-none pointer-events-none">
            ✦
          </span>

          {/* 폰 카드 */}
          <div className="relative  w-full flex justify-center">
            {/* 테이프 장식 */}
            <div className="absolute -top-3.5 left-8 w-14 h-6 md:w-16 md:h-7 rounded-sm bg-[rgba(255,224,102,0.85)] z-10 rotate-[-2deg]" />
            <div className="absolute -top-3.5 right-8 w-14 h-6 md:w-16 md:h-7 rounded-sm bg-[rgba(168,230,207,0.85)] z-10 rotate-[2deg]" />

            {/* 카드 본체 — 이미지 크기에 맞춰 수축 */}
            <div
              className={[
                "rounded-2xl overflow-hidden ",
                composedImage && !isComposing
                  ? "bg-transparent"
                  : "bg-white w-full",
              ].join(" ")}
            >
              {isComposing && (
                <div className="aspect-[4/5] w-full flex flex-col items-center justify-center gap-4 bg-cream-100">
                  <div className="w-10 h-10 rounded-full border-[3px] border-coral border-t-transparent animate-spin" />
                  <p className="font-gaegu text-ink/50 text-sm">
                    사진 합성 중…
                  </p>
                </div>
              )}

              {error && !isComposing && (
                <div className="aspect-[4/5] w-full flex flex-col items-center justify-center gap-4 bg-cream-100 p-8 text-center">
                  <p className="text-ink/60 text-sm">{error}</p>
                  <button
                    onClick={compose}
                    className="px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold active:scale-95 transition-all"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {composedImage && !isComposing && (
                <img
                  src={composedImage}
                  alt="완성된 네컷 사진"
                  className="max-h-[calc(100vh-200px)] w-auto block"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── 토스트 ── */}
        {toast && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-ink/90 text-white text-sm font-medium shadow-lg whitespace-nowrap animate-fade-in-up pointer-events-none">
            {toast}
          </div>
        )}

        {/* ── 하단 버튼 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-4 pb-10 md:pb-12 bg-cream-50 border-t border-ink/10 flex flex-row gap-3">
          <button
            onClick={() => navigate('/bg-select')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border-2 border-ink/20 bg-white text-ink font-semibold text-sm md:text-base transition-all active:scale-95 hover:bg-ink/5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
            배경 다시 고르기
          </button>
          <button
            onClick={handleSave}
            disabled={!composedImage || isUploading}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full",
              "font-semibold text-base md:text-lg transition-all",
              composedImage && !isUploading
                ? "bg-coral text-white hover:brightness-110 active:scale-95"
                : "bg-coral/40 text-white/70 cursor-not-allowed",
            ].join(" ")}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                저장 중…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                저장하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* QR 공유 모달 */}
    {showShareModal && shareImageUrl && (
      <ShareModal
        imageUrl={shareImageUrl}
        onClose={() => setShowShareModal(false)}
      />
    )}
    </>
  );
}
