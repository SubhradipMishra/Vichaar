import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EditOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { navigateToHash, REPO_URL, SOCIAL_LINKS, SUPPORT_EMAIL } from '../util/site'

const footerLinks = {
  Explore: [
    { label: 'Blog', href: '/blog', emoji: '📝' },
    { label: 'Templates', href: '/write', emoji: '✨' },
    { label: 'Community', href: '#community', emoji: '💬' },
    { label: 'Use Cases', href: '#features', emoji: '🎯' },
    { label: 'Changelog', href: '/blog', emoji: '🚀' },
    { label: 'Open Source', href: REPO_URL, emoji: '🌍' },
  ],
  Product: [
    { label: 'Features', href: '#features', emoji: '⚡' },
    { label: 'Pricing', href: '#pricing', emoji: '💎' },
    { label: 'For Teams', href: '#community', emoji: '👥' },
    { label: 'AI Writing API', href: `mailto:${SUPPORT_EMAIL}?subject=AI%20Writing%20API`, emoji: '🔌' },
    { label: 'Integrations', href: '/write', emoji: '🔗' },
    { label: 'Roadmap', href: `${REPO_URL}/issues`, emoji: '🗺️' },
  ],
  Resources: [
    { label: 'Documentation', href: REPO_URL, emoji: '📚' },
    { label: 'Help Center', href: `mailto:${SUPPORT_EMAIL}?subject=Help%20Center`, emoji: '🆘' },
    { label: 'Privacy Policy', href: '/privacy', emoji: '🔒' },
    { label: 'Terms of Use', href: '/terms', emoji: '📋' },
    { label: 'Refund Policy', href: '/refund', emoji: '🛡️' },
    { label: 'Status Page', href: `${REPO_URL}/actions`, emoji: '✅' },
  ],
  'Contact Us': [
    { label: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}`, emoji: '📧' },
    { label: 'Twitter / X', href: SOCIAL_LINKS.x, emoji: '🐦' },
    { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, emoji: '💼' },
    { label: 'Discord', href: SOCIAL_LINKS.discord, emoji: '🎮' },
  ],
}

const socials = [
  {
    label: 'X',
    href: SOCIAL_LINKS.x,
    color: '#1DA1F2',
    bg: '#e8f5fe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    label: 'GitHub',
    href: SOCIAL_LINKS.github,
    color: '#333',
    bg: '#f3f4f6',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>,
  },
  {
    label: 'LinkedIn',
    href: SOCIAL_LINKS.linkedin,
    color: '#0A66C2',
    bg: '#e8f0fe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    label: 'Discord',
    href: SOCIAL_LINKS.discord,
    color: '#5865F2',
    bg: '#eef0fe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.112a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>,
  },
]

function LiveCounter() {
  const [count, setCount] = useState(3847)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((current) => current + Math.floor(Math.random() * 3) - 1)
    }, 2500)

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.span
      key={count}
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="font-black text-green-400"
    >
      {count.toLocaleString()}
    </motion.span>
  )
}

const taglines = ['Think.', 'Write.', 'Publish.', 'Repeat.', 'Vichaar.']

function TypewriterTagline() {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState('')
  const [erasing, setErasing] = useState(false)

  useEffect(() => {
    const word = taglines[index]

    if (!erasing) {
      if (shown.length < word.length) {
        const timer = setTimeout(() => setShown(word.slice(0, shown.length + 1)), 80)
        return () => clearTimeout(timer)
      }

      if (index < taglines.length - 1) {
        const timer = setTimeout(() => setErasing(true), 700)
        return () => clearTimeout(timer)
      }
      return
    }

    if (shown.length > 0) {
      const timer = setTimeout(() => setShown(shown.slice(0, -1)), 40)
      return () => clearTimeout(timer)
    }

    setIndex((current) => current + 1)
    setErasing(false)
  }, [shown, erasing, index])

  return (
    <span className="font-handwriting text-lg" style={{ fontFamily: 'Caveat, cursive', color: '#a99aff' }}>
      {shown}
      <span className="animate-pulse">|</span>
    </span>
  )
}

function FooterLink({ link }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isHashLink = link.href.startsWith('#')
  const isExternal = link.href.startsWith('http')
  const isMailto = link.href.startsWith('mailto:')

  const commonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    textDecoration: 'none',
    color: hovered ? 'white' : '#9ca3af',
    transition: 'color 0.2s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    padding: 0,
    textAlign: 'left',
    width: '100%',
  }

  const inner = (
    <>
      <motion.span
        animate={{ x: hovered ? 0 : -4, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs"
      >
        {link.emoji}
      </motion.span>
      <span>{link.label}</span>
      <motion.span
        animate={{ x: hovered ? 0 : -6, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs ml-auto"
      >
        {'->'}
      </motion.span>
    </>
  )

  if (isHashLink) {
    return (
      <button
        onClick={() => navigateToHash({ hash: link.href, location, navigate })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={commonStyle}
        type="button"
      >
        {inner}
      </button>
    )
  }

  if (isExternal || isMailto) {
    return (
      <a
        href={link.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={commonStyle}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link
      to={link.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={commonStyle}
    >
      {inner}
    </Link>
  )
}

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer className="relative overflow-hidden" style={{ background: '#0a0917' }}>
      <div className="w-full overflow-hidden leading-none" style={{ marginBottom: -2 }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <path d="M0 80 C240 20 480 60 720 40 C960 20 1200 60 1440 30 L1440 0 L0 0 Z" fill="#f8f7ff" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, #6241fe, transparent 70%)', filter: 'blur(50px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          className="absolute top-1/2 left-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)', filter: 'blur(30px)' }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6241fe" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-60" />
            </div>
            <span className="text-gray-400">
              <LiveCounter /> writers are actively writing on Vichaar right now
            </span>
          </div>
          <TypewriterTagline />
        </motion.div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 py-14 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 no-underline mb-5 group w-fit">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6241fe, #7c3aed)' }}
              >
                <EditOutlined className="text-white" />
              </motion.div>
              <span className="font-black text-xl tracking-tight gradient-text">Vichaar</span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              The AI-powered blogging platform built for writers who think deeply and publish boldly.
            </p>

            <div className="flex items-center gap-2 mb-6">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group relative"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = social.bg
                    event.currentTarget.style.color = social.color
                    event.currentTarget.style.borderColor = `${social.color}40`
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    event.currentTarget.style.color = '#9ca3af'
                    event.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {!subscribed ? (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Get writing tips</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 text-xs rounded-xl outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => email && setSubscribed(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6241fe, #7c3aed)', border: 'none', cursor: 'pointer' }}
                    type="button"
                  >
                    Join
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs text-green-400 font-semibold py-2 px-3 rounded-xl"
                style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)' }}
              >
                You&apos;re subscribed.
              </motion.div>
            )}
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-gray-600">© 2025 Vichaar · Crafted for writers everywhere</p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', color: '#34d399' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              All systems go
            </div>
            <div
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(98,65,254,0.15)', border: '1px solid rgba(98,65,254,0.3)', color: '#a99aff' }}
            >
              Powered by AI
            </div>
            <div
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}
            >
              v2.5.0
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 w-11 h-11 rounded-full flex items-center justify-center z-50 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #6241fe, #7c3aed)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
            }}
            type="button"
          >
            <ArrowUpOutlined />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
