import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { EditOutlined, EyeOutlined, EyeInvisibleOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useContext } from 'react'
import * as THREE from 'three'
import Context from '../util/context'
import API from '../api/api'
import { DASHBOARD_ROUTE } from '../util/site'

// Reuse mini Three.js particles on login bg
function BgCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.z = 5
    const count = 800
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [new THREE.Color('#6241fe'), new THREE.Color('#a99aff'), new THREE.Color('#ec4899')]
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
      const c = palette[i % 3]
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.5 })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    const t0 = Date.now()
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = (Date.now() - t0) / 1000
      pts.rotation.y = t * 0.06
      pts.rotation.x = t * 0.03
      renderer.render(scene, camera)
    }
    animate()
    const onResize = () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); renderer.dispose() }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useContext(Context)

  // Set initial tab based on route
  const [tab, setTab] = useState(location.pathname === '/signup' ? 'signup' : 'login')

  // Sync tab state if URL changes (e.g. browser back/forward)
  useEffect(() => {
    setTab(location.pathname === '/signup' ? 'signup' : 'login')
  }, [location.pathname])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (tab === 'login') {
        const { data } = await API.post('/auth/login', { email, password })
        if (data.success) {
          message.success('Logged in successfully!')
          console.log(data)
          setSession(data.user)
          navigate(DASHBOARD_ROUTE)
        } else {
          message.error(data.message || 'Login failed')
        }
      } else if (tab === 'signup') {
        // Signup Flow
        if (!showOtpInput) {
          const { data } = await API.post('/auth/send-otp', { email })
          if (data.success) {
            message.success('OTP sent to your email!')
            setShowOtpInput(true)
          } else {
            message.error(data.message || 'Failed to send OTP')
          }
        } else {
          const { data } = await API.post('/auth/signup', { email, password, name, otp, mobileNumber })
          if (data.success) {
            message.success('Account created successfully!')
            setSession(data.user)
            navigate(DASHBOARD_ROUTE)
          } else {
            message.error(data.message || 'Verification failed')
          }
        }
      } else if (tab === 'forgot') {
        if (!showOtpInput) {
          const { data } = await API.post('/auth/forgot-password', { email })
          if (data.success) {
            message.success('Reset code sent to your email!')
            setShowOtpInput(true)
          } else {
            message.error(data.message || 'Failed to send reset code')
          }
        } else {
          const { data } = await API.post('/auth/reset-password', { email, otp, newPassword })
          if (data.success) {
            message.success('Password reset successfully! Please sign in.')
            setTab('login')
            setShowOtpInput(false)
            setOtp('')
            setNewPassword('')
          } else {
            message.error(data.message || 'Reset failed')
          }
        }
      }
    } catch (error) {
      message.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (newTab) => {
    setTab(newTab)
    setShowOtpInput(false)
    setOtp('')
    navigate(`/${newTab}`)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12, outline: 'none',
    border: '1.5px solid #e8e5ff', fontFamily: 'Inter, sans-serif', fontSize: 14,
    background: 'rgba(255,255,255,0.8)', color: '#1a1a2e', transition: 'border-color 0.2s',
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f0e1a 0%, #1e1b4b 100%)' }}>
      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden p-12">
        <BgCanvas />
        <div className="relative z-10 text-center max-w-md">
          {/* Floating bubbles */}
          {[
            { text: 'Write faster ⚡', color: '#6241fe', bg: '#ede9fe', top: '20%', left: '10%', rot: '-5deg' },
            { text: 'AI-powered 🤖', color: '#059669', bg: '#d1fae5', top: '30%', right: '8%', rot: '4deg' },
            { text: 'Grow your audience 📈', color: '#db2777', bg: '#fce7f3', bottom: '25%', left: '8%', rot: '3deg' },
          ].map((b, i) => (
            <motion.div key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
              className="absolute text-sm font-bold px-3 py-1.5 rounded-lg border hidden xl:block"
              style={{
                fontFamily: 'Caveat, cursive', fontSize: 15,
                color: b.color, background: b.bg, borderColor: b.color + '50',
                top: b.top, left: b.left, right: b.right, bottom: b.bottom, transform: `rotate(${b.rot})`,
              }}>
              {b.text}
            </motion.div>
          ))}

          {/* Logo + tagline */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #6241fe, #7c3aed)', boxShadow: '0 8px 32px rgba(98,65,254,0.5)' }}>
              <EditOutlined className="text-white text-2xl" />
            </div>
            <h1 className="text-5xl font-black text-white mb-4">Vichaar</h1>
            <p className="text-lg text-purple-300 leading-relaxed">
              Write smarter. Think deeper.<br />Blog with AI.
            </p>
            {/* Fake testimonial */}
            <div className="mt-10 p-5 rounded-2xl text-left"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-gray-300 text-sm italic leading-relaxed mb-3">
                "Vichaar turned my scattered notes into a viral blog post in under 10 minutes. I'm obsessed."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                  style={{ background: '#6241fe' }}>A</div>
                <div>
                  <div className="text-white text-xs font-semibold">Arjun Sharma</div>
                  <div className="text-gray-400 text-xs">Tech Blogger · 50k readers</div>
                </div>
                <div className="ml-auto text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 sm:p-12"
        style={{ background: '#fafafe' }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6241fe, #7c3aed)' }}>
              <EditOutlined className="text-white text-sm" />
            </div>
            <span className="font-black text-xl text-gray-900">Vichaar</span>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 rounded-2xl mb-8" style={{ background: '#e8e5ff' }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => handleTabChange(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#6241fe' : '#9ca3af',
                  border: 'none', cursor: 'pointer',
                  boxShadow: tab === t ? '0 2px 8px rgba(98,65,254,0.15)' : 'none',
                }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                {tab === 'login' ? 'Welcome back 👋' : tab === 'signup' ? 'Join Vichaar 🚀' : 'Reset Password 🔑'}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {tab === 'login' ? 'Sign in to continue writing.' : tab === 'signup' ? 'Create your free account today.' : 'We will send a reset code to your email.'}
              </p>

              {/* Social login (Disabled as per request) */}
              {/* <div className="flex gap-3 mb-5">
                {[
                  { icon: <GoogleOutlined />, label: 'Google', color: '#EA4335', bg: '#fef2f2' },
                  { icon: <GithubOutlined />, label: 'GitHub', color: '#333', bg: '#f3f4f6' },
                ].map(s => (
                  <motion.button key={s.label} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.color}20`, cursor: 'pointer' }}>
                    {s.icon} {s.label}
                  </motion.button>
                ))}
              </div> */}

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {tab === 'signup' && !showOtpInput && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="Arjun Sharma" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#6241fe'}
                        onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block">Mobile Number</label>
                      <input type="text" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
                        placeholder="+91 98765 43210" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#6241fe'}
                        onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                    </div>
                  </>
                )}

                {!showOtpInput && tab !== 'forgot' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#6241fe'}
                      onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                  </div>
                )}

                {tab === 'signup' && showOtpInput && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Verification Code (OTP)</label>
                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code" style={inputStyle} maxLength={6}
                      onFocus={e => e.target.style.borderColor = '#6241fe'}
                      onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                    <p className="text-[10px] text-gray-400 mt-2">
                      Check your email for the code sent to <b>{email}</b>.
                      <button type="button" onClick={() => setShowOtpInput(false)} className="text-purple-600 font-bold ml-1 hover:underline">Change email</button>
                    </p>
                  </div>
                )}

                {!showOtpInput && tab !== 'forgot' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} required value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        style={{ ...inputStyle, paddingRight: 44 }}
                        onFocus={e => e.target.style.borderColor = '#6241fe'}
                        onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        {showPass ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                    {tab === 'login' && (
                      <div className="text-right mt-1">
                        <button type="button" onClick={() => setTab('forgot')} className="text-xs font-semibold"
                          style={{ color: '#6241fe', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'forgot' && (
                  <>
                    {!showOtpInput ? (
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com" style={inputStyle}
                          onFocus={e => e.target.style.borderColor = '#6241fe'}
                          onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block">Reset Code (OTP)</label>
                          <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                            placeholder="Enter 6-digit code" style={inputStyle} maxLength={6}
                            onFocus={e => e.target.style.borderColor = '#6241fe'}
                            onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 mb-1.5 block">New Password</label>
                          <div className="relative">
                            <input type={showPass ? 'text' : 'password'} required value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Min. 8 characters"
                              style={{ ...inputStyle, paddingRight: 44 }}
                              onFocus={e => e.target.style.borderColor = '#6241fe'}
                              onBlur={e => e.target.style.borderColor = '#e8e5ff'} />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              {showPass ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                          Code sent to <b>{email}</b>.
                          <button type="button" onClick={() => setShowOtpInput(false)} className="text-purple-600 font-bold ml-1 hover:underline">Change email</button>
                        </p>
                      </>
                    )}
                  </>
                )}

                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="btn-primary justify-center py-3.5 mt-1 text-sm"
                  style={{ opacity: loading ? 0.8 : 1 }}>
                  {loading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : tab === 'login' ? '→ Sign In' : tab === 'signup' ? (showOtpInput ? '→ Verify & Create Account' : '→ Send OTP') : (showOtpInput ? '→ Reset Password' : '→ Send Reset Code')}
                </motion.button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-5">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => handleTabChange(tab === 'login' ? 'signup' : 'login')}
                  className="font-bold" style={{ color: '#6241fe', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {tab === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>

              <p className="text-center text-xs text-gray-300 mt-3">
                <Link to="/" className="no-underline text-gray-400 hover:text-gray-600">← Back to home</Link>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
