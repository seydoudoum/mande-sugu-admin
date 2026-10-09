import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastState {
  toasts: ToastItem[]
  pushToast: (type: ToastType, message: string) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
}

const MAX_TOASTS = 3
const TOAST_DURATION = 4000
const timers = new Map<string, ReturnType<typeof setTimeout>>()
let toastSequence = 0

function clearTimer(id: string) {
  const timer = timers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (type, message) => {
    const id = `${Date.now()}-${toastSequence++}`
    let removedIds: string[] = []

    set((state) => {
      const next = [...state.toasts, { id, type, message }]
      removedIds = next.slice(0, Math.max(0, next.length - MAX_TOASTS)).map(
        (toast) => toast.id
      )
      return { toasts: next.slice(-MAX_TOASTS) }
    })
    removedIds.forEach(clearTimer)
    timers.set(
      id,
      setTimeout(() => {
        useToastStore.getState().dismissToast(id)
      }, TOAST_DURATION)
    )
    return id
  },
  dismissToast: (id) => {
    clearTimer(id)
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  clearToasts: () => {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    set({ toasts: [] })
  },
}))

export function useToast() {
  const pushToast = useToastStore((state) => state.pushToast)
  const dismissToast = useToastStore((state) => state.dismissToast)

  return {
    success: (message: string) => pushToast('success', message),
    error: (message: string) => pushToast('error', message),
    warning: (message: string) => pushToast('warning', message),
    info: (message: string) => pushToast('info', message),
    dismiss: dismissToast,
  }
}
