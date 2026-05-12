import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  EditOutlined, ClockCircleOutlined,
  SearchOutlined, HomeOutlined,
} from '@ant-design/icons'
import API from '../api/api'

const API_BASE = "http://localhost:7070";

function PostCard({ post }) {
  const [hov, setHov] = useState(false)
  const navigate = useNavigate()

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/blog/${post._id}`)}
      className="rounded-2xl overflow-hidden cursor-pointer group h-full flex flex-col"
      style={{
        background: 'white',
        border: `1.5px solid ${hov ? '#6241fe40' : '#f0eeff'}`,
        boxShadow: hov ? `0 12px 40px rgba(98,65,254,0.15)` : '0 2px 12px rgba(98,65,254,0.06)',
        transition: 'all 0.3s ease',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Thumbnail */}
      <div className="h-44 overflow-hidden relative flex-shrink-0">
        {post.thumbnil ? (
            <img 
                src={`${API_BASE}${post.thumbnil}`} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
        ) : (
            <div className="w-full h-full bg-purple-50 flex items-center justify-center text-4xl">📝</div>
        )}
        <div className="absolute top-3 left-3">
             <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-primary-600 uppercase tracking-widest shadow-sm">
                {post.category}
            </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <ClockCircleOutlined /> {post.readingTime || 5} min
          </span>
          {post.isPremium && <span className="text-[9px] font-black text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">PREMIUM</span>}
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug line-clamp-2"
          style={{ color: hov ? '#6241fe' : '#111827', transition: 'color 0.2s' }}>
          {post.title}
        </h3>
        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-primary-100 text-primary-600 text-[10px] font-black overflow-hidden">
                {post.author?.profileImage ? (
                    <img src={`${API_BASE}${post.author.profileImage}`} className="w-full h-full object-cover" />
                ) : (post.author?.name?.[0].toUpperCase() || 'V')}
            </div>
            <span className="text-[11px] font-bold text-gray-500 capitalize">{post.author?.name || 'Vichaar'}</span>
          </div>
          <motion.span animate={{ x: hov ? 4 : 0 }} className="text-xs font-bold text-primary-600">
            Read →
          </motion.span>
        </div>
      </div>
    </motion.article>
  )
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('All')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const fetchBlogs = async () => {
    try {
        setLoading(true)
        const { data } = await API.get('/blog')
        if (data.success) {
            setBlogs(data.blogs)
        }
    } catch (error) {
        console.error("Error fetching blogs:", error)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const categories = ['All', ...new Set(blogs.map(b => b.category))]

  const filtered = blogs.filter(p => {
    const matchCat = active === 'All' || p.category === active
    const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ background: '#fcfcfe' }}>
      {/* ── Mini Topbar ── */}
      <div className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(252,252,254,0.95)', backdropFilter: 'blur(12px)', borderColor: '#f0eeff' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-600 to-purple-500 shadow-md">
              <EditOutlined className="text-white text-sm" />
            </div>
            <span className="font-black text-lg text-gray-900 tracking-tighter">VICHAAR</span>
            <span className="text-[10px] bg-purple-50 text-primary-600 font-black px-2 py-0.5 rounded-full ml-2 hidden sm:block uppercase tracking-widest">Blog</span>
          </Link>

          <div className="flex-1 max-w-sm relative hidden md:block">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, tags, authors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl outline-none border border-purple-50 bg-white/50 focus:bg-white focus:border-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
             <Link to="/write" className="btn-primary text-[10px] px-5 py-2.5 shadow-lg shadow-primary-500/20 no-underline">
              <EditOutlined /> Start Writing
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="py-20 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-40">
             <div className="absolute top-10 left-10 w-32 h-32 bg-primary-200 rounded-full blur-3xl" />
             <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl" />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="sketch-badge mb-4">✦ Explore our Universe</div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            Perspective <span className="text-primary-600">Matters.</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium text-base">
            Deep dives into AI, technology, and the future of creative writing.
          </p>
        </motion.div>
      </div>

      {/* ── Category Filter ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
                active === cat ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30' : 'bg-white text-gray-400 hover:bg-purple-50'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Posts Grid ── */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        {loading ? (
            <div className="flex flex-col items-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing with universe...</p>
            </div>
        ) : (
            <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map(post => (
                    <motion.div key={post._id} layout initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <PostCard post={post} />
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
                <div className="text-7xl mb-6">🏜️</div>
                <h3 className="font-black text-2xl text-gray-900">Quiet in this corner...</h3>
                <p className="text-gray-400 mt-2 font-medium">Try broadening your search or choosing another category.</p>
                </motion.div>
            )}
            </AnimatePresence>
        )}
      </div>
    </div>
  )
}
