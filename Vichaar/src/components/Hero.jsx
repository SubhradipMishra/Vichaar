import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  ArrowRightOutlined,
  PlayCircleOutlined,
  StarFilled,
} from '@ant-design/icons'

// Floating annotation bubbles (like Excalidraw)
const bubbles = [
  { text: 'AI-powered ✨', color: '#6241fe', bg: '#ede9fe', top: '18%', left: '7%', rot: '-4deg', delay: 0 },
  { text: 'SEO optimized 🚀', color: '#059669', bg: '#d1fae5', top: '22%', right: '8%', rot: '5deg', delay: 0.3 },
  { text: 'Ideas → Blogs', color: '#dc2626', bg: '#fee2e2', bottom: '28%', left: '5%', rot: '3deg', delay: 0.6 },
  { text: 'Multi-language 🌏', color: '#d97706', bg: '#fef3c7', bottom: '32%', right: '6%', rot: '-3deg', delay: 0.9 },
]

// Doodle SVG elements
const doodles = [
  { d: 'M10 30 Q30 5 50 30 Q70 55 90 30', top: '12%', left: '55%', color: '#a99aff', width: 100 },
  { d: 'M5 20 C20 5, 40 35, 55 20', top: '70%', left: '80%', color: '#86efac', width: 60 },
  { d: 'M5 5 L25 25 M25 5 L5 25', top: '60%', left: '15%', color: '#fca5a5', width: 30 },
  { d: 'M50 5 A45 45 0 0 1 50 95', top: '40%', right: '18%', color: '#fcd34d', width: 40 },
]

export default function Hero() {
  const canvasRef = useRef(null)
  const contentRef = useRef(null)

  // Three.js particle field
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.z = 5

    // Particles
    const count = 1800
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#6241fe'),
      new THREE.Color('#a99aff'),
      new THREE.Color('#7c3aed'),
      new THREE.Color('#e879f9'),
      new THREE.Color('#818cf8'),
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Resize
    const onResize = () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    let frameId
    const startTime = Date.now()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = (Date.now() - startTime) / 1000
      particles.rotation.y = t * 0.04 + mouseX * 0.08
      particles.rotation.x = t * 0.02 + mouseY * 0.04
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
    }
  }, [])

  // GSAP stagger entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-content > *',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.3 }
      )
    }, contentRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #ede9fe 50%, #f3e8ff 100%)' }}
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        id="hero-canvas"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6241fe 0%, transparent 70%)' }}
        />
      </div>

      {/* Floating Annotation Bubbles */}
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="annotation-bubble hidden md:block"
          style={{
            color: b.color,
            background: b.bg,
            borderColor: b.color + '60',
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            '--rot': b.rot,
            rotate: b.rot,
            zIndex: 2,
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: b.delay + 0.8, duration: 0.4 },
            scale: { delay: b.delay + 0.8, duration: 0.4 },
            y: { delay: b.delay + 1.2, duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {b.text}
        </motion.div>
      ))}

      {/* Doodle SVGs */}
      {doodles.map((d, i) => (
        <svg
          key={i}
          className="doodle-line hidden lg:block"
          style={{ top: d.top, left: d.left, right: d.right, bottom: d.bottom, width: d.width, zIndex: 2 }}
          viewBox={`0 0 ${d.width} 100`}
          fill="none"
        >
          <path d={d.d} stroke={d.color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ))}

      {/* Hero Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24 pb-20"
      >
        <div className="hero-content flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(98,65,254,0.1)', color: '#6241fe', border: '1px solid rgba(98,65,254,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse inline-block"></span>
            AI-Powered Blogging Platform
          </div>

          {/* Headline */}
          <h1 className="section-heading text-5xl md:text-7xl font-black leading-[1.05]">
            Write Smarter.{' '}
            <span className="highlight-box">
              <span className="gradient-text">Think Deeper.</span>
            </span>
            <br />
            Blog with AI.
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Vichaar transforms your ideas into powerful blog posts. AI writing assistance,
            smart SEO, beautiful publishing — all in one place.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {['#6241fe', '#7c3aed', '#a855f7', '#ec4899'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarFilled key={i} className="text-yellow-400 text-xs" />
              ))}
            </div>
            <span>Loved by <strong className="text-gray-700">12,000+</strong> writers</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-base px-8 py-4"
            >
              Start Writing for Free
              <ArrowRightOutlined className="text-sm" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
            >
              <PlayCircleOutlined className="text-lg" />
              Watch Demo
            </motion.button>
          </div>

          {/* Handwriting note */}
          <p className="font-handwriting text-lg text-gray-400" style={{ fontFamily: 'Caveat, cursive' }}>
            ✦ No credit card required · Free forever plan ✦
          </p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
        background: 'linear-gradient(to top, #f8f7ff, transparent)',
        zIndex: 3,
      }} />
    </section>
  )
}
