import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BulbOutlined,
  EditOutlined,
  RocketOutlined,
} from '@ant-design/icons'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '01',
    icon: <BulbOutlined />,
    title: 'Drop Your Idea',
    description:
      'Start with a rough idea, a keyword, or a topic you\'re passionate about. Vichaar\'s AI understands context and intent.',
    color: '#6241fe',
    bg: '#ede9fe',
    annotation: 'Just a thought is enough!',
    annotationColor: '#6241fe',
    annotationBg: '#ede9fe',
  },
  {
    number: '02',
    icon: <EditOutlined />,
    title: 'AI Crafts Your Draft',
    description:
      'In seconds, get a fully structured, SEO-ready draft. Edit, refine, and make it truly yours with smart suggestions.',
    color: '#db2777',
    bg: '#fce7f3',
    annotation: '< 10 seconds ⚡',
    annotationColor: '#db2777',
    annotationBg: '#fce7f3',
  },
  {
    number: '03',
    icon: <RocketOutlined />,
    title: 'Publish & Grow',
    description:
      'One-click publish to your blog, newsletter, or social platforms. Track performance with real-time analytics.',
    color: '#059669',
    bg: '#d1fae5',
    annotation: '50+ platforms 🌏',
    annotationColor: '#059669',
    annotationBg: '#d1fae5',
  },
]

function StepCard({ step, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
      className="flex flex-col md:flex-row items-start md:items-center gap-8 group"
    >
      {/* Step Number + Icon */}
      <div className="flex-shrink-0 relative">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl relative overflow-hidden"
          style={{ background: step.bg, color: step.color, boxShadow: `0 8px 32px ${step.color}25` }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(135deg, ${step.color}30, transparent)` }} />
          {step.icon}
          {/* Number badge */}
          <span
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center"
            style={{ background: step.color }}
          >
            {step.number.slice(1)}
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-4xl font-black text-gray-100 select-none">{step.number}</span>
          <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
          {/* Annotation bubble */}
          <span
            className="font-handwriting text-sm px-3 py-1 rounded-lg border"
            style={{
              fontFamily: 'Caveat, cursive',
              color: step.annotationColor,
              background: step.annotationBg,
              borderColor: step.annotationColor + '40',
            }}
          >
            {step.annotation}
          </span>
        </div>
        <p className="text-gray-500 leading-relaxed text-base max-w-lg">
          {step.description}
        </p>

        {/* Progress line */}
        {index < steps.length - 1 && (
          <div className="hidden md:block mt-6 ml-2 w-px h-12 bg-gradient-to-b from-gray-200 to-transparent" />
        )}
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  const sectionRef = useRef(null)

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="section-padding relative"
      style={{ background: '#ffffff' }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #e8e5ff, transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, #e8e5ff, transparent)' }} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="sketch-badge mb-4">How It Works</div>
          <h2 className="section-heading mb-5">
            From idea to published post{' '}
            <span className="gradient-text">in 3 simple steps</span>
          </h2>
          <p className="section-sub text-center mx-auto">
            Vichaar makes the entire blogging process effortless —
            so you can focus on what truly matters: your voice.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-12">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-base px-10 py-4"
          >
            Try It Free — No Card Needed
          </motion.button>
          <p className="mt-3 font-handwriting text-gray-400 text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
            Takes less than 2 minutes to set up 🎉
          </p>
        </motion.div>
      </div>
    </section>
  )
}
