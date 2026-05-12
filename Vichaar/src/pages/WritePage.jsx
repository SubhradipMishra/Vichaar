import { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  EditOutlined, HomeOutlined, SaveOutlined, EyeOutlined,
  SendOutlined, RobotOutlined, ThunderboltOutlined,
  CloseOutlined, PictureOutlined, TagsOutlined,
  AppstoreOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import API from '../api/api'
import Context from '../util/context'
import TiptapEditor from '../components/TiptapEditor'

const categories = ['AI Writing', 'Technology', 'SEO Tips', 'Productivity', 'Case Study', 'Tutorial', 'Insights']

export default function WritePage() {
  const { session, sessionLoading } = useContext(Context)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isPremium, setIsPremium] = useState(false)

  const [thumbnil, setThumbnil] = useState(null)
  const [thumbnilPreview, setThumbnilPreview] = useState(null)
  const [images, setImages] = useState([])

  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    if (!session && !sessionLoading) navigate('/login')
    console.log(session);
  }, [session, navigate, sessionLoading])

  const handleThumbnilChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnil(file)
      setThumbnilPreview(URL.createObjectURL(file))
    }
  }

  const handleImagesChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }

  const removeTag = (t) => setTags(tags.filter(x => x !== t))

  const handlePublish = async () => {
    // Check if content has actual text (ignoring HTML tags)
    const hasContent = content.replace(/<[^>]*>/g, '').trim().length > 0;

    if (!title || !hasContent || !excerpt || !thumbnil) {
      let missing = [];
      if (!title) missing.push("Title");
      if (!hasContent) missing.push("Blog Content");
      if (!excerpt) missing.push("Short Excerpt");
      if (!thumbnil) missing.push("Thumbnail Image");

      alert(`Please fill in the following required fields: ${missing.join(', ')}`)
      return
    }

    if (!session?.id && !sessionLoading) {
      alert("Session expired. Please login again.");
      navigate('/login');
      return;
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title', title)
      formData.append('slug', title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
      formData.append('content', content)
      formData.append('excerpt', excerpt)
      formData.append('category', category)
      formData.append('status', 'published')
      formData.append('tags', JSON.stringify(tags))
      formData.append('isPremium', isPremium)
      formData.append('seoTitle', title)
      formData.append('seoDescription', excerpt)
      formData.append('aiSummary', excerpt)

      if (thumbnil) formData.append('thumbnil', thumbnil)
      images.forEach(img => formData.append('images', img))

      const { data } = await API.post('/blog/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.success) {
        setPublished(true)
      }
    } catch (error) {
      console.error("Publishing failed:", error)
      alert(error.response?.data?.message || "Failed to publish blog")
    } finally {
      setLoading(false)
    }
  }

  if (published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfe]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12 max-w-md">
          <div className="text-8xl mb-6">🚀</div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Post Published!</h2>
          <p className="text-gray-500 mb-8">Your masterpiece is now live and being synced across the universe.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/blog')} className="btn-primary justify-center">View on Blog</button>
            <button onClick={() => setPublished(false)} className="btn-secondary justify-center">Write Another</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfe]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md border-purple-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-purple-500 flex items-center justify-center">
              <EditOutlined className="text-white text-sm" />
            </div>
            <span className="font-black text-gray-900 hidden sm:block">VICHAAR</span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary-600 transition-all border-none bg-transparent cursor-pointer">
              <SaveOutlined /> Save Draft
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              disabled={loading}
              className="btn-primary text-xs px-6 py-2.5 shadow-xl shadow-primary-500/20"
            >
              {loading ? 'Publishing...' : <><SendOutlined /> Publish Post</>}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 pt-12 pb-24 flex gap-12">
        {/* ── Editor ── */}
        <div className="flex-1 min-w-0">
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="An Eye-Catching Title..."
            className="w-full resize-none outline-none border-none text-4xl md:text-6xl font-black text-gray-900 placeholder-gray-100 mb-8 leading-tight bg-transparent"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Thumbnail Upload */}
            <div className="relative aspect-video rounded-[32px] bg-gray-50 border-2 border-dashed border-purple-100 flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:bg-purple-50 transition-all">
              {thumbnilPreview ? (
                <img src={thumbnilPreview} className="w-full h-full object-cover" />
              ) : (
                <>
                  <PictureOutlined className="text-4xl text-purple-200 mb-2" />
                  <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Upload Thumbnail</p>
                </>
              )}
              <input type="file" onChange={handleThumbnilChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>

            {/* Excerpt */}
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <InfoCircleOutlined /> Short Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Briefly describe what this post is about..."
                className="flex-1 w-full p-6 rounded-[32px] bg-white border border-purple-50 outline-none focus:border-primary-300 transition-all text-sm text-gray-600 resize-none shadow-sm"
              />
            </div>
          </div>

          <TiptapEditor content={content} onChange={setContent} />
        </div>

        {/* ── Sidebar Panels ── */}
        <aside className="w-80 hidden lg:flex flex-col gap-6 sticky top-28 h-fit">

          {/* Settings Card */}
          <div className="bg-white rounded-[32px] p-6 border border-purple-50 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AppstoreOutlined /> Post Settings
            </h4>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-900 block mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 border-none text-xs font-bold text-gray-600 outline-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 block mb-2">Tags</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-lg bg-primary-50 text-primary-600 text-[10px] font-bold flex items-center gap-1">
                      #{t} <CloseOutlined className="cursor-pointer" onClick={() => removeTag(t)} />
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className="w-full p-3 rounded-xl bg-gray-50 border-none text-xs font-bold outline-none"
                  />
                  <TagsOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-yellow-50/50 border border-yellow-100">
                <span className="text-xs font-bold text-yellow-700">Premium Post</span>
                <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="accent-yellow-500 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-[32px] p-6 border border-purple-50 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <PictureOutlined /> Extra Media
            </h4>
            <div className="relative p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-purple-100 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-gray-400">Select images for content gallery</p>
              <span className="text-[9px] text-primary-500 font-bold mt-1">{images.length} files selected</span>
              <input type="file" multiple onChange={handleImagesChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </div>

          {/* AI Panel */}
          <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-[32px] p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black flex items-center gap-2">
                <RobotOutlined /> AI ASSISTANT
              </h4>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed mb-4">I can help you expand your ideas, fix grammar, or optimize this post for SEO.</p>
            <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold border-none text-white cursor-pointer transition-all">
              <ThunderboltOutlined /> Generate AI Summary
            </button>
          </div>

        </aside>
      </div>
    </div>
  )
}
