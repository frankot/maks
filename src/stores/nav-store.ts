import { create } from 'zustand'

interface NavStore {
  showNav: boolean
  setShowNav: (show: boolean) => void
}

export const useNavStore = create<NavStore>((set) => ({
  showNav: true,
  setShowNav: (show) => set({ showNav: show }),
}))
