import { useState, useEffect, useRef, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SearchOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  EditOutlined,
  BookOutlined,
  HeartOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import Navbar from '../components/Navbar'
import API from '../api/api'
import Context from '../util/context'

const API_BASE = "http://localhost:7070";

const categories = ['All', 'Technology', 'Design', 'Development', 'AI', 'Business', 'Life']

function PostCard({ post }) {
  const navigate = useNavigate()
  const { session, setSession } = useContext(Context)

  const isSaved = session?.savedPosts?.includes(post._id);

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!session) return message.info("Login to save posts");

    try {
      const { data } = await API.post(`/blog/${post._id}/save`);
      if (data.success) {
        message.success(data.message);
        // Update local session state
        const updatedSaved = data.isSaved
          ? [...(session.savedPosts || []), post._id]
          : (session.savedPosts || []).filter(id => id !== post._id);

        setSession({ ...session, savedPosts: updatedSaved });
      }
    } catch (error) {
      message.error("Action failed");
    }
  }

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!session) return message.info("Login to follow authors");

    const authorId = post.author?._id || post.author?.id;
    if ((session._id || session.id) === authorId) return message.info("You cannot follow yourself");

    try {
      const { data } = await API.post(`/auth/follow/${authorId}`);
      if (data.success) {
        message.success(data.message);
        const isNowFollowing = data.isFollowing;
        const updatedFollowing = isNowFollowing
          ? [...(session.following || []), authorId]
          : (session.following || []).filter(id => id !== authorId);

        setSession({ ...session, following: updatedFollowing });
      }
    } catch (error) {
      message.error("Action failed");
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={() => navigate(`/blog/${post._id}`)}
      className="group bg-white p-6 md:p-8 rounded-[40px] border border-gray-50 hover:bg-gray-50/50 transition-all duration-500 cursor-pointer relative"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {/* Author info top */}
          <div className="flex items-center gap-2 mb-4">
            <div 
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author?._id || post.author?.id}`); }}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 hover:border-primary-400 transition-all shrink-0"
            >
                {post.author?.profileImage ? (
                    <img src={`${API_BASE}${post.author.profileImage}`} className="w-full h-full object-cover" />
                ) : <span className="text-[8px] font-black">{post.author?.name?.[0].toUpperCase()}</span>}
            </div>
            <p className="text-[11px] font-medium text-gray-500 m-0 flex items-center gap-1.5 flex-wrap">
                In <span className="text-gray-900 font-bold hover:underline">{post.category}</span> 
                by <span onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author?._id || post.author?.id}`); }} className="text-gray-900 font-bold hover:underline">{post.author?.name}</span> 
                • {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {post.isPremium && <span className="ml-2 text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Premium</span>}
            </p>
          </div>

          {/* Title & Excerpt */}
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-[1.1] tracking-tight group-hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed line-clamp-2 mb-8 font-medium max-w-2xl">
            {post.excerpt}
          </p>

          {/* Interaction Bar Bottom */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 group/icon hover:text-primary-600 transition-colors">
                    <LikeOutlined className="text-base group-hover/icon:scale-110 transition-transform" /> {post.likes || 0}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 group/icon hover:text-primary-600 transition-colors">
                    <HeartOutlined className="text-base group-hover/icon:scale-110 transition-transform" /> {post.dislikes || 0}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 group/icon hover:text-primary-600 transition-colors">
                    <EyeOutlined className="text-base group-hover/icon:scale-110 transition-transform" /> {post.views || 0}
                </span>
                {((!session || (session?._id || session?.id) !== (post.author?._id || post.author?.id))) && (
                    <button 
                        onClick={handleFollow}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none cursor-pointer transition-all ${
                            session?.following?.includes(post.author?._id || post.author?.id) 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
                        }`}
                    >
                        {session?.following?.includes(post.author?._id || post.author?.id) ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleSave}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer text-lg ${
                        isSaved ? 'text-primary-600 bg-primary-50' : 'text-gray-300 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                >
                    {isSaved ? <BookOutlined /> : <BookOutlined />}
                </button>
            </div>
          </div>
        </div>

        {/* Small Thumbnail Right */}
        <div className="w-full md:w-48 h-32 md:h-32 rounded-2xl overflow-hidden shrink-0 border border-gray-100 self-center">
          {post.thumbnil ? (
            <img src={`${API_BASE}${post.thumbnil}`} alt={post.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-2xl opacity-20">✨</div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [moreLoading, setMoreLoading] = useState(false)
  const navigate = useNavigate()
  const loaderRef = useRef(null)

  // Debounce logic for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // 500ms delay

    return () => clearTimeout(handler)
  }, [search])

  const fetchBlogs = async (pageNum = 1, isNew = false) => {
    try {
      if (isNew) setLoading(true);
      else setMoreLoading(true);

      const params = new URLSearchParams({
        page: pageNum,
        limit: 8,
        category: activeCategory !== 'All' ? activeCategory : '',
        search: search
      })

      const { data } = await API.get(`/blog?${params.toString()}`)

      if (data.success) {
        if (isNew) {
          setBlogs(data.blogs)
        } else {
          setBlogs(prev => [...prev, ...data.blogs])
        }
        setHasMore(data.blogs.length === 8)
      }
    } catch (error) {
      console.error('Fetch error', error)
    } finally {
      setLoading(false)
      setMoreLoading(false)
    }
  }

  // Handle intersection for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !moreLoading && !loading) {
        setPage(prev => prev + 1)
      }
    }, { threshold: 1.0 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, moreLoading, loading]);

  useEffect(() => {
    fetchBlogs(page)
  }, [page])

  useEffect(() => {
    setPage(1)
    fetchBlogs(1, true)
  }, [activeCategory, debouncedSearch])

  return (
    <div className="min-h-screen bg-paper pb-20">
      <Navbar />

      <div className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-primary-50 border border-primary-100 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">The Insight Engine</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9]">
            EXPLORE THE <br /> <span className="gradient-text">UNIVERSE OF THOUGHT</span>
          </h1>

          <div className="max-w-2xl mx-auto relative group mt-12">
            <SearchOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-primary-600 transition-colors z-10" />
            <input
              type="text"
              placeholder="Search stories, authors, or categories..."
              className="w-full h-16 pl-16 pr-12 bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:outline-none focus:border-primary-400 focus:shadow-[0_10px_30px_rgba(98,65,254,0.08)] transition-all font-medium text-gray-700 placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 hover:bg-red-50 hover:text-red-500 border-none cursor-pointer transition-all"
              >
                <CloseOutlined />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-10 mb-8 border-b border-gray-50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-none cursor-pointer ${activeCategory === cat
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mb-4" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Synchronizing...</p>
          </div>
        ) : (
          <>
            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
                {blogs.map((post, idx) => (
                  <PostCard key={`${post._id}-${idx}`} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-100">
                <h3 className="font-black text-xl text-gray-900 tracking-tight">Workspace is empty</h3>
                <p className="text-gray-400 mt-2 text-sm font-medium">Try another category or search term.</p>
              </div>
            )}

            {/* Lazy Loader Trigger */}
            <div ref={loaderRef} className="py-20 flex flex-col items-center justify-center">
              {moreLoading && (
                <div className="flex flex-col items-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mb-3" />
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Loading More...</p>
                </div>
              )}
              {!hasMore && blogs.length > 0 && (
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">You've reached the edge of the universe 🌌</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
