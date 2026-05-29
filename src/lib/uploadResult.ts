import { supabase } from './supabase'

export interface UploadResultPayload {
  imageDataUrl: string
  videoBlob?: Blob | null
}

export interface UploadResultResponse {
  shareId: string
  imageUrl: string
  videoUrl: string | null
}

/** data URL → Blob 변환 (원본 해상도 유지, JPEG quality 0.92) */
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.width
      canvas.height = img.height
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92)
    }
    img.src = dataUrl
  })
}

/** Supabase Storage 공개 URL 조회 */
function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadResult({
  imageDataUrl,
  videoBlob,
}: UploadResultPayload): Promise<UploadResultResponse> {
  // 고유 shareId 생성
  const shareId = crypto.randomUUID()

  const imageBlob = await dataUrlToBlob(imageDataUrl)

  // 이미지 + 영상 병렬 업로드
  const imagePath = `${shareId}/photo.jpg`
  const videoPath = `${shareId}/video.webm`

  const uploadTasks: Promise<void>[] = [
    supabase.storage
      .from('results')
      .upload(imagePath, imageBlob, { contentType: 'image/jpeg', upsert: true })
      .then(({ error }) => { if (error) throw error }),
  ]

  if (videoBlob) {
    uploadTasks.push(
      supabase.storage
        .from('results')
        .upload(videoPath, videoBlob, { contentType: 'video/webm', upsert: true })
        .then(({ error }) => { if (error) throw error }),
    )
  }

  await Promise.all(uploadTasks)

  const imageUrl = getPublicUrl('results', imagePath)
  const videoUrl = videoBlob ? getPublicUrl('results', videoPath) : null

  return { shareId, imageUrl, videoUrl }
}
