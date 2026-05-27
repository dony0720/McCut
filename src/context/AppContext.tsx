import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type { FrameStyle, AppState, BgId } from '@/types'

export type { FrameStyle, AppState, BgId }

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState: AppState = {
  capturedPhotos: [],
  selectedIndices: [],
  frameStyle: 'classic',
  bgId: 'strawberry',
  composedImage: null,
  videoBlob: null,
  clipBlobs: [],
  shareId: null,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_PHOTO'; payload: string }
  | { type: 'SET_PHOTOS'; payload: string[] }
  | { type: 'TOGGLE_SELECT'; payload: number }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'RESET_PHOTOS' }
  | { type: 'SET_FRAME_STYLE'; payload: FrameStyle }
  | { type: 'SET_BG_ID'; payload: BgId }
  | { type: 'SET_COMPOSED_IMAGE'; payload: string }
  | { type: 'SET_VIDEO_BLOB'; payload: Blob }
  | { type: 'ADD_CLIP'; payload: Blob }
  | { type: 'SET_SHARE_ID'; payload: string }
  | { type: 'RESET' }

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PHOTO':
      return { ...state, capturedPhotos: [...state.capturedPhotos, action.payload] }

    case 'SET_PHOTOS':
      return { ...state, capturedPhotos: action.payload, selectedIndices: [] }

    case 'TOGGLE_SELECT': {
      const idx = action.payload
      const already = state.selectedIndices.includes(idx)
      if (already) {
        return { ...state, selectedIndices: state.selectedIndices.filter((i) => i !== idx), composedImage: null }
      }
      if (state.selectedIndices.length >= 4) return state
      return { ...state, selectedIndices: [...state.selectedIndices, idx], composedImage: null }
    }

    case 'CLEAR_SELECTION':
      return { ...state, selectedIndices: [], composedImage: null }

    case 'RESET_PHOTOS':
      return { ...state, capturedPhotos: [], selectedIndices: [], composedImage: null, videoBlob: null, clipBlobs: [] }

    case 'SET_FRAME_STYLE':
      return { ...state, frameStyle: action.payload, composedImage: null }

    case 'SET_BG_ID':
      return { ...state, bgId: action.payload, composedImage: null }

    case 'SET_COMPOSED_IMAGE':
      return { ...state, composedImage: action.payload }

    case 'SET_VIDEO_BLOB':
      return { ...state, videoBlob: action.payload }

    case 'ADD_CLIP':
      return { ...state, clipBlobs: [...state.clipBlobs, action.payload] }

    case 'SET_SHARE_ID':
      return { ...state, shareId: action.payload }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  addPhoto: (dataUrl: string) => void
  setPhotos: (photos: string[]) => void
  toggleSelect: (index: number) => void
  clearSelection: () => void
  resetPhotos: () => void
  setFrameStyle: (style: FrameStyle) => void
  setBgId: (id: BgId) => void
  setComposedImage: (dataUrl: string) => void
  setVideoBlob: (blob: Blob) => void
  addClip: (blob: Blob) => void
  setShareId: (id: string) => void
  reset: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addPhoto = useCallback((dataUrl: string) => {
    dispatch({ type: 'ADD_PHOTO', payload: dataUrl })
  }, [])

  const setPhotos = useCallback((photos: string[]) => {
    dispatch({ type: 'SET_PHOTOS', payload: photos })
  }, [])

  const toggleSelect = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_SELECT', payload: index })
  }, [])

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  const resetPhotos = useCallback(() => {
    dispatch({ type: 'RESET_PHOTOS' })
  }, [])

  const setFrameStyle = useCallback((style: FrameStyle) => {
    dispatch({ type: 'SET_FRAME_STYLE', payload: style })
  }, [])

  const setBgId = useCallback((id: BgId) => {
    dispatch({ type: 'SET_BG_ID', payload: id })
  }, [])

  const setComposedImage = useCallback((dataUrl: string) => {
    dispatch({ type: 'SET_COMPOSED_IMAGE', payload: dataUrl })
  }, [])

  const setVideoBlob = useCallback((blob: Blob) => {
    dispatch({ type: 'SET_VIDEO_BLOB', payload: blob })
  }, [])

  const addClip = useCallback((blob: Blob) => {
    dispatch({ type: 'ADD_CLIP', payload: blob })
  }, [])

  const setShareId = useCallback((id: string) => {
    dispatch({ type: 'SET_SHARE_ID', payload: id })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <AppContext.Provider
      value={{ state, addPhoto, setPhotos, toggleSelect, clearSelection, resetPhotos, setFrameStyle, setBgId, setComposedImage, setVideoBlob, addClip, setShareId, reset }}
    >
      {children}
    </AppContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
