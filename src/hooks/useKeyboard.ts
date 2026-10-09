import { useEffect, useEffectEvent } from 'react'

export interface KeyboardShortcutOptions {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  enabled?: boolean
  preventDefault?: boolean
}

export function useKeyboard(
  onShortcut: (event: KeyboardEvent) => void,
  {
    key,
    ctrl = false,
    meta = false,
    shift = false,
    alt = false,
    enabled = true,
    preventDefault = true,
  }: KeyboardShortcutOptions
): void {
  const invokeShortcut = useEffectEvent(onShortcut)
  const normalizedKey = key.toLocaleLowerCase()

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      const matchesKey = event.key.toLocaleLowerCase() === normalizedKey
      const matchesCtrl = ctrl === event.ctrlKey
      const matchesMeta = meta === event.metaKey
      const matchesShift = shift === event.shiftKey
      const matchesAlt = alt === event.altKey

      if (
        !matchesKey ||
        !matchesCtrl ||
        !matchesMeta ||
        !matchesShift ||
        !matchesAlt
      ) {
        return
      }

      if (preventDefault) event.preventDefault()
      invokeShortcut(event)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    alt,
    ctrl,
    enabled,
    meta,
    normalizedKey,
    preventDefault,
    shift,
  ])
}
