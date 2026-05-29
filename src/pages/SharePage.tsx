import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface ResultRecord {
  id: string
  image_url: string
  video_url: string | null
  created_at: string
}

export default function SharePage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData]       = useState<ResultRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return }

    console.log('[SharePage] querying id:', id)
    supabase
      .from('results')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data: row, error: err }) => {
        console.log('[SharePage] result:', { row, err })
        if (err) { console.error('[SharePage] error:', err) }
        if (!row) { setError(true) }
        else { setData(row as ResultRecord) }
        setLoading(false)
      })
  }, [id])

  function download(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    a.click()
  }

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#1c1814] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // ── 에러 ──
  if (error || !data) {
    return (
      <div className="h-[100dvh] bg-[#1c1814] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-white/60 text-lg font-gaegu">링크를 찾을 수 없어요</p>
        <p className="text-white/30 text-sm">만료됐거나 잘못된 링크입니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#1c1814] flex flex-col items-center px-5 py-10 gap-6">

      {/* 헤더 */}
      <div className="text-center">
        <h1 className="font-gaegu font-bold text-white text-3xl">McCut</h1>
        <p className="text-white/40 text-sm mt-1">사진과 영상을 저장해 보세요</p>
      </div>

      {/* 사진 미리보기 */}
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        <img
          src={data.image_url}
          alt="McCut 네컷 사진"
          className="w-full block"
        />
      </div>

      {/* 다운로드 버튼 */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={() => download(data.image_url, 'mccut_photo.jpg')}
          className="w-full py-4 rounded-2xl bg-coral text-white font-gaegu font-bold text-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:brightness-110"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          사진 저장
        </button>

        {data.video_url && (
          <button
            onClick={() => download(data.video_url!, 'mccut_video.webm')}
            className="w-full py-4 rounded-2xl bg-white/10 text-white font-gaegu font-bold text-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/20 border-2 border-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            영상 저장
          </button>
        )}
      </div>

      {/* 하단 브랜딩 */}
      <p className="text-white/20 text-xs mt-4">2026 목천청년교회 달란트마켓</p>
    </div>
  )
}
