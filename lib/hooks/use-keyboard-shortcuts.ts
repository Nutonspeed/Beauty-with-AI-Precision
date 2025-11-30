'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type ShortcutHandler = () => void

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: ShortcutHandler
  description: string
}

/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for power users
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Pre-defined global shortcuts
 */
export function useGlobalShortcuts() {
  const router = useRouter()

  const shortcuts: Shortcut[] = [
    {
      key: 'h',
      ctrl: true,
      handler: () => router.push('/'),
      description: 'Go to Home',
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      handler: () => router.push('/analysis'),
      description: 'Go to Analysis',
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      handler: () => router.push('/sales/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: 's',
      ctrl: true,
      shift: true,
      handler: () => router.push('/settings'),
      description: 'Go to Settings',
    },
    {
      key: '/',
      ctrl: true,
      handler: () => {
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        searchInput?.focus()
      },
      description: 'Focus Search',
    },
    {
      key: 'Escape',
      handler: () => {
        const activeElement = document.activeElement as HTMLElement
        activeElement?.blur()
      },
      description: 'Clear Focus',
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}

/**
 * Shortcut display helper
 */
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(shortcut.key.toUpperCase())
  return parts.join(' + ')
}
