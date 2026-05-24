import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const REQUIRED = 4;

export default function SelectPage() {
  const navigate = useNavigate();
  const { state, toggleSelect, clearSelection } = useApp();
  const { capturedPhotos, selectedIndices } = state;

  const total = capturedPhotos.length;
  const selectedCount = selectedIndices.length;
  const canProceed = selectedCount === REQUIRED;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center">
      <div className="w-full max-w-sm md:max-w-3xl flex flex-col min-h-screen">
        {/* ── 헤더 ── */}
        <div className="flex items-center gap-3 px-4 md:px-6 pt-5 md:pt-7 pb-3 shrink-0">
          <button
            onClick={() => navigate("/camera")}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ink/5 flex items-center justify-center transition-all active:scale-90 hover:bg-ink/10 shrink-0"
            aria-label="뒤로가기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 4L6 9l5 5"
                stroke="#1a1614"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="font-gaegu font-bold text-ink text-2xl md:text-3xl">
            사진 골라봐
          </h1>
        </div>

        {/* ── 상태 배너 ── */}
        <div className="px-4 md:px-6 pb-4 shrink-0">
          <div className="flex items-center gap-3 bg-coral/10 rounded-2xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm tabular-nums">
                {selectedCount}
              </span>
            </div>
            <p className="text-ink/70 text-sm md:text-base font-medium leading-snug">
              {total}장 중 {selectedCount}장 선택됨
            </p>
          </div>
        </div>

        {/* ── 사진 그리드 ── */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {capturedPhotos.map((photo, index) => {
              const orderIdx = selectedIndices.indexOf(index);
              const isSelected = orderIdx !== -1;
              const isDisabled = !isSelected && selectedCount >= REQUIRED;

              return (
                <button
                  key={index}
                  onClick={() => toggleSelect(index)}
                  disabled={isDisabled}
                  className={[
                    "relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-200",
                    "active:scale-[0.97] focus:outline-none",
                    isSelected
                      ? "ring-[3px] ring-coral shadow-md"
                      : isDisabled
                        ? "ring-1 ring-ink/10 opacity-50"
                        : "ring-1 ring-ink/10",
                  ].join(" ")}
                >
                  {/* 사진 */}
                  <img
                    src={photo}
                    alt={`촬영 사진 ${index + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* 선택 뱃지 (좌상단) */}
                  <div className="absolute top-2 left-2">
                    {isSelected ? (
                      <div
                        key={`badge-${orderIdx}`}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-coral flex items-center justify-center anim-badge-pop shadow-sm"
                      >
                        <span className="text-white font-bold text-sm">
                          {orderIdx + 1}
                        </span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/80 border-2 border-white/50 shadow-sm" />
                    )}
                  </div>

                  {/* 사진 번호 라벨 (우하단) */}
                  <div className="absolute bottom-2 right-2 bg-ink/55 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="text-white text-xs font-mono tracking-tight">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 하단 버튼 ── */}
        <div className="shrink-0 px-4 md:px-6 pt-3 pb-10 md:pb-12 flex gap-3 bg-cream-50 border-t border-ink/10">
          <button
            onClick={clearSelection}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border-2 border-ink/20 bg-white text-ink font-semibold text-sm md:text-base transition-all active:scale-95 hover:bg-ink/5 shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            다시
          </button>

          <button
            onClick={() => navigate("/result")}
            disabled={!canProceed}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full",
              "font-semibold text-base md:text-lg transition-all",
              canProceed
                ? "bg-coral text-white hover:brightness-110 active:scale-95"
                : "bg-coral/40 text-white/70 cursor-not-allowed",
            ].join(" ")}
          >
            완성하기
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
