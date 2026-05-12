import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Button } from 'antd'
import {
  MenuOutlined,
  CloseOutlined,
  EditOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useContext } from 'react'
import Context from '../util/context'
import API from '../api/api'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Community', href: '#community' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const location = useLocation()
  const { session, setSession } = useContext(Context)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout')
      setSession(null)
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href) => {
    setMenuOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-purple-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6241fe, #7c3aed)' }}>
              <EditOutlined className="text-white text-sm" />
            </div>
            <span className="font-bold text-xl text-ink tracking-tight">
              Vichaar
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200 bg-transparent border-none cursor-pointer"
                  style={{ background: 'none', padding: 0 }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200 no-underline"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-purple-500 flex items-center justify-center text-sm text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                    {session.name?.[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-bold text-gray-800 leading-tight capitalize">{session.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">{session.email}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1">{session.role} Account</p>
                        <p className="text-sm font-bold text-gray-900 capitalize">{session.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.email}</p>
                      </div>

                      <Link 
                        to={session.role === 'admin' || session.role === 'superadmin' ? '/admin/dashboard' : '/dashboard'}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-primary-600 transition-colors no-underline"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <UserOutlined className="text-lg" />
                        <span>My Dashboard</span>
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <LogoutOutlined className="text-lg" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors px-4 py-2 no-underline"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/write" className="btn-primary text-sm no-underline">
                    Start Writing Free
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {menuOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.href.startsWith('#') ? (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="block text-base font-medium text-gray-700 py-2"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block text-base font-medium text-gray-700 py-2 no-underline"
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <div className="pt-2 flex flex-col gap-3">
                {session ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100">
                      <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-lg text-white font-bold shadow-md">
                        {session.name?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-gray-900 capitalize mb-0.5">{session.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.email}</p>
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">{session.role}</p>
                      </div>
                    </div>
                    
                    <Link 
                      to={session.role === 'admin' || session.role === 'superadmin' ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className="btn-secondary w-full justify-center gap-2 no-underline"
                    >
                      <UserOutlined /> Go to Dashboard
                    </Link>

                    <button onClick={handleLogout} className="btn-secondary w-full justify-center gap-2 no-underline text-red-500 border-red-200 bg-red-50/50">
                      <LogoutOutlined /> Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-center justify-center no-underline">Sign In</Link>
                    <Link to="/write" onClick={() => setMenuOpen(false)} className="btn-primary text-center justify-center no-underline">Start Writing Free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
