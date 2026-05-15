import { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  EditOutlined, HomeOutlined, SaveOutlined, EyeOutlined,
  SendOutlined, RobotOutlined, ThunderboltOutlined,
  CloseOutlined, PictureOutlined, TagsOutlined,
  AppstoreOutlined, InfoCircleOutlined, PlusOutlined
} from '@ant-design/icons'
import { message } from 'antd'
import API from '../api/api'
import Context from '../util/context'
import TiptapEditor from '../components/TiptapEditor'

const categories = ['AI Writing', 'Technology', 'SEO Tips', 'Productivity', 'Case Study', 'Tutorial', 'Insights']

export default function WritePage() {
  const { session, sessionLoading } = useContext(Context)
  const navigate = useNavigate()
  const userId = session?.id || session?._id;
  const draftStorageKey = userId ? `vichaar-draft:${userId}` : 'vichaar-draft:guest'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [readingTime, setReadingTime] = useState(5)

  const [thumbnil, setThumbnil] = useState(null)
  const [thumbnilPreview, setThumbnilPreview] = useState(null)
  const [images, setImages] = useState([])

  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    if (!session && !sessionLoading) navigate('/login')
    console.log(session);
  }, [session, navigate, sessionLoading])

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftStorageKey)

    if (!savedDraft) return

    try {
      const draft = JSON.parse(savedDraft)
      setTitle(draft.title || '')
      setContent(draft.content || '')
      setExcerpt(draft.excerpt || '')
      setCategory(draft.category || categories[0])
      setTags(draft.tags || [])
      setIsPremium(Boolean(draft.isPremium))
      setReadingTime(draft.readingTime || 5)
      message.info('Recovered your last saved draft.')
    } catch (error) {
      console.error('Failed to parse saved draft:', error)
    }
  }, [draftStorageKey])

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


  const handleGenerateSummary = () => {
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    if (!plainText) {
      message.warning('Add some content first so I can create a summary.')
      return
    }

    const generatedSummary = plainText.slice(0, 180).trim()
    setExcerpt(generatedSummary.endsWith('.') ? generatedSummary : `${generatedSummary}...`)
    message.success('Summary added to the excerpt field.')
  }

  const handleAIGenerateImage = async () => {
    if (!title) return message.warning("Please enter a title first so I can visualize it!");
    if (!session?.isPremium) return message.error("Premium feature! Please upgrade to use AI generation.");

    try {
      setLoading(true);
      message.loading({ content: "Generating your masterpiece...", key: "ai-img" });
      
      const { data } = await API.post('/ai/image', { title });
      if (data.success) {
        setThumbnilPreview(data.imageUrl); // Show preview immediately from our local server
        
        try {
            // Also fetch the blob so we can submit it as a file
            const response = await fetch(data.imageUrl);
            if (response.ok) {
                const blob = await response.blob();
                const file = new File([blob], 'ai-thumbnail.png', { type: 'image/png' });
                setThumbnil(file);
            }
        } catch (fetchErr) {
            console.warn("Failed to fetch blob, will use preview URL:", fetchErr);
        }
        
        message.success({ content: "AI generated a unique cover for you!", key: "ai-img" });
      }
    } catch (error) {
      console.error("AI Image error:", error);
      message.error({ content: "Could not display AI image. Please try again.", key: "ai-img" });
    } finally {
      setLoading(false);
    }
  }

  const handleAITextAction = async (action) => {
    if (!session?.isPremium) return message.error("Premium feature! Please upgrade to use AI Assistant.");
    
    let prompt = "";
    let systemPrompt = "You are a professional blogging assistant.";

    if (action === 'expand') {
        if (!content) return message.warning("Content is empty!");
        prompt = `Expand this blog content while maintaining the style. Return the output as HTML: ${content.slice(0, 800)}`;
        systemPrompt = "You are a professional writer. Expand the content significantly. Return ONLY valid HTML. Do not use <html> or <body> tags.";
    } else if (action === 'seo') {
        if (!title || !content) return message.warning("Enter title and content for SEO analysis!");
        prompt = `Analyze this blog and provide SEO optimizations in JSON format: { "seoTitle": "...", "metaDescription": "...", "tags": ["tag1", "tag2", ...], "seoScore": 85, "suggestions": ["...", "..."] }. 
        Title: ${title}
        Content Snippet: ${content.replace(/<[^>]*>/g, '').slice(0, 800)}`;
        systemPrompt = "You are an SEO expert. Return ONLY a valid JSON object. No extra text.";
    } else if (action === 'rewrite') {
        if (!content) return message.warning("Content is empty!");
        prompt = `Rewrite this blog content to be more professional, engaging and viral. Return the output as HTML: ${content.slice(0, 800)}`;
        systemPrompt = "You are a professional editor. Rewrite the content for maximum impact. Return ONLY valid HTML. Do not use <html> or <body> tags.";
    }

    try {
      setLoading(true);
      message.loading({ content: "Vichaar AI is thinking...", key: "ai-task" });
      const { data } = await API.post('/ai/text', { prompt, systemPrompt });
      if (data.success) {
        if (action === 'seo') {
            try {
                let seoData;
                if (typeof data.text === 'object') {
                    seoData = data.text;
                } else {
                    // Try to clean potential markdown formatting
                    const jsonStr = data.text.replace(/```json|```/g, '').trim();
                    seoData = JSON.parse(jsonStr);
                }
                
                if (seoData.tags) setTags([...new Set([...tags, ...seoData.tags])]);
                if (seoData.metaDescription) setExcerpt(seoData.metaDescription);
                if (seoData.seoTitle) setTitle(seoData.seoTitle);
                
                const scoreMsg = `SEO Grade: ${seoData.seoScore || 0}/100. ${seoData.suggestions?.[0] || 'Optimized!'}`;
                message.success({ content: scoreMsg, key: "ai-task", duration: 5 });
            } catch (e) {
                console.error("SEO JSON Parse Error:", e, data.text);
                const rawText = typeof data.text === 'object' ? JSON.stringify(data.text) : data.text;
                message.info({ content: "SEO Advice: " + rawText.slice(0, 100) + "...", key: "ai-task", duration: 10 });
            }
        } else {
            // Content actions (expand/rewrite)
            setContent(data.text);
            message.success({ content: "Content polished by AI!", key: "ai-task" });
        }
      }
    } catch (error) {
      message.error({ content: error.response?.data?.message || "AI Assistant is busy", key: "ai-task" });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
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

    if (!userId && !sessionLoading) {
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
      formData.append('status', 'pending')
      formData.append('tags', JSON.stringify(tags))
      formData.append('isPremium', isPremium)
      formData.append('seoTitle', title)
      formData.append('seoDescription', excerpt)
      formData.append('aiSummary', excerpt)
      formData.append('readingTime', readingTime)

      if (thumbnil) formData.append('thumbnil', thumbnil)
      images.forEach(img => formData.append('images', img))

      const { data } = await API.post('/blog/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.success) {
        localStorage.removeItem(draftStorageKey)
        setPublished(true)
      }
    } catch (error) {
      console.error("Submission failed:", error)
      alert(error.response?.data?.message || "Failed to submit blog")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!title) {
        message.warning("Add a title to save your draft to the cloud.");
        return;
    }

    try {
        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('slug', title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
        formData.append('content', content);
        formData.append('excerpt', excerpt || "Draft post...");
        formData.append('category', category);
        formData.append('status', 'draft');
        formData.append('tags', JSON.stringify(tags));
        formData.append('isPremium', isPremium);
        formData.append('seoTitle', title);
        formData.append('seoDescription', excerpt || "Draft post...");
        formData.append('aiSummary', excerpt || "Draft post...");
        formData.append('readingTime', readingTime);

        if (thumbnil) formData.append('thumbnil', thumbnil);

        await API.post('/blog/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({ title, content, excerpt, category, tags, isPremium, readingTime }),
        );

        message.success('Draft saved to your workspace.');
    } catch (error) {
        console.error("Draft saving failed:", error);
        message.error("Failed to save draft to cloud.");
    } finally {
        setLoading(false);
    }
  }

  if (published) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfe]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12 max-w-md">
          <div className="text-8xl mb-6">📡</div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Post Submitted!</h2>
          <p className="text-gray-500 mb-8">Your masterpiece has been sent to our editors for review. You'll receive an email once it's approved.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary justify-center">Go to Dashboard</button>
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
            <button 
                onClick={handleSaveDraft} 
                disabled={loading}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary-600 transition-all border-none bg-transparent cursor-pointer disabled:opacity-50" 
                type="button"
            >
              <SaveOutlined /> {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary text-xs px-6 py-2.5 shadow-xl shadow-primary-500/20"
            >
              {loading ? 'Submitting...' : <><SendOutlined /> Submit for Review</>}
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
                <div className="relative w-full h-full">
                    <img src={thumbnilPreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <PictureOutlined className="text-white text-3xl" />
                    </div>
                </div>
              ) : (
                <>
                  <PictureOutlined className="text-4xl text-purple-200 mb-2" />
                  <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Upload Thumbnail</p>
                </>
              )}
              <input type="file" onChange={handleThumbnilChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
              {session?.isPremium && (
                <button 
                    onClick={(e) => { e.stopPropagation(); handleAIGenerateImage(); }}
                    className="absolute bottom-4 right-4 z-20 px-4 py-2 bg-white/90 backdrop-blur shadow-xl rounded-xl text-[9px] font-black text-primary-600 border-none cursor-pointer flex items-center gap-2 hover:bg-primary-600 hover:text-white transition-all"
                >
                    <RobotOutlined /> AI GENERATE
                </button>
              )}
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
                <label className="text-xs font-bold text-gray-900 block mb-2">Estimated Reading Time (min)</label>
                <input
                  type="number"
                  value={readingTime}
                  onChange={e => setReadingTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 border-none text-xs font-bold text-gray-600 outline-none"
                  min="1"
                />
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
          <div className={`relative bg-gradient-to-br from-primary-600 to-purple-700 rounded-[32px] p-6 text-white shadow-xl overflow-hidden group ${!session?.isPremium ? 'grayscale' : ''}`}>
            {!session?.isPremium && (
                <div className="absolute inset-0 z-20 bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <RobotOutlined className="text-4xl mb-4" />
                    <h5 className="text-sm font-black mb-2 uppercase tracking-tight">AI Assistant is Pro</h5>
                    <Link to="/pricing" className="text-[10px] font-black text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl no-underline shadow-lg transition-all">
                        Upgrade Now
                    </Link>
                </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black flex items-center gap-2">
                <RobotOutlined /> AI ASSISTANT
              </h4>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed mb-4">I can help you expand your ideas, fix grammar, or optimize this post for SEO.</p>
            <div className="space-y-2">
                <button onClick={() => handleAITextAction('rewrite')} className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold border-none text-white cursor-pointer transition-all flex items-center justify-center gap-2" type="button">
                    <EditOutlined /> Rewrite with Style
                </button>
                <button onClick={() => handleAITextAction('expand')} className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold border-none text-white cursor-pointer transition-all flex items-center justify-center gap-2" type="button">
                    <PlusOutlined /> Expand Content
                </button>
                <button onClick={() => handleAITextAction('seo')} className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold border-none text-white cursor-pointer transition-all flex items-center justify-center gap-2" type="button">
                    <TagsOutlined /> SEO Audit
                </button>
                <button onClick={handleGenerateSummary} className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-[10px] font-bold border-none text-white cursor-pointer transition-all flex items-center justify-center gap-2" type="button">
                    <ThunderboltOutlined /> Generate AI Summary
                </button>
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
