import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRightOutlined,
} from '@ant-design/icons'


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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }



  return (
    <section
      id="cta"
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
