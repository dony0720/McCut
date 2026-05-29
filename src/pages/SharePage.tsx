import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function SharePage() {
  const [searchParams] = useSearchParams()
  const imageUrl = searchParams.get('img')
  const videoUrl = searchParams.get('vid')
  const [isSaving, setIsSaving] = useState(false)
  const error = !imageUrl

  async function blobDownload(url: string, filename: string) {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  }

  async function handleSave() {
    if (!imageUrl || isSaving) return
    setIsSaving(true)
    try {
      await blobDownload(imageUrl, 'mccut_photo.jpg')
      if (videoUrl) await blobDownload(videoUrl, 'mccut_video.webm')
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className="h-[100dvh] bg-[#1c1814] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-white/60 text-lg font-gaegu">링크를 찾을 수 없어요</p>
        <p className="text-white/30 text-sm">만료됐거나 잘못된 링크입니다</p>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] bg-[#1c1814] flex flex-col items-center justify-center px-5 gap-6">

      {/* 헤더 */}
      <div className="text-center">
        <h1 className="font-gaegu font-bold text-white text-3xl">McCut</h1>
        <p className="text-white/40 text-sm mt-1">아래 버튼을 눌러 저장하세요</p>
      </div>

      {/* 저장하기 버튼 */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full max-w-sm py-5 rounded-2xl bg-coral text-white font-gaegu font-bold text-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:brightness-110 disabled:opacity-60"
      >
        {isSaving ? (
          <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        )}
        {isSaving ? '저장 중…' : '저장하기'}
      </button>

      {/* 하단 브랜딩 */}
      <p className="text-white/20 text-xs">2026 목천청년교회 달란트마켓</p>
    </div>
  )
}
