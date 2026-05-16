
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
    glow: 'rgba(98, 65, 254, 0.2)',
  },
  {
    name: 'Priya Menon',
    role: 'Marketing Lead',
    avatar: 'P',
    color: '#db2777',
    rating: 5,
    quote: 'The collaboration features and SEO optimization doubled our organic traffic in 3 months. Highly recommended.',
    metric: '2x traffic',
    glow: 'rgba(219, 39, 119, 0.2)',
  },
  {
    name: 'Rohan Verma',
    role: 'Founder',
    avatar: 'R',
    color: '#059669',
    rating: 5,
    quote: 'Vichaar enhances my creativity instead of replacing it. My newsletter subscribers grew 300% since I started using it.',
    metric: '300% growth',
    glow: 'rgba(5, 150, 105, 0.2)',
  },
  {
    name: 'Meera Krishnan',
    role: 'Freelance Writer',
    avatar: 'M',
    color: '#d97706',
    rating: 5,
    quote: 'The multi-language feature is a game changer. I write in English and publish in 3 regional languages automatically.',
    metric: '3 languages',
    glow: 'rgba(217, 119, 6, 0.2)',
  },
  {
    name: 'Karan Johal',
    role: 'SaaS Founder',
    avatar: 'K',
    color: '#0891b2',
    rating: 5,
    quote: 'Handles our entire thought leadership content. The analytics dashboard is invaluable for content strategy.',
    metric: '89% retention',
    glow: 'rgba(8, 145, 178, 0.2)',
  },
  {
    name: 'Sneha Pillai',
    role: 'EdTech Content Creator',
    avatar: 'S',
    color: '#7c3aed',
    rating: 5,
    quote: 'Templates are phenomenal. Went from 2 posts a week to 10. Only tool my whole team actually uses.',
    metric: '5x output',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  {
    name: 'Anjali Gupta',
    role: 'Product Manager',
    avatar: 'A',
    color: '#ef4444',
    rating: 5,
    quote: 'The most intuitive editor I have ever used. The AI drafting is like magic.',
    metric: '10/10 UX',
    glow: 'rgba(239, 68, 68, 0.2)',
  },
  {
    name: 'Vikram Singh',
    role: 'Startup Founder',
    avatar: 'V',
    color: '#3b82f6',
    rating: 5,
    quote: 'Scaling our content production was easy with Vichaar. Best investment of the year.',
    metric: '90% Saved',
    glow: 'rgba(59, 130, 246, 0.2)',
  },
]

function TestimonialCard({ testimonial, index }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, rotateY: index % 2 === 0 ? 5 : -5, z: 50 }}
      className="relative p-[1px] mb-8 rounded-[32px] overflow-hidden group transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, white 0%, ${testimonial.color}33 100%)`,
      }}
    >
      <div className="card-glass p-8 h-full flex flex-col gap-5 border border-white/40 backdrop-blur-3xl rounded-[31px] shadow-xl transition-all group-hover:shadow-2xl group-hover:shadow-primary-500/10"
           style={{ boxShadow: `0 20px 40px -20px ${testimonial.glow}` }}>
        
        {/* Quote Icon Background */}
        <div className="absolute top-4 right-4 text-6xl opacity-[0.03] pointer-events-none select-none italic font-serif">
          "
        </div>

        <div className="flex gap-1.5">
          {[...Array(testimonial.rating)].map((_, i) => (
            <StarFilled key={i} className="text-yellow-400 text-[11px]" />
          ))}
        </div>

        <blockquote className="text-gray-800 text-base leading-[1.7] font-medium tracking-tight">
          <span className="text-primary-500 font-black text-2xl leading-none">“</span>
          {testimonial.quote}
          <span className="text-primary-500 font-black text-2xl leading-none italic">”</span>
        </blockquote>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}cc 100%)`,
                boxShadow: `0 8px 16px -4px ${testimonial.color}66`
              }}
            >
              {testimonial.avatar}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] tracking-tight">{testimonial.name}</div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{testimonial.role}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-black tracking-tighter" style={{ color: testimonial.color }}>
              {testimonial.metric}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function VerticalMarquee({ items, speed = 40, reverse = false, offset = 0 }) {
  const duplicatedItems = [...items, ...items, ...items]

  return (
    <div className="relative h-[800px] overflow-hidden">
      <motion.div
        animate={{
          y: reverse ? [-2000, 0] : [0, -2000],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        initial={{ y: offset }}
        className="flex flex-col px-2"
      >
        {duplicatedItems.map((item, idx) => (
          <TestimonialCard key={idx} testimonial={item} index={idx} />
        ))}
      </motion.div>
    </div>
  )
}

export default function Testimonials() {
  const col1 = [...testimonials]
  const col2 = [...testimonials].reverse()
  const col3 = [...testimonials].sort(() => Math.random() - 0.5)

  return (
    <section id="community" className="py-32 relative overflow-hidden bg-white">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-full bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              Community Voice
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-10 leading-[0.95] tracking-tight">
              Loved by <br />
              <span className="gradient-text">thousands</span> <br />
              of writers.
            </h2>
            
            <p className="text-2xl text-gray-400 font-medium mb-12 leading-relaxed max-w-md italic">
              "Finally, an AI tool that actually sounds like me. Vichaar is my new daily companion."
            </p>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="text-5xl font-black text-gray-900 mb-2">98%</div>
                <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">Retention Rate</div>
              </div>
              <div>
                <div className="text-5xl font-black text-gray-900 mb-2">4.9/5</div>
                <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">Average Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Vertical Scrolling Columns */}
          <div className="lg:col-span-7 relative h-[750px] rounded-[60px] overflow-hidden">
            {/* Glossy Overlay Mask */}
            <div className="absolute inset-0 z-20 pointer-events-none rounded-[60px] border-[16px] border-white" />
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white via-white/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full p-4">
              <VerticalMarquee items={col1} speed={50} offset={-500} />
              <div className="hidden sm:block">
                <VerticalMarquee items={col2} speed={65} reverse={true} offset={-200} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


