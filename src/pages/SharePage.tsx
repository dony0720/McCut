import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function SharePage() {
  const [searchParams] = useSearchParams()
  const imageUrl = searchParams.get('img')
  const videoUrl = searchParams.get('vid')
  const [isSavingPhoto, setIsSavingPhoto] = useState(false)
  const [isSavingVideo, setIsSavingVideo] = useState(false)
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

  async function handleSavePhoto() {
    if (!imageUrl || isSavingPhoto) return
    setIsSavingPhoto(true)
    try { await blobDownload(imageUrl, 'mccut_photo.jpg') }
    finally { setIsSavingPhoto(false) }
  }

  async function handleSaveVideo() {
    if (!videoUrl || isSavingVideo) return
    setIsSavingVideo(true)
    try { await blobDownload(videoUrl, 'mccut_video.webm') }
    finally { setIsSavingVideo(false) }
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
    <div className="h-[100dvh] bg-[#1c1814] flex flex-col items-center justify-center px-5 gap-4">

      <div className="text-center">
        <h1 className="font-gaegu font-bold text-white text-3xl">McCut</h1>
        <p className="text-white/40 text-sm mt-1">아래 버튼을 눌러 저장하세요</p>
      </div>

      {/* 사진 저장 */}
      <button
        onClick={handleSavePhoto}
        disabled={isSavingPhoto}
        className="w-full max-w-sm py-5 rounded-2xl bg-coral text-white font-gaegu font-bold text-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:brightness-110 disabled:opacity-60"
      >
        {isSavingPhoto ? (
          <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
        {isSavingPhoto ? '저장 중…' : '사진 저장'}
      </button>

      {/* 영상 저장 */}
      {videoUrl && (
        <button
          onClick={handleSaveVideo}
          disabled={isSavingVideo}
          className="w-full max-w-sm py-5 rounded-2xl bg-white/10 border-2 border-white/20 text-white font-gaegu font-bold text-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-white/20 disabled:opacity-60"
        >
          {isSavingVideo ? (
            <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          )}
          {isSavingVideo ? '저장 중…' : '영상 저장'}
        </button>
      )}

      <p className="text-white/20 text-xs mt-2">2026 목천청년교회 달란트마켓</p>
    </div>
  )
}
