import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Typing animation for the AI card ──────────────────────────
const typingPhrases = [
  'Write an engaging intro about...',
  'Turn my bullet points into a blog...',
  'Make this paragraph more compelling...',
  'Generate 5 headline ideas for...',
  'Summarize this article in 3 points...',
]

function TypingDemo() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const phrase = typingPhrases[phraseIdx]
    if (typing) {
      if (displayed.length < phrase.length) {
        const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 45)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setTyping(false), 1200)
        return () => clearTimeout(t)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 20)
        return () => clearTimeout(t)
      } else {
        setPhraseIdx((i) => (i + 1) % typingPhrases.length)
        setTyping(true)
      }
    }
  }, [displayed, typing, phraseIdx])

  return (
    <div className="mt-4 rounded-xl p-4 font-mono text-sm"
      style={{ background: 'rgba(98,65,254,0.08)', border: '1px solid rgba(98,65,254,0.2)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="text-xs text-gray-400 ml-2">AI Prompt</span>
      </div>
      <p className="text-primary-600 font-medium min-h-[20px]">
        {displayed}
        <span className="animate-pulse">|</span>
      </p>
      <div className="mt-3 flex gap-2">
        <div className="h-2 rounded-full flex-1 opacity-30" style={{ background: '#6241fe' }} />
        <div className="h-2 rounded-full w-1/2 opacity-20" style={{ background: '#6241fe' }} />
      </div>
      <div className="mt-2 flex gap-2">
        <div className="h-2 rounded-full w-3/4 opacity-20" style={{ background: '#6241fe' }} />
        <div className="h-2 rounded-full flex-1 opacity-10" style={{ background: '#6241fe' }} />
      </div>
    </div>
  )
}

// ── 3D Tilt card ───────────────────────────────────────────────
function TiltCard({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Animated orbit icon ───────────────────────────────────────
function OrbitIcon({ emoji, size = 36, orbitR = 28, duration = 4, offset = 0 }) {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay: offset }}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        fontSize: size * 0.55,
        lineHeight: `${size}px`,
        textAlign: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -orbitR - size / 2,
        marginLeft: -size / 2,
        transformOrigin: `50% ${orbitR + size / 2}px`,
      }}
    >
      {emoji}
    </motion.span>
  )
}

