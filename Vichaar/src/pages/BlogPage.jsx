import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import {
  EditOutlined, ClockCircleOutlined,
  SearchOutlined, EyeOutlined, LikeOutlined,
  ShareAltOutlined, ArrowRightOutlined,
  FireOutlined, RocketOutlined, MessageOutlined,
  StarOutlined, ThunderboltOutlined,
  PlusOutlined
} from '@ant-design/icons'
import API from '../api/api'

const API_BASE = "http://localhost:7070";

function PostCard({ post }) {
  const navigate = useNavigate()

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => navigate(`/blog/${post._id}`)}
      className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 transition-all duration-500 hover:border-primary-200 hover:shadow-[0_20px_50px_-20px_rgba(98,65,254,0.1)] cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-52 overflow-hidden">
        {post.thumbnil ? (
          <img 
            src={`${API_BASE}${post.thumbnil}`} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-4xl opacity-50">✨</div>
        )}
        
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[9px] font-black text-primary-600 uppercase tracking-widest border border-white/50">
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><ClockCircleOutlined className="text-primary-400" /> {post.readingTime || 5}m</span>
          <span className="flex items-center gap-1.5"><EyeOutlined className="text-primary-400" /> {post.views || 0}</span>
          <span className="flex items-center gap-1.5"><LikeOutlined className="text-primary-400" /> {post.likes || 0}</span>
        </div>

        <h3 className="text-lg font-black text-gray-900 mb-3 leading-tight tracking-tight group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-6 flex-1 font-medium">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden border border-gray-50">
                {post.author?.profileImage ? (
                    <img src={`${API_BASE}${post.author.profileImage}`} className="w-full h-full object-cover" />
                ) : post.author?.name?.[0].toUpperCase() || 'V'}
             </div>
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{post.author?.name || 'Vichaar Editor'}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
             <ArrowRightOutlined className="text-xs" />
          </div>
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
  const canvasRef = useRef(null)

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000)
    camera.position.z = 30
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    for (let i = 0; i < 2000; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(1500))
        vertices.push(THREE.MathUtils.randFloatSpread(1500))
        vertices.push(THREE.MathUtils.randFloatSpread(1500))
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    const material = new THREE.PointsMaterial({ color: 0x6241fe, size: 1.5, transparent: true, opacity: 0.1 })
    const points = new THREE.Points(geometry, material)
    scene.add(points)
    const animate = () => {
        requestAnimationFrame(animate)
        points.rotation.y += 0.0002
        renderer.render(scene, camera)
    }
    animate()
    const handleResize = () => {
        camera.aspect = canvas.offsetWidth / canvas.offsetHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const categories = ['All', ...new Set(blogs.map(b => b.category))]
  const filtered = blogs.filter(p => {
    const matchCat = active === 'All' || p.category === active
    const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen font-sans" style={{ background: '#fcfcfe' }}>
      {/* ── Minimal Topbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20">
              <EditOutlined className="text-white text-lg" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tighter">VICHAAR</span>
          </Link>

          <div className="flex-1 max-w-md relative hidden md:block">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Explore the universe..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs font-bold rounded-[20px] border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary-500 transition-all outline-none"
            />
          </div>

          <Link to="/write" className="btn-primary text-[10px] px-6 py-3 no-underline flex items-center gap-2">
            <PlusOutlined /> Start Writing
          </Link>
        </div>
      </nav>

      {/* ── Minimal Hero ── */}
      <div className="py-24 md:py-36 text-center px-6 relative overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-primary-100">
                    Discover Insights
                </span>
                <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-none">
                    Universe of <span className="text-primary-600">Ideas.</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto font-medium text-lg leading-relaxed">
                    Exploring the frontier of technology, creativity, and the stories that shape our tomorrow.
                </p>
            </motion.div>
        </div>
      </div>

      {/* ── Minimal Categories ── */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
                active === cat ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Minimal Grid ── */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        {loading ? (
            <div className="flex flex-col items-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mb-4" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Synchronizing...</p>
            </div>
        ) : (
            <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map(post => (
                    <motion.div key={post._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PostCard post={post} />
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-100">
                    <h3 className="font-black text-xl text-gray-900 tracking-tight">Workspace is empty</h3>
                    <p className="text-gray-400 mt-2 text-sm font-medium">Try another category or search term.</p>
                </div>
            )}
            </AnimatePresence>
        )}
      </div>
    </div>
  )
}
