export const DASHBOARD_ROUTE = '/dashboard'
export const SUPPORT_EMAIL = 'hello@vichaar.ai'
export const REPO_URL = 'https://github.com/SubhradipMishra/Vichaar'

export const SOCIAL_LINKS = {
  github: REPO_URL,
  discord: 'https://discord.com',
  linkedin: 'https://www.linkedin.com',
  x: 'https://x.com',
}

export function scrollToHash(hash) {
  if (!hash || !hash.startsWith('#')) return false

  const target = document.querySelector(hash)
  if (!target) return false

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}

export function navigateToHash({ hash, location, navigate, onBeforeNavigate }) {
  if (!hash || !hash.startsWith('#')) return

  onBeforeNavigate?.()

  if (location.pathname === '/') {
    if (scrollToHash(hash)) return
    window.requestAnimationFrame(() => scrollToHash(hash))
    return
  }

  navigate(`/${hash}`)
}
