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

/** data URL을 품질을 낮춰 재인코딩 후 Blob으로 변환 (업로드용 경량화) */
function compressDataUrl(dataUrl: string, quality = 0.75): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale  = 0.5
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
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

  // 이미지 압축
  const imageBlob = await compressDataUrl(imageDataUrl, 0.75)

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

  // Supabase DB에 메타데이터 저장
  const { error: dbError } = await supabase
    .from('results')
    .insert({ id: shareId, image_url: imageUrl, video_url: videoUrl })

  if (dbError) throw dbError

  return { shareId, imageUrl, videoUrl }
}
