import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    ClockCircleOutlined, 
    ArrowLeftOutlined, 
    HeartOutlined, 
    MessageOutlined, 
    ShareAltOutlined,
    UserOutlined,
    TagOutlined
} from '@ant-design/icons'
import API from '../api/api'
import Navbar from '../components/Navbar'

const API_BASE = "http://localhost:7070"; // Change if needed

export default function BlogDetail() {
    const { blogId } = useParams()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchBlog = async () => {
        try {
            setLoading(true)
            const { data } = await API.get(`/blog/${blogId}`)
            if (data.success) {
                setBlog(data.blog)
            }
        } catch (error) {
            console.error("Error fetching blog:", error)
        } finally {
            setLoading(false)
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

                    <div className="flex items-center gap-4 mb-12 p-4 rounded-3xl bg-white border border-purple-50 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden">
                            {blog.author?.profileImage ? (
                                <img src={`${API_BASE}${blog.author.profileImage}`} alt={blog.author.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserOutlined className="text-primary-600 text-xl" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 m-0 capitalize">{blog.author?.name || 'Vichaar Writer'}</p>
                            <p className="text-xs text-gray-500 m-0">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="ml-auto hidden sm:flex gap-2">
                             <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border-none cursor-pointer hover:bg-purple-50 text-gray-400 hover:text-primary-600 transition-all"><HeartOutlined /></button>
                             <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border-none cursor-pointer hover:bg-purple-50 text-gray-400 hover:text-primary-600 transition-all"><ShareAltOutlined /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="px-6">
                <article className="max-w-4xl mx-auto">
                    {/* Thumbnail */}
                    {blog.thumbnil && (
                        <div className="rounded-[40px] overflow-hidden mb-12 shadow-2xl shadow-purple-200">
                            <img src={`${API_BASE}${blog.thumbnil}`} alt={blog.title} className="w-full aspect-video object-cover" />
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
                    <div 
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 blog-content"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Multi-Images Gallery */}
                    {blog.images && blog.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                            {blog.images.map((img, i) => (
                                <div key={i} className="rounded-3xl overflow-hidden border border-purple-100 shadow-sm">
                                    <img src={`${API_BASE}${img}`} alt={`Content ${i}`} className="w-full h-64 object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-12 border-t border-gray-100">
                        {blog.tags?.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-xs font-bold hover:bg-purple-50 hover:text-primary-600 transition-colors cursor-pointer">
                                <TagOutlined /> #{tag}
                            </span>
                        ))}
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
            `}</style>
        </div>
    )
}
