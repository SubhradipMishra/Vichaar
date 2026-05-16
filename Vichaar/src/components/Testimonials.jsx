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

import { useEffect, useState, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { StarFilled } from '@ant-design/icons'

const testimonials = [
  {
    name: 'Arjun Sharma',
    role: 'Tech Blogger',
    avatar: 'A',
    color: '#6241fe',
    rating: 5,
    quote: 'Vichaar completely changed how I write. What used to take me 4 hours now takes 30 minutes. The AI is uncannily good.',
    metric: '4x faster',
  },
  {
    name: 'Priya Menon',
    role: 'Marketing Lead',
    avatar: 'P',
    color: '#db2777',
    rating: 5,
    quote: 'The collaboration features and SEO optimization doubled our organic traffic in 3 months. Highly recommended.',
    metric: '2x traffic',
  },
  {
    name: 'Rohan Verma',
    role: 'Founder',
    avatar: 'R',
    color: '#059669',
    rating: 5,
    quote: 'Vichaar enhances my creativity instead of replacing it. My newsletter subscribers grew 300% since I started using it.',
    metric: '300% growth',
  },
  {
    name: 'Meera Krishnan',
    role: 'Freelance Writer',
    avatar: 'M',
    color: '#d97706',
    rating: 5,
    quote: 'The multi-language feature is a game changer. I write in English and publish in 3 regional languages automatically.',
    metric: '3 languages',
  },
  {
    name: 'Karan Johal',
    role: 'SaaS Founder',
    avatar: 'K',
    color: '#0891b2',
    rating: 5,
    quote: 'Handles our entire thought leadership content. The analytics dashboard is invaluable for content strategy.',
    metric: '89% retention',
  },
  {
    name: 'Sneha Pillai',
    role: 'EdTech Content Creator',
    avatar: 'S',
    color: '#7c3aed',
    rating: 5,
    quote: 'Templates are phenomenal. Went from 2 posts a week to 10. Only tool my whole team actually uses.',
    metric: '5x output',
  },
  {
    name: 'Anjali Gupta',
    role: 'Product Manager',
    avatar: 'A',
    color: '#ef4444',
    rating: 5,
    quote: 'The most intuitive editor I have ever used. The AI drafting is like magic.',
    metric: '10/10 UX',
  },
  {
    name: 'Vikram Singh',
    role: 'Startup Founder',
    avatar: 'V',
    color: '#3b82f6',
    rating: 5,
    quote: 'Scaling our content production was easy with Vichaar. Best investment of the year.',
    metric: '90% Saved',
  },
]

function TestimonialCard({ testimonial }) {
  return (
    <div className="card-glass p-6 mb-6 flex flex-col gap-3 border border-white/50 backdrop-blur-md">
      <div className="flex gap-1">
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarFilled key={i} className="text-yellow-400 text-[10px]" />
        ))}
      </div>
      <blockquote className="text-gray-700 text-sm leading-relaxed italic">
        "{testimonial.quote}"
      </blockquote>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
            style={{ background: testimonial.color }}
          >
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-xs">{testimonial.name}</div>
            <div className="text-[10px] text-gray-400">{testimonial.role}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black" style={{ color: testimonial.color }}>
            {testimonial.metric}
          </div>
        </div>
      </div>
    </div>
  )
}

function VerticalMarquee({ items, speed = 40, reverse = false }) {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items]

  return (
    <div className="relative h-[600px] overflow-hidden">
      <motion.div
        animate={{
          y: reverse ? [0, -1000] : [-1000, 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex flex-col"
      >
        {duplicatedItems.map((item, idx) => (
          <TestimonialCard key={idx} testimonial={item} />
        ))}
      </motion.div>
    </div>
  )
}

export default function Testimonials() {
  // Split testimonials into 3 sets for 3 columns
  const col1 = [...testimonials]
  const col2 = [...testimonials].reverse()
  const col3 = [...testimonials].sort(() => Math.random() - 0.5)

  return (
    <section id="community" className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="sketch-badge mb-6">✦ Community Love</div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1]">
              Trusted by <span className="gradient-text">12,000+</span> creators globally
            </h2>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              From solo bloggers to enterprise content teams, Vichaar is the secret weapon for anyone who takes writing seriously.
            </p>
            
            <div className="flex flex-wrap gap-10">
              <div>
                <div className="text-4xl font-black text-primary-600 mb-1">98%</div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-black text-accent mb-1">4.9/5</div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">App Store</div>
              </div>
            </div>
          </motion.div>

          {/* Vertical Scrolling Columns */}
          <div className="relative h-[600px] rounded-[40px] overflow-hidden group">
            {/* Fading Overlays */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <VerticalMarquee items={col1} speed={30} />
              <div className="hidden sm:block">
                <VerticalMarquee items={col2} speed={45} reverse={true} />
              </div>
              <VerticalMarquee items={col3} speed={35} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

