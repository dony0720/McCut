import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareModalProps {
  imageUrl: string
  videoUrl?: string | null
  onClose: () => void;
}

export default function ShareModal({ imageUrl, videoUrl, onClose }: ShareModalProps) {
  const params = new URLSearchParams({ img: imageUrl })
  if (videoUrl) params.set('vid', videoUrl)
  const shareUrl = `${window.location.origin}/share?${params.toString()}`
  const overlayRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  // ESC 키 닫기
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* 클립보드 미지원 환경 무시 */
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
    >
      <div className="fixed top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-7 animate-fade-in-up">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ink/5 flex items-center justify-center hover:bg-ink/10 transition-all active:scale-90"
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="#1a1614"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* 제목 */}
        <div className="text-center">
          <h2 className="font-gaegu font-bold text-ink text-3xl">QR 코드</h2>
          <p className="text-ink/50 text-base mt-1">
            스캔하면 사진·영상을 다운받을 수 있어요
          </p>
        </div>

        {/* QR 코드 */}
        <div className="p-5 bg-white rounded-2xl border-2 border-ink/10 shadow-inner">
          <QRCodeSVG
            value={shareUrl}
            size={300}
            bgColor="#ffffff"
            fgColor="#1a1614"
            level="M"
          />
        </div>

        {/* URL + 복사 버튼 */}
        <div className="w-full flex items-center gap-2 bg-ink/5 rounded-xl px-4 py-3">
          <span className="flex-1 text-sm text-ink/60 font-mono truncate">
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-sm font-bold text-coral hover:text-coral/70 transition-colors active:scale-95"
          >
            복사
          </button>
        </div>

        {/* 안내 */}
        <p className="text-sm text-ink/40 text-center leading-relaxed">
          링크는 30일간 유효합니다
        </p>
      </div>
    </div>
  );
}
