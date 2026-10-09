import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTheme } from '@/context/ThemeContext'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import RoleBadge from '@/components/admin/RoleBadge'
import SearchModal from '@/components/admin/SearchModal'
import {
  ChevronDownIcon,
  DocsIcon,
  GlobeIcon,
  HeadphoneAltIcon,
  LogoutIcon,
  MoonIcon,
  SettingsAltIcon,
  SunIcon,
  UserIcon,
} from '@/icons'

const itemClassName =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-gray-300 dark:hover:bg-white/[0.03]'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { user, logout } = useAuthStore()
  const { toggleTheme, theme } = useTheme()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const displayName = user?.full_name || 'Admin'
  const shortcutLabel =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? '⌘K'
      : 'Ctrl+K'
  const avatarUrl =
    user?.avatar_url && user.avatar_url !== failedAvatarUrl
      ? user.avatar_url
      : undefined
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toLocaleUpperCase())
      .join('') || 'A'

  useKeyboard(
    () => {
      setIsOpen(false)
      setIsLanguageOpen(false)
      triggerRef.current?.focus()
    },
    { key: 'Escape', enabled: isOpen }
  )

  useEffect(() => {
    if (!isOpen) return
    const frame = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  useEffect(() => {
    const language = i18n.resolvedLanguage?.startsWith('fr') ? 'fr' : 'en'
    document.documentElement.lang = language
  }, [i18n.resolvedLanguage])

  function closeMenu() {
    setIsOpen(false)
    setIsLanguageOpen(false)
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])'
      ) ?? []
    )
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex =
        (currentIndex + direction + menuItems.length) % menuItems.length
      menuItems[nextIndex]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      menuItems[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      menuItems.at(-1)?.focus()
    }
  }

  function handleLanguageChange(language: 'fr' | 'en') {
    void i18n.changeLanguage(language)
    localStorage.setItem('language', language)
    localStorage.setItem('i18nextLng', language)
    setIsLanguageOpen(false)
  }

  function handleLogout() {
    if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) return
    logout()
    closeMenu()
    navigate('/signin', { replace: true })
  }

  function openSearch() {
    closeMenu()
    window.dispatchEvent(new Event('mande-sugu:open-search'))
  }

  return (
    <>
      <SearchModal />
      <div className="relative flex items-center" ref={containerRef}>
        <button
          aria-label={`Rechercher utilisateurs, produits et commandes (${shortcutLabel})`}
          className="me-2 hidden h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm text-gray-500 transition hover:border-orange-300 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 lg:flex dark:border-gray-800 dark:text-gray-400 dark:hover:border-orange-500"
          onClick={openSearch}
          type="button"
        >
          <span>Rechercher</span>
          <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] dark:border-gray-700">
            {shortcutLabel}
          </kbd>
        </button>

        <button
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`Ouvrir le menu utilisateur de ${displayName}`}
          className="dropdown-toggle flex items-center gap-3 rounded-xl text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-gray-300"
          onClick={() => {
            setIsOpen((open) => !open)
            setIsLanguageOpen(false)
          }}
          ref={triggerRef}
          type="button"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-base font-bold text-orange-700 ring-2 ring-white dark:bg-orange-500/20 dark:text-orange-300 dark:ring-gray-900">
            {avatarUrl ? (
              <img
                alt=""
                className="h-full w-full object-cover"
                onError={() => setFailedAvatarUrl(avatarUrl)}
                src={avatarUrl}
              />
            ) : (
              initials
            )}
            <span
              aria-label="En ligne"
              className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"
            />
          </span>
          <span className="hidden min-w-0 text-start sm:block">
            <span className="flex items-center gap-1.5">
              <span className="max-w-36 truncate text-sm font-semibold">
                {displayName}
              </span>
              {user?.role === 'super_admin' && (
                <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                  PRO
                </span>
              )}
            </span>
            <span className="block max-w-40 truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </span>
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 sm:block ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <>
            <button
              aria-label="Fermer le menu utilisateur"
              className="fixed inset-0 z-[99999] cursor-default bg-gray-950/40 sm:hidden"
              onClick={closeMenu}
              tabIndex={-1}
              type="button"
            />
            <div
              aria-label="Menu utilisateur"
              className="fixed inset-y-0 inset-e-0 z-[100000] flex h-dvh w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto border-s border-gray-200 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-right-2 duration-200 sm:absolute sm:inset-y-auto sm:top-full sm:mt-3 sm:h-auto sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl sm:border sm:p-3 dark:border-gray-800 dark:bg-gray-900"
              onKeyDown={handleMenuKeyDown}
              ref={menuRef}
              role="menu"
              tabIndex={-1}
            >
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-base font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                  {avatarUrl ? (
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setFailedAvatarUrl(avatarUrl)}
                      src={avatarUrl}
                    />
                  ) : (
                    initials
                  )}
                  <span className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {displayName}
                    </span>
                    {user?.role === 'super_admin' && (
                      <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                        PRO
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                  {user?.role && (
                    <span className="mt-2 inline-flex">
                      <RoleBadge role={user.role} />
                    </span>
                  )}
                </span>
              </div>

              <div className="my-3 border-t border-gray-100 dark:border-gray-800" />
              <nav aria-label="Navigation du compte" className="space-y-1">
                <Link
                  className={itemClassName}
                  onClick={closeMenu}
                  role="menuitem"
                  to="/profile"
                >
                  <UserIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
                  Mon profil
                </Link>
                <Link
                  className={itemClassName}
                  onClick={closeMenu}
                  role="menuitem"
                  to="/settings"
                >
                  <SettingsAltIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400"
                  />
                  Paramètres
                </Link>
                <button
                  aria-pressed={theme === 'dark'}
                  className={itemClassName}
                  onClick={toggleTheme}
                  role="menuitem"
                  type="button"
                >
                  {theme === 'dark' ? (
                    <SunIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-gray-400"
                    />
                  ) : (
                    <MoonIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-gray-400"
                    />
                  )}
                  Mode {theme === 'dark' ? 'clair' : 'sombre'}
                </button>
                <div className="relative">
                  <button
                    aria-expanded={isLanguageOpen}
                    className={itemClassName}
                    onClick={() => setIsLanguageOpen((open) => !open)}
                    role="menuitem"
                    type="button"
                  >
                    <GlobeIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-gray-400"
                    />
                    <span className="flex-1">Langue</span>
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      {i18n.resolvedLanguage?.startsWith('fr') ? 'FR' : 'EN'}
                    </span>
                  </button>
                  {isLanguageOpen && (
                    <div
                      aria-label="Choisir la langue"
                      className="ms-8 mt-1 grid grid-cols-2 gap-1 rounded-xl bg-gray-50 p-1.5 dark:bg-white/[0.03]"
                    >
                      {(['fr', 'en'] as const).map((language) => (
                        <button
                          aria-pressed={
                            i18n.resolvedLanguage?.startsWith(language) ?? false
                          }
                          className="rounded-lg px-3 py-2 text-xs font-semibold uppercase text-gray-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-orange-500 aria-pressed:bg-white aria-pressed:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:aria-pressed:bg-gray-800 dark:aria-pressed:text-orange-300"
                          key={language}
                          onClick={() => handleLanguageChange(language)}
                          role="menuitem"
                          type="button"
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  className={itemClassName}
                  onClick={closeMenu}
                  role="menuitem"
                  to="/support"
                >
                  <HeadphoneAltIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400"
                  />
                  Support
                </Link>
                <a
                  className={itemClassName}
                  href="/support"
                  onClick={closeMenu}
                  rel="noopener noreferrer"
                  role="menuitem"
                  target="_blank"
                >
                  <DocsIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
                  Aide &amp; Documentation
                </a>
              </nav>

              <div className="my-3 border-t border-gray-100 dark:border-gray-800" />
              <button
                className={`${itemClassName} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10`}
                onClick={handleLogout}
                role="menuitem"
                type="button"
              >
                <LogoutIcon aria-hidden="true" className="h-5 w-5" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