// ── Live stat counter ─────────────────────────────────────────
function Counter({ to, suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !counted.current) {
        counted.current = true
        let start = 0
        const step = to / (duration * 60)
        const timer = setInterval(() => {
          start = Math.min(start + step, to)
          setVal(Math.floor(start))
          if (start >= to) clearInterval(timer)
        }, 1000 / 60)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ── Feature data ──────────────────────────────────────────────
const features = [
  {
    id: 'ai',
    size: 'large', // col-span-2 row-span-2
    emoji: '🤖',
    color: '#6241fe',
    bg: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
    title: 'AI Writing Assistant',
    desc: 'Your brilliant co-author, available 24/7. Generate, refine, and expand ideas in seconds.',
    extra: 'typing',
  },
  {
    id: 'seo',
    size: 'normal',
    emoji: '📈',
    color: '#059669',
    bg: 'linear-gradient(135deg, #d1fae5, #ecfdf5)',
    title: 'Instant SEO',
    desc: 'Auto-generate meta tags, keywords & descriptions optimized for page-1 rankings.',
    badge: 'Smart',
  },
  {
    id: 'analytics',
    size: 'normal',
    emoji: '📊',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f3e8ff, #fdf4ff)',
    title: 'Deep Analytics',
    desc: 'Track every read, click, and scroll. Know exactly what your audience craves.',
  },
  {
    id: 'collab',
    size: 'wide', // col-span-2
    emoji: '👥',
    color: '#db2777',
    bg: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
    title: 'Real-Time Collaboration',
    desc: 'Co-author posts, leave inline comments, and review drafts — live, together.',
    avatars: ['A', 'B', 'C', 'D'],
    avatarColors: ['#6241fe', '#db2777', '#059669', '#d97706'],
  },
  {
    id: 'lang',
    size: 'normal',
    emoji: '🌏',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
    title: 'Multi-Language',
    desc: 'Write once, publish in 50+ languages. Your voice, perfectly translated.',
    badge: 'New ✨',
  },
  {
    id: 'template',
    size: 'normal',
    emoji: '⚡',
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #fee2e2, #fff1f2)',
    title: '100+ Templates',
    desc: 'Tutorials, listicles, newsletters, opinion pieces — start with a perfect structure.',
  },
  {
    id: 'stats',
    size: 'stats', // full width
    bg: 'linear-gradient(135deg, #0f0e1a, #1e1b4b)',
    stats: [
      { label: 'Blog Posts Generated', value: 250000, suffix: '+' },
      { label: 'Active Writers', value: 12000, suffix: '+' },
      { label: 'Languages Supported', value: 54, suffix: '' },
      { label: 'Avg. Time Saved', value: 3, suffix: 'hrs/week' },
    ],
  },
]

// ── Individual card renderers ─────────────────────────────────
function FeatureCard({ feat }) {
  const [hovered, setHovered] = useState(false)

  if (feat.size === 'stats') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="col-span-1 sm:col-span-2 lg:col-span-3 rounded-3xl p-8 md:p-12 relative overflow-hidden"
        style={{ background: feat.bg }}
      >
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6241fe, transparent)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(24px)' }} />

        <p className="text-center text-sm font-semibold uppercase tracking-widest text-purple-300 mb-8">
          Vichaar by the numbers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {feat.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-1">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-purple-300">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (feat.size === 'large') {
    return (
      <TiltCard className="col-span-1 sm:col-span-2 row-span-2 rounded-3xl p-7 relative overflow-hidden cursor-pointer"
        style={{ background: feat.bg, border: '1.5px solid rgba(98,65,254,0.15)', boxShadow: '0 8px 40px rgba(98,65,254,0.12)' }}>
        <div style={{ transform: 'translateZ(20px)' }}>
          {/* Orbit animation */}
          <div className="relative w-16 h-16 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'white', boxShadow: `0 4px 20px ${feat.color}30` }}>
              {feat.emoji}
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ position: 'absolute', width: 64, height: 64 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: `1.5px dashed ${feat.color}40` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-black text-gray-900">{feat.title}</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: feat.color }}>Most Used</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">{feat.desc}</p>

          {feat.extra === 'typing' && <TypingDemo />}

          <motion.div className="mt-5 flex items-center gap-2 text-sm font-bold"
            style={{ color: feat.color }}
            animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            Try it now →
          </motion.div>
        </div>
      </TiltCard>
    )
  }

  if (feat.size === 'wide') {
    return (
      <TiltCard className="col-span-1 sm:col-span-2 rounded-3xl p-7 relative overflow-hidden cursor-pointer"
        style={{ background: feat.bg, border: `1.5px solid ${feat.color}20`, boxShadow: `0 4px 24px ${feat.color}10` }}>
        <div style={{ transform: 'translateZ(16px)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-3xl mb-2">{feat.emoji}</div>
              <h3 className="text-lg font-black text-gray-900">{feat.title}</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md">{feat.desc}</p>
            </div>
            {/* Live avatars */}
            {feat.avatars && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex -space-x-3">
                  {feat.avatars.map((a, i) => (
                    <motion.div key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black"
                      style={{ background: feat.avatarColors[i] }}>
                      {a}
                    </motion.div>
                  ))}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: `${feat.color}20`, color: feat.color }}>
                  ● 4 editing now
                </span>
              </div>
            )}
          </div>
          {/* Progress bar decoration */}
          <div className="flex gap-2 mt-3">
            {[70, 45, 90, 60].map((w, i) => (
              <motion.div key={i} className="h-1.5 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${w}px` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                style={{ background: feat.color, opacity: 0.3 + i * 0.15 }} />
            ))}
          </div>
        </div>
      </TiltCard>
    )
  }

  // Normal card
  return (
    <TiltCard
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-3xl p-6 relative overflow-hidden cursor-pointer group"
      style={{
        background: feat.bg,
        border: `1.5px solid ${feat.color}20`,
        boxShadow: `0 4px 20px ${feat.color}08`,
      }}
    >
      <div style={{ transform: 'translateZ(14px)' }}>
        {feat.badge && (
          <span className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: feat.color, color: 'white' }}>
            {feat.badge}
          </span>
        )}

        {/* Bouncy icon */}
        <motion.div
          animate={{ y: hovered ? [-2, 2, -2] : 0 }}
          transition={{ duration: 0.6, repeat: hovered ? Infinity : 0 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ background: 'white', boxShadow: `0 4px 16px ${feat.color}25` }}>
          {feat.emoji}
        </motion.div>

        <h3 className="font-black text-gray-900 text-base mb-2">{feat.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>

        {/* Glow on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 50%, ${feat.color}15, transparent 70%)` }} />
          )}
        </AnimatePresence>

        <motion.div className="mt-4 text-xs font-bold flex items-center gap-1"
          style={{ color: feat.color }}
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}>
          Learn more <span>→</span>
        </motion.div>
      </div>
    </TiltCard>
  )
}

// ── Main section ───────────────────────────────────────────────
export default function Features() {
  const headRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%' },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #fdf4ff 100%)' }}>

      {/* Blurred background blobs */}
      <div className="absolute -top-20 right-10 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6241fe, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headRef} className="text-center mb-14">
          <motion.div className="sketch-badge mb-4 inline-block"
            animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }}>
            ✦ Superpowers for Writers
          </motion.div>
          <h2 className="section-heading mb-5">
            Everything you need to{' '}
            <span className="gradient-text">blog brilliantly</span>
          </h2>
          <p className="section-sub text-center mx-auto">
            Vichaar gives you an unfair advantage. AI handles the heavy lifting —
            you focus on ideas that matter.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto">
          {features.map((feat) => (
            <FeatureCard key={feat.id} feat={feat} />
          ))}
        </div>
      </div>
    </section>
  )
}
