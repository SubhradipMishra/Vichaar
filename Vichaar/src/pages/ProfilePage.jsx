import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    UserOutlined, 
    GlobalOutlined, 
    TwitterOutlined, 
    GithubOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    LikeOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
    FileTextOutlined
} from '@ant-design/icons'
import { message } from 'antd'
import API from '../api/api'
import Navbar from '../components/Navbar'
import Context from '../util/context'

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
      <div className="relative h-48 overflow-hidden">
        {post.thumbnil ? (
          <img 
            src={`${API_BASE}${post.thumbnil}`} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-4xl opacity-50">✨</div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[9px] font-black text-primary-600 uppercase tracking-widest border border-white/50">
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-black text-gray-900 mb-3 leading-tight tracking-tight group-hover:text-primary-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-6 flex-1 font-medium">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-4 text-[9px] font-black text-gray-300 uppercase tracking-widest pt-4 border-t border-gray-50">
          <span className="flex items-center gap-1.5"><ClockCircleOutlined className="text-primary-400" /> {post.readingTime || 5}m</span>
          <span className="flex items-center gap-1.5"><EyeOutlined className="text-primary-400" /> {post.views || 0}</span>
          <span className="flex items-center gap-1.5"><LikeOutlined className="text-primary-400" /> {post.likes || 0}</span>
        </div>
      </div>
    </motion.article>
  )
}

export default function ProfilePage() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { session, setSession } = useContext(Context)
    const [profile, setProfile] = useState(null)
    const [blogs, setBlogs] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data } = await API.get(`/auth/profile/${userId}`)
            if (data.success) {
                setProfile(data.user)
                setBlogs(data.blogs)
                setStats(data.stats)
            }
        } catch (error) {
            message.error("Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async () => {
        if (!session) {
            message.info("Please login to follow authors")
            return navigate('/login')
        }

        try {
            setFollowLoading(true)
            const { data } = await API.post(`/auth/follow/${userId}`)
            if (data.success) {
                message.success(data.message)
                // Update local stats
                setStats(prev => ({
                    ...prev,
                    followers: data.isFollowing ? prev.followers + 1 : prev.followers - 1
                }))
                // Update session to reflect following status
                const updatedFollowing = data.isFollowing 
                    ? [...(session.following || []), userId]
                    : (session.following || []).filter(id => id !== userId)
                
                setSession({ ...session, following: updatedFollowing })
            }
        } catch (error) {
            message.error("Action failed")
        } finally {
            setFollowLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [userId])

    const isFollowing = session?.following?.includes(userId)
    const isOwnProfile = session?.id === userId || session?._id === userId

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-paper pb-20">
            <Navbar />
            
            {/* Header / Hero */}
            <div className="pt-32 pb-12 px-6 bg-gradient-to-b from-primary-50/50 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-primary-600 transition-colors mb-12 border-none bg-transparent cursor-pointer font-black text-[10px] uppercase tracking-widest">
                        <ArrowLeftOutlined /> Back
                    </button>

                    <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-40 h-40 rounded-[40px] bg-white p-2 shadow-2xl shadow-primary-500/10 relative"
                        >
                            <div className="w-full h-full rounded-[32px] overflow-hidden bg-gray-50 flex items-center justify-center">
                                {profile.profileImage ? (
                                    <img src={`${API_BASE}${profile.profileImage}`} className="w-full h-full object-cover" />
                                ) : (
                                    <UserOutlined className="text-5xl text-gray-200" />
                                )}
                            </div>
                            {profile.isPremium && (
                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-yellow-400/20">
                                    <span className="text-white text-lg">💎</span>
                                </div>
                            )}
                        </motion.div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter capitalize m-0">
                                    {profile.name}
                                </h1>
                                {profile.role === 'admin' && (
                                    <span className="px-3 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Staff</span>
                                )}
                            </div>
                            
                            <p className="text-lg text-gray-500 font-medium max-w-xl leading-relaxed mb-8">
                                {profile.bio || "Crafting stories and sharing perspectives on Vichaar."}
                            </p>

                            <div className="flex flex-wrap gap-8 mb-8">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-gray-900">{stats?.followers || 0}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Followers</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-gray-900">{stats?.following || 0}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Following</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-gray-900">{blogs.length}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stories</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {!isOwnProfile && (
                                    <button 
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 border-none cursor-pointer ${
                                            isFollowing 
                                            ? 'bg-gray-900 text-white hover:bg-gray-800' 
                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                        }`}
                                    >
                                        {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow Author')}
                                    </button>
                                )}
                                <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all cursor-pointer">
                                    <GlobalOutlined />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 max-w-6xl mx-auto mt-12">
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Published Stories</h2>
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                </div>

                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-100">
                        <FileTextOutlined className="text-4xl text-gray-200 mb-4" />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No stories yet</h3>
                        <p className="text-sm text-gray-300 mt-2">This author hasn't published anything yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
