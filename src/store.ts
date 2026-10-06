import { create } from 'zustand'

interface UiState {
  theme: 'dark'
  reducedMotion: boolean
  loaderVisible: boolean
  setTheme: (theme: 'dark') => void
  setReducedMotion: (value: boolean) => void
  setLoaderVisible: (value: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  reducedMotion: false,
  loaderVisible: true,
  setTheme: (theme) => set({ theme }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setLoaderVisible: (value) => set({ loaderVisible: value }),
}))
