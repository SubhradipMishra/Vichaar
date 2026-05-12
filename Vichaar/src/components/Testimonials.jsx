import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarFilled, LeftOutlined, RightOutlined } from '@ant-design/icons'

const testimonials = [
  {
    name: 'Arjun Sharma',
    role: 'Tech Blogger · @arjunwrites',
    avatar: 'A',
    color: '#6241fe',
    rating: 5,
    quote:
      'Vichaar completely changed how I write. What used to take me 4 hours now takes 30 minutes. The AI suggestions are uncannily good — it feels like it understands my voice.',
    metric: '4x faster',
    metricLabel: 'writing speed',
  },
  {
    name: 'Priya Menon',
    role: 'Marketing Lead · Crescendo Labs',
    avatar: 'P',
    color: '#db2777',
    rating: 5,
    quote:
      'We use Vichaar for our entire content team. The collaboration features and SEO optimization alone have doubled our organic traffic in 3 months.',
    metric: '2x traffic',
    metricLabel: 'in 3 months',
  },
  {
    name: 'Rohan Verma',
    role: 'Founder · TechBurst Newsletter',
    avatar: 'R',
    color: '#059669',
    rating: 5,
    quote:
      'I was skeptical about AI writing tools, but Vichaar is different. It enhances my creativity instead of replacing it. My newsletter subscribers have grown 300%.',
    metric: '300% growth',
    metricLabel: 'subscriber base',
  },
  {
    name: 'Meera Krishnan',
    role: 'Freelance Writer · 50k followers',
    avatar: 'M',
    color: '#d97706',
    rating: 5,
    quote:
      'The multi-language feature is a game changer. I write in English and Vichaar publishes in Tamil and Malayalam automatically. My regional audience loves it.',
    metric: '3 languages',
    metricLabel: 'simultaneously',
  },
  {
    name: 'Karan Johal',
    role: 'SaaS Founder · Buildify',
    avatar: 'K',
    color: '#0891b2',
    rating: 5,
    quote:
      'Vichaar handles our entire thought leadership content. The analytics dashboard shows us exactly what our audience wants more of. Invaluable.',
    metric: '89% retention',
    metricLabel: 'reader engagement',
  },
  {
    name: 'Sneha Pillai',
    role: 'EdTech Content Creator',
    avatar: 'S',
    color: '#7c3aed',
    rating: 5,
    quote:
      'The templates are phenomenal. I went from 2 blog posts a week to 10, without sacrificing quality. Vichaar is the only tool my whole team actually uses.',
    metric: '5x output',
    metricLabel: 'content production',
  },
]

function TestimonialCard({ testimonial, isActive }) {
  return (
    <motion.div
      layout
      className="card-glass p-7 flex flex-col gap-4 h-full"
      style={{ minHeight: '260px' }}
    >
      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarFilled key={i} className="text-yellow-400 text-sm" />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 text-sm leading-relaxed flex-1">
        "{testimonial.quote}"
      </blockquote>

      {/* Metric */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: testimonial.color }}
          >
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
            <div className="text-xs text-gray-400">{testimonial.role}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black" style={{ color: testimonial.color }}>
            {testimonial.metric}
          </div>
          <div className="text-xs text-gray-400">{testimonial.metricLabel}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const [startIndex, setStartIndex] = useState(0)
  const perPage = 3

  const prev = () => setStartIndex(i => Math.max(0, i - 1))
  const next = () => setStartIndex(i => Math.min(testimonials.length - perPage, i + 1))

  const visible = testimonials.slice(startIndex, startIndex + perPage)

  return (
    <section
      id="community"
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8f7ff 100%)' }}
    >
      {/* Decorations */}
      <div className="absolute top-10 left-10 opacity-5 pointer-events-none select-none"
        style={{ fontFamily: 'Caveat, cursive', fontSize: '200px', color: '#6241fe', lineHeight: 1 }}>
        "
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="sketch-badge mb-4">✦ Testimonials</div>
          <h2 className="section-heading mb-5">
            Writers who use Vichaar{' '}
            <span className="gradient-text">never go back</span>
          </h2>
          <p className="section-sub text-center mx-auto">
            Real stories from real writers — from solo bloggers to content teams.
          </p>
        </motion.div>

        {/* Cards Grid — Desktop */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {visible.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <TestimonialCard testimonial={t} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cards — Mobile (single) */}
        <div className="md:hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={startIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <TestimonialCard testimonial={testimonials[startIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            disabled={startIndex === 0}
            className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all disabled:opacity-30"
            style={{
              borderColor: '#6241fe',
              color: '#6241fe',
              background: 'white',
              cursor: startIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <LeftOutlined className="text-sm" />
          </motion.button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setStartIndex(Math.min(i, testimonials.length - perPage))}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === startIndex || (i >= startIndex && i < startIndex + perPage) ? 24 : 8,
                  height: 8,
                  background: (i >= startIndex && i < startIndex + perPage) ? '#6241fe' : '#e8e5ff',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            disabled={startIndex >= testimonials.length - perPage}
            className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all disabled:opacity-30"
            style={{
              borderColor: '#6241fe',
              color: '#6241fe',
              background: 'white',
              cursor: startIndex >= testimonials.length - perPage ? 'not-allowed' : 'pointer',
            }}
          >
            <RightOutlined className="text-sm" />
          </motion.button>
        </div>
      </div>
    </section>
  )
}
