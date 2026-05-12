import { useRef } from 'react'
import { motion } from 'framer-motion'

const companies = [
  'Medium', 'Substack', 'WordPress', 'HubSpot', 'Notion',
  'Ghost', 'Dev.to', 'Hashnode', 'Beehiiv', 'ConvertKit',
  'Medium', 'Substack', 'WordPress', 'HubSpot', 'Notion',
  'Ghost', 'Dev.to', 'Hashnode', 'Beehiiv', 'ConvertKit',
]

// Map each company to a unique color (just visual flair)
const companyColors = {
  Medium: '#12100E',
  Substack: '#FF6719',
  WordPress: '#21759B',
  HubSpot: '#FF7A59',
  Notion: '#37352F',
  Ghost: '#15171A',
  'Dev.to': '#0A0A0A',
  Hashnode: '#2962FF',
  Beehiiv: '#19C37D',
  ConvertKit: '#FB6970',
}

// Simple logo-like text badges for each company
function CompanyBadge({ name }) {
  const color = companyColors[name] || '#6241fe'
  return (
    <div
      className="flex items-center gap-2.5 px-6 py-3 rounded-xl mx-4 shrink-0"
      style={{ background: 'white', border: '1px solid #ede9fe', boxShadow: '0 2px 8px rgba(98,65,254,0.06)' }}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-black shrink-0"
        style={{ background: color }}
      >
        {name[0]}
      </div>
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{name}</span>
    </div>
  )
}

export default function TrustedBy() {
  return (
    <section className="py-16 overflow-hidden" style={{ background: '#f8f7ff' }}>
      <div className="text-center mb-10 px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Trusted by writers across the world
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Join bloggers from the world's top platforms
        </h2>
      </div>

      {/* Ticker wrapper */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f8f7ff, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #f8f7ff, transparent)' }} />

        {/* Ticker row 1 */}
        <div className="flex overflow-hidden mb-4">
          <div className="ticker-track">
            {companies.map((name, i) => (
              <CompanyBadge key={`r1-${i}`} name={name} />
            ))}
          </div>
        </div>

        {/* Ticker row 2 (reverse) */}
        <div className="flex overflow-hidden">
          <div className="ticker-track" style={{ animationDirection: 'reverse', animationDuration: '40s' }}>
            {[...companies].reverse().map((name, i) => (
              <CompanyBadge key={`r2-${i}`} name={name} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap justify-center gap-12 mt-14 px-6">
        {[
          { value: '12K+', label: 'Active Writers' },
          { value: '250K+', label: 'Blog Posts Published' },
          { value: '4.9★', label: 'Average Rating' },
          { value: '98%', label: 'Satisfaction Rate' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="text-center"
          >
            <div className="text-4xl font-black gradient-text">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
