import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
} from '@ant-design/icons'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/forever',
    desc: 'Perfect for casual writers getting started.',
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    cta: 'Get Started Free',
    features: [
      '5 AI-generated posts/month',
      'Basic SEO suggestions',
      '1 blog site',
      'Community support',
      'Vichaar branding',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹599',
    period: '/month',
    desc: 'For serious bloggers who want to grow faster.',
    color: '#6241fe',
    bg: 'linear-gradient(135deg, #6241fe 0%, #7c3aed 100%)',
    border: '#6241fe',
    cta: 'Start Pro — Free 14 Days',
    features: [
      'Unlimited AI posts',
      'Advanced SEO optimizer',
      '5 blog sites',
      'Analytics dashboard',
      'Multi-language (10 langs)',
      'Priority support',
      'No Vichaar branding',
    ],
    highlight: true,
  },
  {
    name: 'Team',
    price: '₹1,999',
    period: '/month',
    desc: 'For content teams publishing at scale.',
    color: '#059669',
    bg: '#f0fdf4',
    border: '#86efac',
    cta: 'Start Team Trial',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Collaboration & reviews',
      'Custom AI voice training',
      'API access',
      'Dedicated account manager',
      '50+ language support',
    ],
    highlight: false,
  },
]

// Sketch doodle SVGs for decoration
const sketchElements = [
  {
    type: 'arrow',
    top: '15%', left: '8%',
    style: { transform: 'rotate(25deg)' },
    color: '#a99aff',
  },
  {
    type: 'circle',
    top: '70%', right: '10%',
    color: '#86efac',
    size: 60,
  },
  {
    type: 'arrow',
    bottom: '20%', left: '12%',
    style: { transform: 'rotate(-20deg) scaleX(-1)' },
    color: '#fca5a5',
  },
]

export default function CTA() {
  const sectionRef = useRef(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('annual')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pricing-card',
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.pricing-grid',
            start: 'top 80%',
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #f8f7ff 50%, #ede9fe 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6241fe, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Sketch doodle - arrow */}
      <svg className="absolute hidden lg:block pointer-events-none opacity-40" style={{ top: '12%', left: '6%', width: 80 }}
        viewBox="0 0 80 50" fill="none">
        <path d="M5 40 Q20 10 55 15" stroke="#a99aff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 8 L60 18 L48 20" stroke="#a99aff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="absolute hidden lg:block pointer-events-none opacity-30" style={{ bottom: '18%', right: '8%', width: 60 }}
        viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="25" stroke="#86efac" strokeWidth="2.5" strokeDasharray="8 5" />
      </svg>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="sketch-badge mb-4">✦ Pricing</div>
          <h2 className="section-heading mb-5">
            Start free,{' '}
            <span className="gradient-text">scale as you grow</span>
          </h2>
          <p className="section-sub text-center mx-auto mb-8">
            No hidden fees. Cancel anytime. Your first 14 days on Pro are completely free.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full"
            style={{ background: '#e8e5ff' }}>
            {['monthly', 'annual'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: activeTab === tab ? '#6241fe' : 'transparent',
                  color: activeTab === tab ? 'white' : '#6241fe',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'annual' && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: activeTab === 'annual' ? 'rgba(255,255,255,0.2)' : 'rgba(98,65,254,0.15)', color: activeTab === 'annual' ? 'white' : '#6241fe' }}>
                    Save 30%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="pricing-card relative rounded-3xl overflow-hidden"
              style={{
                border: `2px solid ${plan.highlight ? 'transparent' : plan.border}`,
                boxShadow: plan.highlight
                  ? '0 20px 60px rgba(98,65,254,0.3)'
                  : '0 4px 20px rgba(98,65,254,0.06)',
              }}
            >
              {plan.highlight && (
                <div className="absolute inset-0 rounded-3xl" style={{ background: plan.bg, zIndex: 0 }} />
              )}
              {!plan.highlight && (
                <div className="absolute inset-0 rounded-3xl" style={{ background: plan.bg, zIndex: 0 }} />
              )}

              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: '#f59e0b', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                    <ThunderboltFilled className="text-xs" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="relative z-10 p-8">
                <div className="mb-6">
                  <div className="text-sm font-bold mb-1"
                    style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : plan.color }}>
                    {plan.name}
                  </div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black"
                      style={{ color: plan.highlight ? 'white' : '#1a1a2e' }}>
                      {activeTab === 'annual' && plan.price !== '₹0'
                        ? `₹${Math.round(parseInt(plan.price.slice(1)) * 0.7)}`
                        : plan.price}
                    </span>
                    <span className="text-sm mb-1.5"
                      style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>
                    {plan.desc}
                  </p>
                </div>

                <Link to="/signup" className="no-underline">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm mb-7 transition-all"
                    style={{
                      background: plan.highlight ? 'white' : '#6241fe',
                      color: plan.highlight ? '#6241fe' : 'white',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: plan.highlight ? '0 4px 16px rgba(255,255,255,0.3)' : '0 4px 16px rgba(98,65,254,0.3)',
                    }}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>

                <div className="flex flex-col gap-3">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5 text-sm">
                      <CheckCircleFilled
                        className="mt-0.5 shrink-0 text-base"
                        style={{ color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#6241fe' }}
                      />
                      <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#4b5563' }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email Waitlist / CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="card-glass p-10 relative overflow-hidden">
            {/* Sketch arrow pointing to CTA */}
            <svg className="absolute hidden md:block pointer-events-none opacity-50"
              style={{ top: '10%', right: '8%', width: 70 }} viewBox="0 0 70 50" fill="none">
              <path d="M65 5 Q40 25 10 35" stroke="#6241fe" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
              <path d="M5 30 L12 40 L18 32" stroke="#6241fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Start blogging with AI today
            </h3>
            <p className="text-gray-500 mb-6">
              Join 12,000+ writers on Vichaar. Free forever plan available.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-5 py-3.5 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    border: '2px solid #e8e5ff',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6241fe'}
                  onBlur={(e) => e.target.style.borderColor = '#e8e5ff'}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary whitespace-nowrap"
                >
                  Get Started Free
                  <ArrowRightOutlined />
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 px-6 rounded-xl text-sm font-semibold"
                style={{ background: '#d1fae5', color: '#059669' }}
              >
                ✅ You're in! Check your email to get started.
              </motion.div>
            )}

            <p className="mt-4 font-handwriting text-gray-400 text-base" style={{ fontFamily: 'Caveat, cursive' }}>
              14 days free on Pro · No credit card needed ♡
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
