import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconBox from "@/components/IconBox";
import { useApp } from "@/context/AppContext";
import TimerModal from "@/components/TimerModal";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { reset, state } = useApp();
  const [showTimerModal, setShowTimerModal] = useState(false);

  function handleStart() {
    reset();
    navigate("/camera");
  }

  return (
    <div className="h-[100dvh] bg-cream-100 flex flex-col items-center overflow-hidden">
      {/* 메인 콘텐츠 — 화면 전체를 3개 영역으로 균등 분배 */}
      <div className="w-full box-border flex flex-col flex-1 px-6 md:px-12">
        {/* ── 상단 영역: 아이콘 + 타이틀 ── */}
        <div className="flex flex-col items-center pt-10 md:pt-16">
          {/* 아이콘 박스 4개 */}
          <div className="flex items-end justify-center gap-3 md:gap-6 mb-8 md:mb-10">
            <div className="anim-icon-1">
              <IconBox variant="hatch" size={60} />
            </div>
            <div className="anim-icon-2">
              <IconBox variant="smile" size={68} />
            </div>
            <div className="anim-icon-3">
              <IconBox variant="plug" size={60} />
            </div>
            <div className="anim-icon-4 -translate-y-2">
              <IconBox variant="dead" size={68} />
            </div>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="anim-title font-gaegu font-bold text-ink text-5xl md:text-7xl leading-tight text-center tracking-[0.05em] whitespace-nowrap mb-2 md:mb-3">
            MCCUT
          </h1>

          {/* 서브타이틀 */}
          <p className="anim-sub text-center text-ink/50 tracking-[0.3em] uppercase text-[0.65rem] md:text-sm">
            ✦ McCut · Since 2026 ✦
          </p>
        </div>

        {/* ── 중간 영역: 스파클 장식 (남은 공간 채움) ── */}
        <div className="anim-sparkle flex-1 relative min-h-[80px]">
          <span className="absolute left-4 top-8 md:top-12 text-ink text-xl md:text-3xl select-none">
            ✦
          </span>
          <span className="absolute right-6 top-6 md:top-10 text-coral text-sm md:text-xl select-none">
            ✳
          </span>
          <span className="absolute left-1/4 bottom-1/3 text-ink/30 text-base md:text-2xl select-none">
            ✦
          </span>
          <span className="absolute right-1/4 bottom-1/4 text-ink/20 text-sm md:text-lg select-none">
            ✳
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-4 text-ink text-lg md:text-2xl select-none">
            ✦
          </span>
        </div>

        {/* ── 하단 영역: 버튼 + 카운터 ── */}
        <div className="pb-4 md:pb-8">
          <div className="anim-buttons flex flex-col gap-3 md:gap-4">
            {/* 코랄 말풍선 버튼 */}
            <div className="relative pb-3">
              <button className="w-full py-4 md:py-5 bg-coral hover:brightness-95 text-white font-gaegu font-bold text-lg md:text-xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95">
                NEW 앨범 이미지로 나만의 네컷 만들기!
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[2px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[11px] border-l-transparent border-r-transparent border-t-ink" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[4px] w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px] border-l-transparent border-r-transparent border-t-coral" />
            </div>

            {/* 촬영하기 */}
            <button
              onClick={handleStart}
              className="w-full py-4 md:py-5 bg-ink hover:bg-ink/80 text-cream-100 font-gaegu font-bold text-xl md:text-2xl rounded-full border-[3px] border-ink transition-all duration-150 active:scale-95"
            >
              촬영하기
            </button>
          </div>

          {/* 생성된 네컷 카운터 */}
          <p className="anim-counter text-center text-ink/40 text-xs md:text-sm mt-5 tracking-wide">
            생성된 네컷 개수: <span className="font-semibold">1,024</span>
          </p>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="anim-tabbar w-full box-border border-t-[2px] border-ink/10 bg-cream-100">
        <div className="flex items-center justify-around px-4 py-3 md:py-5">
          {/* home — active */}
          <button className="flex flex-col items-center gap-1 transition-opacity">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-ink md:w-7 md:h-7">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-ink text-[0.6rem] md:text-xs font-bold tracking-widest">home</span>
            <div className="w-6 h-[3px] bg-ink rounded-full -mt-1" />
          </button>

          {/* timer settings */}
          <button
            onClick={() => setShowTimerModal(true)}
            className="flex flex-col items-center gap-1 opacity-40 transition-opacity hover:opacity-70 active:opacity-100"
          >
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink md:w-7 md:h-7">
                <circle cx="12" cy="13" r="8"/>
                <path d="M12 9v4l2 2"/>
                <path d="M5 3 2 6M22 6l-3-3M6.38 18.7 4 21M17.64 18.67 20 21"/>
              </svg>
              {/* 현재 타이머 뱃지 */}
              <span className="absolute -top-1.5 -right-2.5 bg-coral text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {state.timerSeconds}
              </span>
            </div>
            <span className="text-ink text-[0.6rem] md:text-xs tracking-widest">timer</span>
          </button>
        </div>
      </div>

      {/* 타이머 설정 모달 */}
      {showTimerModal && <TimerModal onClose={() => setShowTimerModal(false)} />}
    </div>
  );
}
