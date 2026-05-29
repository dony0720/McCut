import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from './firebase'

export interface UploadResultPayload {
  imageDataUrl: string
  videoBlob?: Blob | null
}

export interface UploadResultResponse {
  shareId: string
  imageUrl: string
  videoUrl: string | null
}

/** data URL → Blob 변환 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function uploadResult({
  imageDataUrl,
  videoBlob,
}: UploadResultPayload): Promise<UploadResultResponse> {
  // Firestore에 먼저 도큐먼트를 만들어 shareId 확보
  const docRef = await addDoc(collection(db, 'results'), {
    createdAt: serverTimestamp(),
  })
  const shareId = docRef.id

  // 이미지 업로드
  const imageBlob = dataUrlToBlob(imageDataUrl)
  const imageRef  = ref(storage, `results/${shareId}/photo.jpg`)
  await uploadBytes(imageRef, imageBlob, { contentType: 'image/jpeg' })
  const imageUrl = await getDownloadURL(imageRef)

  // 영상 업로드 (선택)
  let videoUrl: string | null = null
  if (videoBlob) {
    const videoRef = ref(storage, `results/${shareId}/video.webm`)
    await uploadBytes(videoRef, videoBlob, { contentType: 'video/webm' })
    videoUrl = await getDownloadURL(videoRef)
  }

  // Firestore 도큐먼트에 URL 업데이트
  const { updateDoc } = await import('firebase/firestore')
  await updateDoc(docRef, { imageUrl, videoUrl })

  return { shareId, imageUrl, videoUrl }
}
