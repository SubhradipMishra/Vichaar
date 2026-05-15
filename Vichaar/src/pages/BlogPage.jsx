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
  UserDeleteOutlined
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => navigate(`/blog/${post._id}`)}
      className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 transition-all duration-500 hover:border-primary-200 hover:shadow-[0_20px_50px_-20px_rgba(98,65,254,0.1)] cursor-pointer flex flex-col h-full relative"
    >
      {/* Bookmark Button */}
      <button
        onClick={toggleSave}
        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${isSaved ? 'bg-primary-600 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400 hover:text-primary-600'
          }`}
      >
        <BookOutlined />
      </button>

      <div className="relative h-52 overflow-hidden">
        {post.thumbnil ? (
          <img src={`${API_BASE}${post.thumbnil}`} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-4xl opacity-50">✨</div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[9px] font-black text-primary-600 uppercase tracking-widest border border-white/50">
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-xl font-black text-gray-900 mb-3 leading-tight tracking-tight group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-8 flex-1 font-medium">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author?._id || post.author?.id}`); }}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden border border-gray-50 hover:border-primary-300 transition-all cursor-pointer"
            >
              {post.author?.profileImage ? (
                <img src={`${API_BASE}${post.author.profileImage}`} className="w-full h-full object-cover" />
              ) : post.author?.name?.[0].toUpperCase() || 'V'}
            </div>
            <span
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.author?._id || post.author?.id}`); }}
              className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-primary-600 transition-colors cursor-pointer"
            >
              {post.author?.name || 'Vichaar Editor'}
            </span>
            {((!session || (session?._id || session?.id) !== (post.author?._id || post.author?.id))) && (
              <button 
                onClick={handleFollow}
                className={`ml-1 flex items-center justify-center p-1 rounded-lg border-none cursor-pointer transition-all ${
                  session?.following?.includes(post.author?._id || post.author?.id) 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50'
                }`}
                title={session?.following?.includes(post.author?._id || post.author?.id) ? "Following" : "Follow"}
              >
                {session?.following?.includes(post.author?._id || post.author?.id) ? <UserDeleteOutlined /> : <UserAddOutlined />}
              </button>
            )}
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
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [moreLoading, setMoreLoading] = useState(false)

  const navigate = useNavigate()
  const loaderRef = useRef(null)

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
  }, [activeCategory, search])

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
            <SearchOutlined className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 text-xl group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by title, keyword, or author..."
              className="w-full h-16 pl-16 pr-6 bg-white rounded-3xl border border-gray-100 shadow-sm focus:outline-none focus:border-primary-300 focus:shadow-[0_15px_30px_-10px_rgba(98,65,254,0.1)] transition-all font-medium text-gray-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
