import { create } from 'zustand'

interface UiState {
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  activeModalId: string | null
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  activeModalId: null,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setMobileSidebarOpen: (isMobileSidebarOpen) => set({ isMobileSidebarOpen }),
  openModal: (activeModalId) => set({ activeModalId }),
  closeModal: () => set({ activeModalId: null }),
}))
