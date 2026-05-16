import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    ClockCircleOutlined, 
    ArrowLeftOutlined, 
    HeartOutlined, HeartFilled,
    MessageOutlined, 
    ShareAltOutlined,
    UserOutlined,
    TagOutlined,
    EyeOutlined,
    LikeOutlined,
    DislikeOutlined,
    DislikeFilled,
    FireOutlined,
    SendOutlined,
    DeleteOutlined,
    BookOutlined,
    BookFilled,
    UserAddOutlined,
    UserDeleteOutlined,
    ThunderboltOutlined
} from '@ant-design/icons'
import { message } from 'antd'
import API from '../api/api'
import Navbar from '../components/Navbar'
import Context from '../util/context'

const API_BASE = "http://localhost:7070"; // Change if needed

export default function BlogDetail() {
    const { blogId } = useParams()
    const { session, setSession } = useContext(Context)
    const isSaved = session?.savedPosts?.includes(blogId)
    const [blog, setBlog] = useState(null)
    const [comments, setComments] = useState([])
    const [commentInput, setCommentInput] = useState('')
    const [replyTo, setReplyTo] = useState(null) // { commentId, userName }
    const [loading, setLoading] = useState(true)
    const [submittingComment, setSubmittingComment] = useState(false)

    const fetchBlog = async () => {
        try {
            setLoading(true)
            const { data } = await API.get(`/blog/${blogId}`)
            if (data.success) {
                setBlog(data.blog)
                // Record view
                API.post(`/interactions/blog/${blogId}/view`).catch(err => console.error("Error recording view:", err));
                fetchComments()
            }
        } catch (error) {
            console.error("Error fetching blog:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async () => {
        try {
            const { data } = await API.get(`/interactions/blog/${blogId}/comments`)
            if (data.success) setComments(data.comments)
        } catch (error) {
            console.error("Error fetching comments:", error)
        }
    }

    const handleInteraction = async (type) => {
        if (!session) {
            message.info("Please login to like or dislike this post.")
            return
        }

        try {
            const { data } = await API.post(`/interactions/blog/${blogId}/like`, { type })
            if (data.success) {
                setBlog(prev => ({ ...prev, likes: data.likes, dislikes: data.dislikes }))
                message.success(type === 'like' ? "Liked!" : "Disliked!")
            }
        } catch (error) {
            message.error("Action failed")
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!session) {
            message.info("Please login to comment.")
            return
        }
        if (!commentInput.trim()) return

        try {
            setSubmittingComment(true)
            const payload = { 
                content: commentInput,
                parentComment: replyTo?.commentId || null 
            }
            const { data } = await API.post(`/interactions/blog/${blogId}/comment`, payload)
            if (data.success) {
                setComments(prev => [data.comment, ...prev])
                setCommentInput('')
                setReplyTo(null)
                setBlog(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }))
                message.success(replyTo ? "Reply posted!" : "Comment posted!")
            }
        } catch (error) {
            message.error("Failed to post comment")
        } finally {
            setSubmittingComment(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return

        try {
            const { data } = await API.delete(`/interactions/comment/${commentId}`)
            if (data.success) {
                setComments(prev => prev.filter(c => c._id !== commentId))
                setBlog(prev => ({ ...prev, commentsCount: (prev.commentsCount || 1) - 1 }))
                message.success("Comment deleted")
            }
        } catch (error) {
            message.error("Failed to delete comment")
        }
    }

    const handleSave = async () => {
        if (!session) {
            message.info("Please login to save this post.")
            return
        }

        try {
            const { data } = await API.post(`/blog/${blogId}/save`)
            if (data.success) {
                message.success(data.message)
                const updatedSavedPosts = data.isSaved 
                    ? [...(session.savedPosts || []), blogId]
                    : (session.savedPosts || []).filter(id => id !== blogId)
                
                setSession({ ...session, savedPosts: updatedSavedPosts })
            }
        } catch (error) {
            message.error("Failed to save post")
        }
    }

    const handleFollow = async () => {
        if (!session) {
            message.info("Please login to follow authors.")
            return
        }

        const authorId = blog.author?._id || blog.author?.id
        if (session._id === authorId || session.id === authorId) {
            message.info("You cannot follow yourself.")
            return
        }

        try {
            const { data } = await API.post(`/auth/follow/${authorId}`)
            if (data.success) {
                message.success(data.message)
                const isNowFollowing = data.isFollowing
                const updatedFollowing = isNowFollowing 
                    ? [...(session.following || []), authorId]
                    : (session.following || []).filter(id => id !== authorId)
                
                setSession({ ...session, following: updatedFollowing })
            }
        } catch (error) {
            message.error("Action failed")
        }
    }

    const handleShare = async () => {
        if (blog?.isPremium) {
            message.info("Premium stories cannot be shared directly.")
            return
        }
        const shareUrl = window.location.href

        try {
            if (navigator.share) {
                await navigator.share({
                    title: blog?.title || 'Vichaar post',
                    text: blog?.excerpt || 'Check out this Vichaar article.',
                    url: shareUrl,
                })
                return
            }

            await navigator.clipboard.writeText(shareUrl)
            window.alert('Article link copied to clipboard.')
        } catch (error) {
            console.error('Error sharing blog:', error)
        }
    }

    useEffect(() => {
        fetchBlog()
    }, [blogId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7ff]">
                <h1 className="text-4xl font-black text-gray-900 mb-4">Blog Not Found</h1>
                <Link to="/blog" className="btn-primary no-underline"><ArrowLeftOutlined /> Back to Blog</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20" style={{ background: '#fcfcfe' }}>
            <Navbar />
            
            {/* ── Article Header ── */}
            <div className="pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-primary-600 transition-colors mb-8 no-underline font-semibold text-sm">
                        <ArrowLeftOutlined /> Back to all posts
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="sketch-badge">{blog.category}</span>
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <ClockCircleOutlined /> {blog.readingTime || 5} min read
                        </span>
                        {blog.isPremium && <span className="bg-yellow-100 text-yellow-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Premium</span>}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8">
                        {blog.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-12 p-4 rounded-3xl bg-paper border border-purple-100 shadow-sm">
                        <Link to={`/profile/${blog.author?._id || blog.author?.id}`} className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                            {blog.author?.profileImage ? (
                                <img src={`${API_BASE}${blog.author.profileImage}`} alt={blog.author.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserOutlined className="text-primary-600 text-xl" />
                            )}
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <Link to={`/profile/${blog.author?._id || blog.author?.id}`} className="font-bold text-gray-900 m-0 capitalize no-underline hover:text-primary-600 transition-colors block">{blog.author?.name || 'Vichaar Writer'}</Link>
                                {((!session || (session?._id || session?.id) !== (blog.author?._id || blog.author?.id))) && (
                                    <button 
                                        onClick={handleFollow}
                                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none cursor-pointer transition-all flex items-center gap-2 ${
                                            session?.following?.includes(blog.author?._id || blog.author?.id)
                                                ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20'
                                        }`}
                                    >
                                        {session?.following?.includes(blog.author?._id || blog.author?.id) ? (
                                            <><UserDeleteOutlined /> Following</>
                                        ) : (
                                            <><UserAddOutlined /> Follow</>
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 m-0">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="ml-auto hidden sm:flex gap-3">
                             <div className="flex items-center gap-4 mr-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-purple-50 pr-4">
                                <span className="flex items-center gap-1.5"><EyeOutlined className="text-primary-500" /> {blog.views || 0}</span>
                                <span className="flex items-center gap-1.5"><LikeOutlined className="text-primary-500" /> {blog.likes || 0}</span>
                                <span className="flex items-center gap-1.5"><DislikeOutlined className="text-primary-500" /> {blog.dislikes || 0}</span>
                                <span className="flex items-center gap-1.5"><MessageOutlined className="text-primary-500" /> {blog.commentsCount || 0}</span>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => handleInteraction('like')} title="Like" className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border-none cursor-pointer hover:bg-primary-600 text-primary-600 hover:text-white transition-all shadow-sm"><HeartFilled /></button>
                                <button onClick={() => handleInteraction('dislike')} title="Dislike" className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border-none cursor-pointer hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-sm"><DislikeFilled /></button>
                                {((!session || (session?._id || session?.id) !== (blog.author?._id || blog.author?.id))) && (
                                    <button 
                                        onClick={handleFollow} 
                                        title={session?.following?.includes(blog.author?._id || blog.author?.id) ? "Unfollow" : "Follow"}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all shadow-sm ${
                                            session?.following?.includes(blog.author?._id || blog.author?.id) 
                                                ? 'bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white' 
                                                : 'bg-primary-100 text-primary-600 hover:bg-primary-600 hover:text-white'
                                        }`}
                                    >
                                        {session?.following?.includes(blog.author?._id || blog.author?.id) ? <UserDeleteOutlined /> : <UserAddOutlined />}
                                    </button>
                                )}
                                <button onClick={handleSave} title="Save" className={`w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all shadow-sm ${isSaved ? 'bg-primary-600 text-white' : 'bg-blue-50 text-blue-500 hover:bg-primary-50 hover:text-primary-600'}`}>
                                    {isSaved ? <BookFilled /> : <BookOutlined />}
                                </button>
                                {!blog.isPremium && (
                                    <button onClick={handleShare} title="Share" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border-none cursor-pointer hover:bg-purple-50 text-gray-400 hover:text-primary-600 transition-all shadow-sm"><ShareAltOutlined /></button>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="px-6">
                <article className="max-w-4xl mx-auto">
                    {/* Thumbnail */}
                    {blog.thumbnail && (
                        <div className="rounded-[40px] overflow-hidden mb-12 shadow-2xl shadow-purple-200">
                            <img src={`${API_BASE}${blog.thumbnail}`} alt={blog.title} className="w-full aspect-video object-cover" />
                        </div>
                    )}

                    {/* AI Summary Card */}
                    {blog.aiSummary && (
                        <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-[32px] p-8 mb-12 text-white relative overflow-hidden shadow-xl">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                                    <span className="text-2xl">✨</span> AI Quick Summary
                                </h3>
                                <p className="text-white/80 text-base leading-relaxed italic">
                                    "{blog.aiSummary}"
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        </div>
                    )}

                    {/* Blog Body */}
                    <div className="relative">
                        <div 
                            className={`prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 blog-content transition-all duration-700 ${blog.isPremium && !session?.isPremium ? 'blur-xl select-none h-96 overflow-hidden pointer-events-none' : ''}`}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                        
                        {blog.isPremium && !session?.isPremium && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                                <div className="p-8 rounded-[40px] bg-white/90 backdrop-blur-md border border-purple-100 shadow-2xl max-w-md">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
                                        <ThunderboltOutlined className="text-white text-3xl" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">This is a Premium Story</h3>
                                    <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                                        The author has designated this post for premium members. Upgrade your account to unlock full access and support the creator.
                                    </p>
                                    <Link 
                                        to="/pricing" 
                                        className="btn-primary w-full justify-center py-4 text-sm font-black shadow-xl shadow-primary-500/20 no-underline"
                                    >
                                        Unlock Full Access
                                    </Link>
                                    <p className="mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        Starting at just ₹299/month
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Multi-Images Gallery */}
                    {(!blog.isPremium || session?.isPremium) && blog.images && blog.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                            {blog.images.map((img, i) => (
                                <div key={i} className="rounded-3xl overflow-hidden border border-purple-100 shadow-sm">
                                    <img src={`${API_BASE}${img}`} alt={`Content ${i}`} className="w-full h-64 object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 py-12 border-t border-gray-100 mb-12">
                        {blog.tags?.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-xs font-bold hover:bg-purple-50 hover:text-primary-600 transition-colors cursor-pointer">
                                <TagOutlined /> #{tag}
                            </span>
                        ))}
                    </div>

                    {/* ── Comments Section ── */}
                    <div className="pt-12 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
                                Conversations ({comments.length})
                            </h3>
                            {!session && <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Login to join the talk</p>}
                        </div>

                        {/* Comment Form */}
                        <form onSubmit={handleAddComment} className="mb-12">
                            {replyTo && (
                                <div className="flex items-center justify-between px-6 py-2 bg-primary-50 rounded-t-2xl border-x border-t border-purple-50 text-[10px] font-bold text-primary-600">
                                    <span>Replying to {replyTo.userName}</span>
                                    <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer">Cancel</button>
                                </div>
                            )}
                            <div className="relative group">
                                <textarea
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    placeholder={session ? (replyTo ? "Write your reply..." : "Share your thoughts...") : "Please login to comment..."}
                                    disabled={!session || submittingComment}
                                    className={`w-full min-h-[120px] p-6 bg-white border border-purple-50 outline-none focus:border-primary-300 transition-all text-sm text-gray-700 resize-none shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed ${replyTo ? 'rounded-b-[32px]' : 'rounded-[32px]'}`}
                                />
                                {session && (
                                    <button 
                                        type="submit" 
                                        disabled={submittingComment || !commentInput.trim()}
                                        className="absolute bottom-4 right-4 w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center border-none cursor-pointer hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                                    >
                                        <SendOutlined />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-8">
                            {comments.length > 0 ? comments.map(comment => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={comment._id} 
                                    className="flex gap-4 group"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {comment.user?.profileImage ? (
                                            <img src={`${API_BASE}${comment.user.profileImage}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserOutlined className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-black text-gray-900 capitalize">{comment.user?.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            <div className="ml-auto flex items-center gap-2">
                                                {session && (
                                                    <button 
                                                        onClick={() => {
                                                            setReplyTo({ commentId: comment._id, userName: comment.user?.name })
                                                            window.scrollTo({ top: document.querySelector('form').offsetTop - 100, behavior: 'smooth' })
                                                        }}
                                                        className="text-[10px] font-bold text-primary-600 hover:underline border-none bg-transparent cursor-pointer"
                                                    >
                                                        Reply
                                                    </button>
                                                )}
                                                {(session?.id === comment.user?._id || session?._id === comment.user?._id || session?.role === 'admin') && (
                                                    <button 
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer"
                                                    >
                                                        <DeleteOutlined />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            {comment.parentComment && (
                                                <p className="text-[10px] font-bold text-primary-400 mb-1 flex items-center gap-1 italic">
                                                    <SendOutlined className="rotate-180 scale-75" /> replying to a comment
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-12 bg-gray-50/30 rounded-[32px] border border-dashed border-gray-100">
                                    <MessageOutlined className="text-gray-200 text-3xl mb-3" />
                                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Be the first to comment</p>
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            </div>

            <style>{`
                .blog-content h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: #111827; }
                .blog-content h2 { font-size: 1.8rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #111827; }
                .blog-content h3 { font-size: 1.4rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
                .blog-content p { margin-bottom: 1.5rem; line-height: 1.8; }
                .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .blog-content li { margin-bottom: 0.5rem; }
                .blog-content strong { color: #111827; font-weight: 700; }
                .blog-content blockquote { border-left: 4px solid #6241fe; padding-left: 1.5rem; font-style: italic; color: #4b5563; margin: 2rem 0; }
                .blog-content img { max-width: 100%; height: auto; border-radius: 2rem; margin: 2.5rem 0; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #f0eeff; display: block; margin-left: auto; margin-right: auto; }
            `}</style>
        </div>
    )
}
