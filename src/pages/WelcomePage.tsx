import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import IconBox from "@/components/IconBox";
import { useApp } from "@/context/AppContext";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { reset, setPhotos } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCamera() {
    reset();
    navigate("/camera");
  }

  function handleAlbumClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const readers = files.slice(0, 8).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((dataUrls) => {
      reset();
      setPhotos(dataUrls);
      navigate("/select");
    });

    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center">
      <div className="w-full max-w-sm flex flex-col px-6 pt-10 pb-8 gap-0">
        {/* 아이콘 박스 4개 */}
        <div className="flex items-end justify-center gap-3 mb-8">
          <IconBox variant="hatch" size={60} />
          <IconBox variant="smile" size={68} />
          <IconBox variant="plug" size={60} />
          <div className="-translate-y-2">
            <IconBox variant="dead" size={68} />
          </div>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="font-gaegu font-bold text-ink text-6xl leading-tight text-center tracking-[0.05em] mb-2">
          나만의 네컷
        </h1>

        {/* 서브타이틀 */}
        <p className="text-center text-ink/50 tracking-[0.3em] uppercase text-[0.65rem] mb-6">
          ✦ McCut · Since 2026 ✦
        </p>

        {/* 스파클 장식 */}
        <div className="relative h-20 mb-6">
          <span className="absolute left-4 top-4 text-ink text-xl select-none">
            ✦
          </span>
          <span className="absolute right-6 top-2 text-coral text-sm select-none">
            ✳
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-ink text-lg select-none">
            ✦
          </span>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col gap-3">
          {/* 코랄 하이라이트 버튼 */}
          <div className="relative pb-3">
            <button
              onClick={handleAlbumClick}
              className="w-full py-4 bg-coral text-white font-gaegu font-bold text-lg rounded-full border-[3px] border-ink transition-transform active:scale-95"
            >
              NEW 앨범 이미지로 나만의 네컷 만들기!
            </button>
            {/* 말풍선 꼬리 — 바깥 테두리 */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[2px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[11px] border-l-transparent border-r-transparent border-t-ink" />
            {/* 말풍선 꼬리 — 안쪽 채우기 */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[4px] w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px] border-l-transparent border-r-transparent border-t-coral" />
          </div>

          {/* 촬영하기 */}
          <button
            onClick={handleCamera}
            className="w-full py-4 bg-ink text-cream-100 font-gaegu font-bold text-xl rounded-full border-[3px] border-ink transition-transform active:scale-95"
          >
            촬영하기!
          </button>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
