import { useContext, useEffect, useRef, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei'
import gsap from 'gsap'
import {
  LogoutOutlined,
  EditOutlined,
  BookOutlined,
  HeartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EyeOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import Context from '../util/context'
import API from '../api/api'
import { REPO_URL, SOCIAL_LINKS, SUPPORT_EMAIL } from '../util/site'

const API_BASE = 'http://localhost:7070'

function AnimatedBackground() {
  const meshRef = useRef()


  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.05
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08
    }
  })

  return (
    <group>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[1.5, 64, 64]} ref={meshRef}>
          <MeshDistortMaterial
            color="#6241fe"
            speed={1}
            distort={0.2}
            radius={1}
            opacity={0.02}
            transparent
          />
        </Sphere>
      </Float>
      <ambientLight intensity={2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#6241fe" />
    </group>
  )
}

function SidebarContent({
  activeTab,
  isExpanded,
  session,
  onSelectTab,
  onSettings,
  onHelp,
  onLogout,
  onToggle,
  onOpenExternal,
  navigate,
}) {
  const sidebarLinks = [
    { id: 'overview', icon: <DashboardOutlined />, label: 'Overview', shortcut: 'Ctrl+O' },
    { id: 'posts', icon: <FileTextOutlined />, label: 'My Posts', shortcut: 'Ctrl+P' },
    { id: 'audience', icon: <TeamOutlined />, label: 'Audience', shortcut: 'Ctrl+A' },
    { id: 'bookmarks', icon: <BookOutlined />, label: 'Bookmarks', shortcut: 'Ctrl+B' },
  ]

  if (session?.role === 'admin') {
    sidebarLinks.push({ id: 'admin', icon: <SettingOutlined />, label: 'Admin Review', shortcut: 'Ctrl+R' })
  }

  return (
    <>
      <div className="p-5 mb-4 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-2xl bg-primary-600 flex items-center justify-center font-black text-white shadow-lg shadow-primary-600/20">
                <EditOutlined className="text-white text-lg" />
              </div>
              <span className="text-lg font-black text-gray-900 tracking-tight">VICHAAR</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border-none cursor-pointer text-gray-500"
          type="button"
        >
          {isExpanded ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </button>
      </div>

      <div className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {sidebarLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => {
              if (link.id === 'admin') {
                navigate('/admin')
              } else {
                onSelectTab(link.id)
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-none bg-transparent cursor-pointer group ${
              activeTab === link.id
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
            type="button"
          >
            <span className={`text-lg transition-colors ${activeTab === link.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-900'}`}>
              {link.icon}
            </span>
            {isExpanded && (
              <div className="flex-1 flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight">{link.label}</span>
                <span className="text-[10px] text-gray-300 font-medium">{link.shortcut}</span>
              </div>
            )}
          </button>
        ))}

        <div className="my-4 h-px bg-gray-50 mx-4" />

        <button
          onClick={onSettings}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-none bg-transparent cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
          type="button"
        >
          <SettingOutlined className={`text-lg ${activeTab === 'settings' ? 'text-primary-600' : 'text-gray-400'}`} />
          {isExpanded && <span className="font-bold text-sm">Settings</span>}
        </button>

        <button
          onClick={onHelp}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-none bg-transparent cursor-pointer ${
            activeTab === 'help'
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
          type="button"
        >
          <QuestionCircleOutlined className={`text-lg ${activeTab === 'help' ? 'text-primary-600' : 'text-gray-400'}`} />
          {isExpanded && <span className="font-bold text-sm">Help Center</span>}
        </button>

        {isExpanded && !session.isPremium && (
          <div className="mt-6 mx-3 p-5 rounded-[24px] bg-gradient-to-br from-gray-900 to-gray-800 border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                <ThunderboltOutlined className="text-indigo-400" />
              </div>
              <h4 className="text-sm font-black text-white tracking-tight">Upgrade to Pro</h4>
              <p className="text-[10px] text-gray-400 font-medium mt-1 mb-4 leading-relaxed">
                Unlock AI assistance, premium blogs, and smart analytics.
              </p>
              <Link 
                to="/pricing" 
                className="block w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black rounded-xl text-center transition-all no-underline shadow-lg shadow-indigo-500/20"
              >
                Go Premium
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        )}

        {isExpanded && session.isPremium && (
          <div className="mt-6 mx-3 p-4 rounded-[24px] bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <ThunderboltOutlined className="text-white text-xs" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Premium Member</p>
              <p className="text-[9px] text-indigo-400 font-bold truncate">Pro features active</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 pb-4 space-y-1">
        <div className="my-4 h-px bg-gray-50 mx-4" />
        <button
          onClick={() => onOpenExternal(REPO_URL)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all border-none bg-transparent cursor-pointer"
          type="button"
        >
          <GithubOutlined className="text-lg" />
          {isExpanded && <span className="font-bold text-sm">GitHub</span>}
        </button>
        <button
          onClick={() => onOpenExternal(SOCIAL_LINKS.discord)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all border-none bg-transparent cursor-pointer"
          type="button"
        >
          <MessageOutlined className="text-lg" />
          {isExpanded && <span className="font-bold text-sm">Discord</span>}
        </button>

        <div className={`mt-4 p-3 rounded-2xl bg-gray-50 flex items-center gap-3 border border-gray-100 ${!isExpanded ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex-shrink-0 flex items-center justify-center text-sm font-black text-white overflow-hidden shadow-sm">
            {session.profileImage ? (
              <img src={`${API_BASE}${session.profileImage}`} alt={session.name} className="w-full h-full object-cover" />
            ) : (
              session.name?.[0]?.toUpperCase() || 'V'
            )}
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate capitalize">{session.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{session.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border-none bg-transparent cursor-pointer ${!isExpanded ? 'justify-center' : ''}`}
          type="button"
        >
          <LogoutOutlined className="text-lg" />
          {isExpanded && <span className="text-sm font-bold">Sign Out</span>}
        </button>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const { session, setSession, sessionLoading } = useContext(Context)
  const navigate = useNavigate()

  const [isDesktop, setIsDesktop] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [activity, setActivity] = useState([])
  const [adminQueue, setAdminQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [savedBlogs, setSavedBlogs] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)

  const containerRef = useRef(null)
  const updatesRef = useRef(null)

  const fetchSavedBlogs = async () => {
    try {
      setSavedLoading(true)
      const { data } = await API.get('/blog/user/saved')
      if (data.success) {
        setSavedBlogs(data.blogs)
      }
    } catch (error) {
      console.error("Error fetching saved blogs:", error)
    } finally {
      setSavedLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'bookmarks') {
      fetchSavedBlogs()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/blog/user/stats')
      if (data.success) {
        setStats(data.stats)
        setBlogs(data.blogs)
        setActivity(data.recentActivity)
      }
      
      if (session?.role === 'admin') {
        const adminData = await API.get('/blog/admin/queue')
        if (adminData.data.success) {
            setAdminQueue(adminData.data.blogs)
        }
      }
      
      const notifData = await API.get('/notifications')
      if (notifData.data.success) {
        setNotifications(notifData.data.notifications)
        setUnreadCount(notifData.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminAction = async (blogId, status) => {
    let feedback = '';
    if (status === 'rejected') {
        feedback = window.prompt("Please provide feedback for rejection:");
        if (feedback === null) return; // Cancelled
    }

    try {
        setLoading(true);
        const { data } = await API.patch(`/blog/${blogId}/status`, { status, feedback });
        if (data.success) {
            message.success(`Post ${status} successfully`);
            setAdminQueue(prev => prev.filter(b => b._id !== blogId));
            fetchDashboardData();
        }
    } catch (error) {
        message.error("Failed to update post status");
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate('/login')
    } else if (session) {
      fetchDashboardData()
    }
  }, [session, sessionLoading, navigate])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const syncLayout = () => {
      setIsDesktop(mediaQuery.matches)
      setSidebarOpen(mediaQuery.matches)
    }

    syncLayout()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncLayout)
      return () => mediaQuery.removeEventListener('change', syncLayout)
    }

    mediaQuery.addListener(syncLayout)
    return () => mediaQuery.removeListener(syncLayout)
  }, [])

  useEffect(() => {
    if (session && !sessionLoading) {
      const ctx = gsap.context(() => {
        gsap.from('.stagger-item', {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.1,
        })
      }, containerRef)

      return () => ctx.revert()
    }
  }, [session, sessionLoading, activeTab, loading])

  const filteredBlogs = blogs.filter((blog) => blog.title?.toLowerCase().includes(search.toLowerCase()))
  const sortedByViews = [...filteredBlogs].sort((first, second) => (second.views || 0) - (first.views || 0))
  const topPost = sortedByViews[0]

  const categoryBreakdown = filteredBlogs.reduce((acc, blog) => {
    const key = blog.category || 'Uncategorized'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const topCategoryEntry = Object.entries(categoryBreakdown).sort((first, second) => second[1] - first[1])[0]
  const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'No category yet'
  const averageViews = filteredBlogs.length ? Math.round(filteredBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0) / filteredBlogs.length) : 0
  const averageLikes = filteredBlogs.length ? Math.round(filteredBlogs.reduce((sum, blog) => sum + (blog.likes || 0), 0) / filteredBlogs.length) : 0

  const closeMobileSidebar = () => {
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }

  const handleSelectTab = (tab) => {
    setActiveTab(tab)
    closeMobileSidebar()
  }

  const handleOpenExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout')
      setSession(null)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      const { data } = await API.delete(`/blog/delete/${id}`)

      if (data.success) {
        const deletedPost = blogs.find((blog) => blog._id === id)

        setBlogs((currentBlogs) => currentBlogs.filter((blog) => blog._id !== id))
        setActivity((currentActivity) => currentActivity.filter((item) => item.id !== id))
        setStats((currentStats) => {
          if (!currentStats || !deletedPost) return currentStats

          return {
            ...currentStats,
            totalPosts: Math.max(0, (currentStats.totalPosts || 0) - 1),
            totalViews: Math.max(0, (currentStats.totalViews || 0) - (deletedPost.views || 0)),
            totalLikes: Math.max(0, (currentStats.totalLikes || 0) - (deletedPost.likes || 0)),
          }
        })
      }
    } catch (error) {
      window.alert('Failed to delete post')
    }
  }

  const handleNotificationsClick = async () => {
    setActiveTab('overview')
    closeMobileSidebar()

    window.requestAnimationFrame(() => {
      updatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    if (unreadCount > 0) {
      try {
        await API.patch('/notifications/all/read')
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      } catch (err) {
        console.error("Error marking as read", err)
      }
    }
  }

  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfe]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fcfcfe] text-gray-700 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <Suspense fallback={null}>
            <AnimatedBackground />
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {!isDesktop && isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-gray-950/30 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="fixed inset-y-3 left-3 z-40 w-[min(280px,calc(100vw-24px))] bg-white border border-gray-100 rounded-[28px] flex flex-col shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            >
              <SidebarContent
                activeTab={activeTab}
                isExpanded={true}
                session={session}
                onSelectTab={handleSelectTab}
                onSettings={() => handleSelectTab('settings')}
                onHelp={() => handleSelectTab('help')}
                onLogout={handleLogout}
                onToggle={() => setSidebarOpen(false)}
                onOpenExternal={handleOpenExternal}
                navigate={navigate}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen lg:h-screen lg:flex lg:overflow-hidden">
        {isDesktop && (
          <motion.aside
            animate={{ width: isSidebarOpen ? 280 : 80 }}
            className="relative z-20 h-[calc(100vh-32px)] m-4 bg-white border border-gray-100 rounded-[28px] flex flex-col transition-all duration-500 ease-in-out shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <SidebarContent
              activeTab={activeTab}
              isExpanded={isSidebarOpen}
              session={session}
              onSelectTab={handleSelectTab}
              onSettings={() => setActiveTab('settings')}
              onHelp={() => setActiveTab('help')}
              onLogout={handleLogout}
              onToggle={() => setSidebarOpen((open) => !open)}
              onOpenExternal={handleOpenExternal}
              navigate={navigate}
            />
          </motion.aside>
        )}

        <main className="flex-1 min-h-screen lg:h-screen overflow-y-visible lg:overflow-y-auto p-4 sm:p-6 lg:p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="lg:hidden flex items-center justify-between gap-3 mb-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 shadow-sm"
                type="button"
              >
                <MenuUnfoldOutlined />
                Workspace
              </button>
              <Link to="/write" className="btn-primary no-underline text-[11px] px-5 py-3 flex items-center gap-2">
                <PlusOutlined />
                New Post
              </Link>
            </div>

            <header className="flex flex-col xl:flex-row xl:items-end justify-between mb-10 stagger-item gap-4">
              <div>
                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-widest border border-primary-100">
                  Live Workspace
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter mt-3 leading-none">
                  Welcome back, {session.name?.split(' ')[0] || 'Creator'}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">
                <div className="relative group flex-1 xl:w-64">
                  <input
                    type="text"
                    placeholder="Find anything..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-sm hover:border-gray-200"
                  />
                  <SearchOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
                <button
                  onClick={handleNotificationsClick}
                  className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-lg cursor-pointer shadow-sm text-gray-400 relative"
                  type="button"
                >
                  <BellOutlined />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <Link to="/write" className="hidden lg:inline-flex btn-primary no-underline text-[11px] px-6 py-3.5 items-center gap-2">
                  <PlusOutlined />
                  New Post
                </Link>
              </div>
            </header>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
                <div className="2xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[
                    { label: 'Published', value: stats?.totalPosts || 0, icon: <BookOutlined />, color: '#6241fe' },
                    { label: 'Views', value: stats?.totalViews || 0, icon: <EyeOutlined />, color: '#a855f7' },
                    { label: 'Likes', value: stats?.totalLikes || 0, icon: <HeartOutlined />, color: '#ec4899' },
                  ].map((stat) => (
                    <div key={stat.label} className="stagger-item bg-white border border-gray-100 p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-primary-100 transition-all group">
                      <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
                        {stat.icon}
                      </div>
                      <p className="text-3xl font-black text-gray-900 mb-1 tracking-tighter">{stat.value}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}

                  <div className="sm:col-span-2 xl:col-span-3 stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Engagement Pulse</h3>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time</span>
                      </div>
                    </div>
                    <div className="h-56 w-full flex items-end gap-2.5 px-1 overflow-x-auto no-scrollbar">
                      {(stats?.chartData || [40, 70, 45, 90, 65, 80, 50, 75, 60, 85]).map((height, index) => (
                        <motion.div
                          key={`${height}-${index}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.1 + index * 0.03, duration: 0.8 }}
                          className="min-w-[22px] flex-1 bg-primary-100 rounded-full relative group hover:bg-primary-600 transition-colors"
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                            {height * 12}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="stagger-item bg-gray-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white leading-tight">Ready to share your next idea?</h3>
                      <p className="text-gray-400 text-xs mt-3 font-medium">Jump back into writing and publish your next story from the same workspace.</p>
                      <Link to="/write" className="mt-8 w-full py-3.5 bg-white text-gray-900 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all no-underline text-xs">
                        <EditOutlined />
                        Start Writing
                      </Link>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl" />
                  </div>

                  <div ref={updatesRef} className="stagger-item bg-white border border-gray-100 p-7 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <h3 className="text-sm font-black text-gray-900 mb-6 tracking-tight flex items-center gap-2">
                      <ThunderboltOutlined className="text-primary-600" />
                      Notifications
                    </h3>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                      {notifications.length > 0 ? notifications.map((item, index) => (
                        <button
                          key={`${item._id}-${index}`}
                          onClick={() => item.blog?._id && navigate(`/blog/${item.blog._id}`)}
                          className={`w-full flex items-start gap-4 group cursor-pointer border-none bg-transparent text-left p-3 rounded-2xl transition-all duration-300 hover:bg-gray-50/80 ${!item.isRead ? 'bg-primary-50/40' : ''}`}
                          type="button"
                        >
                          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-base transition-transform group-hover:scale-110 shadow-sm ${
                            item.type === 'like' ? 'bg-pink-50 text-pink-600' :
                            item.type === 'dislike' ? 'bg-orange-50 text-orange-600' :
                            item.type === 'comment' || item.type === 'reply' ? 'bg-blue-50 text-blue-600' :
                            item.type === 'status_update' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {item.type === 'like' ? <HeartOutlined /> : 
                             item.type === 'dislike' ? <ThunderboltOutlined /> : 
                             item.type === 'comment' || item.type === 'reply' ? <MessageOutlined /> : 
                             item.type === 'status_update' ? <ThunderboltOutlined /> :
                             <BellOutlined />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                  {item.type.replace('_', ' ')}
                                </span>
                                {!item.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />}
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-900 font-bold leading-relaxed line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {item.content}
                            </p>
                          </div>
                        </button>
                      )) : (
                        <div className="text-center py-6">
                          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">My Content</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">Manage and track your universe</p>
                  </div>
                  <div className="text-[10px] font-black bg-gray-50 text-gray-500 border border-gray-100 px-4 py-2 rounded-xl uppercase tracking-widest w-fit">
                    {filteredBlogs.length} Articles
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBlogs.length > 0 ? filteredBlogs.map((post) => (
                      <motion.div
                        key={post._id}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate(`/blog/${post._id}`)}
                        className="p-4 rounded-[24px] bg-white border border-gray-50 flex flex-col sm:flex-row sm:items-center gap-5 group hover:border-gray-200 transition-all cursor-pointer"
                      >
                        <div className="w-full sm:w-20 h-48 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50">
                          <img src={`${API_BASE}${post.thumbnil}`} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[8px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{post.category}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                post.status === 'published' ? 'bg-green-50 text-green-600' :
                                post.status === 'pending' ? 'bg-purple-50 text-purple-600' :
                                post.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                'bg-gray-50 text-gray-400'
                            }`}>
                                {post.status}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-gray-900 truncate tracking-tight group-hover:text-primary-600 transition-colors">{post.title}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1.5"><EyeOutlined /> {post.views || 0}</span>
                            <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1.5"><HeartOutlined /> {post.likes || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              navigate(`/blog/${post._id}`)
                            }}
                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all border-none cursor-pointer"
                            type="button"
                          >
                            <ArrowRightOutlined />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeletePost(post._id)
                            }}
                            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                            type="button"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-20 bg-gray-50/30 rounded-[32px] border border-dashed border-gray-100">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Nothing here yet</p>
                        <Link to="/write" className="btn-primary no-underline text-xs">Create your first story</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'audience' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: 'Average Views', value: averageViews, icon: <EyeOutlined />, color: '#6241fe' },
                    { label: 'Average Likes', value: averageLikes, icon: <HeartOutlined />, color: '#ec4899' },
                    { label: 'Top Topic', value: topCategory, icon: <FireOutlined />, color: '#f97316' },
                  ].map((item) => (
                    <div key={item.label} className="stagger-item bg-white border border-gray-100 p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                      <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-lg" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                        {item.icon}
                      </div>
                      <p className="text-2xl font-black text-gray-900 mb-1 tracking-tight break-words">{item.value}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Top Performing Posts</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">Your strongest audience signals based on current traffic.</p>
                    </div>
                    <Link to="/blog" className="btn-secondary no-underline text-xs justify-center">Explore Public Feed</Link>
                  </div>

                  <div className="space-y-4">
                    {sortedByViews.length > 0 ? sortedByViews.slice(0, 5).map((post) => (
                      <div key={post._id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-[24px] bg-gray-50/60 border border-gray-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">{post.category}</p>
                          <h4 className="text-base font-black text-gray-900 truncate">{post.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><EyeOutlined /> {post.views || 0}</span>
                          <span className="flex items-center gap-1.5"><HeartOutlined /> {post.likes || 0}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/blog/${post._id}`)}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-700 hover:text-primary-600 hover:border-primary-200 transition-all"
                          type="button"
                        >
                          Open
                        </button>
                      </div>
                    )) : (
                      <div className="text-center py-16 bg-gray-50/50 rounded-[28px] border border-dashed border-gray-100">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Audience insights appear after you publish</p>
                        <Link to="/write" className="btn-primary no-underline text-xs">Publish a post</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-6">
                <div className="stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Bookmarks</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">Saved reading will show up here as the reading experience grows.</p>
                    </div>
                    <Link to="/blog" className="btn-secondary no-underline text-xs justify-center">Browse articles</Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-8">
                    {savedLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
                      </div>
                    ) : savedBlogs.length > 0 ? (
                      savedBlogs.map(post => (
                        <div key={post._id} className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[32px] bg-gray-50/60 border border-gray-100 group hover:border-primary-100 transition-all">
                          <div className="w-full md:w-40 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                             {post.thumbnil ? (
                               <img src={`${API_BASE}${post.thumbnil}`} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-2xl">✨</div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md">{post.category}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><ClockCircleOutlined /> {post.readingTime || 5} min</span>
                            </div>
                            <h4 className="text-xl font-black text-gray-900 truncate tracking-tight">{post.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-medium">by {post.author?.name || 'Vichaar Writer'}</p>
                          </div>
                          <div className="flex items-center gap-3 md:ml-auto">
                            <button 
                              onClick={() => navigate(`/blog/${post._id}`)}
                              className="h-12 px-8 rounded-2xl bg-primary-600 text-white text-xs font-black hover:bg-primary-700 transition-all border-none cursor-pointer shadow-lg shadow-primary-600/20"
                            >
                              Read Now
                            </button>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const { data } = await API.post(`/blog/${post._id}/save`);
                                  if (data.success) {
                                    message.success("Removed from bookmarks");
                                    setSavedBlogs(prev => prev.filter(b => b._id !== post._id));
                                    // Update context as well
                                    if (session) {
                                      const updated = session.savedPosts.filter(id => id !== post._id);
                                      setSession({ ...session, savedPosts: updated });
                                    }
                                  }
                                } catch (err) {
                                  message.error("Action failed");
                                }
                              }}
                              className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center cursor-pointer"
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => navigate('/blog')} className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                          <BookOutlined className="text-primary-600 text-xl mb-4" />
                          <h4 className="text-lg font-black text-gray-900 mb-2">Explore the public feed</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">Find stories to read while bookmarks are still empty.</p>
                        </button>

                        <button onClick={() => navigate('/write')} className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                          <EditOutlined className="text-primary-600 text-xl mb-4" />
                          <h4 className="text-lg font-black text-gray-900 mb-2">Start your next draft</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">Use this space as a quick launch point back into writing.</p>
                        </button>

                        <button onClick={() => setActiveTab('overview')} className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                          <DashboardOutlined className="text-primary-600 text-xl mb-4" />
                          <h4 className="text-lg font-black text-gray-900 mb-2">Return to overview</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">Jump back to your latest stats, updates, and post performance.</p>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {topPost && (
                  <div className="stagger-item bg-gray-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                      <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest mb-3">Currently trending in your workspace</p>
                      <h3 className="text-2xl font-black text-white leading-tight">{topPost.title}</h3>
                      <p className="text-gray-400 text-sm mt-3">This is your most viewed article right now. Revisit it, refresh it, or share it again.</p>
                      <button onClick={() => navigate(`/blog/${topPost._id}`)} className="mt-6 px-5 py-3 rounded-xl bg-white text-gray-900 text-xs font-black border-none cursor-pointer" type="button">
                        Open post
                      </button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin' && session?.role === 'admin' && (
              <div className="stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Review Queue</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">Pending approval for public distribution</p>
                  </div>
                  <div className="text-[10px] font-black bg-purple-50 text-purple-600 border border-purple-100 px-4 py-2 rounded-xl uppercase tracking-widest w-fit">
                    {adminQueue.length} Pending
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminQueue.length > 0 ? adminQueue.map((post) => (
                      <div key={post._id} className="p-5 rounded-[28px] bg-white border border-gray-50 flex flex-col lg:flex-row lg:items-center gap-6 group hover:border-primary-100 transition-all shadow-sm">
                        <div className="w-full lg:w-32 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50">
                          <img src={`${API_BASE}${post.thumbnil}`} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                {post.author?.profileImage ? (
                                    <img src={`${API_BASE}${post.author.profileImage}`} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400">{post.author?.name?.[0]}</span>
                                )}
                             </div>
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{post.author?.name}</span>
                             <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{post.category}</span>
                          </div>
                          <h4 className="text-lg font-black text-gray-900 truncate tracking-tight">{post.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{post.excerpt}</p>
                        </div>

                        <div className="flex items-center gap-2 lg:ml-auto">
                          <button 
                            onClick={() => window.open(`/blog/${post._id}`, '_blank')}
                            className="h-11 px-5 rounded-2xl bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-all border-none cursor-pointer flex items-center gap-2"
                          >
                            <EyeOutlined /> Preview
                          </button>
                          <button 
                            onClick={() => handleAdminAction(post._id, 'rejected')}
                            className="h-11 px-5 rounded-2xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleAdminAction(post._id, 'published')}
                            className="h-11 px-7 rounded-2xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-all border-none cursor-pointer shadow-lg shadow-primary-600/20"
                          >
                            Approve & Publish
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-24 bg-gray-50/30 rounded-[40px] border border-dashed border-gray-100">
                        <div className="text-5xl mb-4">✨</div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Queue is clear!</p>
                        <p className="text-xs text-gray-300 mt-1">No posts are currently waiting for review.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-lg font-black text-white overflow-hidden">
                      {session.profileImage ? (
                        <img src={`${API_BASE}${session.profileImage}`} alt={session.name} className="w-full h-full object-cover" />
                      ) : (
                        session.name?.[0]?.toUpperCase() || 'V'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter capitalize">{session.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{session.email}</p>
                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2">{session.role || 'writer'} account</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => navigate('/write')} className="p-5 rounded-[24px] border border-gray-100 bg-gray-50 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                      <EditOutlined className="text-primary-600 text-lg mb-3" />
                      <h4 className="text-base font-black text-gray-900 mb-2">Continue writing</h4>
                      <p className="text-sm text-gray-500">Open the editor and keep building your next story.</p>
                    </button>

                    <button onClick={() => navigate('/blog')} className="p-5 rounded-[24px] border border-gray-100 bg-gray-50 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                      <FileTextOutlined className="text-primary-600 text-lg mb-3" />
                      <h4 className="text-base font-black text-gray-900 mb-2">View public posts</h4>
                      <p className="text-sm text-gray-500">Check how your writing sits alongside the rest of the feed.</p>
                    </button>

                    <button onClick={() => handleOpenExternal(`mailto:${SUPPORT_EMAIL}?subject=Account%20Support`)} className="p-5 rounded-[24px] border border-gray-100 bg-gray-50 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                      <QuestionCircleOutlined className="text-primary-600 text-lg mb-3" />
                      <h4 className="text-base font-black text-gray-900 mb-2">Contact support</h4>
                      <p className="text-sm text-gray-500">Open your mail app with an account support request ready to send.</p>
                    </button>

                    <button onClick={handleLogout} className="p-5 rounded-[24px] border border-red-100 bg-red-50/60 text-left hover:bg-red-50 transition-all" type="button">
                      <LogoutOutlined className="text-red-500 text-lg mb-3" />
                      <h4 className="text-base font-black text-red-600 mb-2">Sign out safely</h4>
                      <p className="text-sm text-red-400">End this session and return to the landing page.</p>
                    </button>
                  </div>
                </div>

                <div className="stagger-item bg-gray-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest mb-3">Workspace status</p>
                    <h3 className="text-2xl font-black text-white leading-tight">Everything important is one click away.</h3>
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed">This panel now routes every settings-style action to a real destination instead of leaving placeholder controls behind.</p>
                  </div>
                  <div className="mt-8 relative z-10 space-y-3">
                    {[
                      `Posts in workspace: ${stats?.totalPosts || 0}`,
                      `Recent activity items: ${activity.length}`,
                      `Filtered stories in view: ${filteredBlogs.length}`,
                    ].map((line) => (
                      <div key={line} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-200">
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl" />
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="space-y-6">
                <div className="stagger-item bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Help Center</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">Jump to support, source code, and community entry points from one place.</p>
                    </div>
                    <button onClick={() => handleOpenExternal(`mailto:${SUPPORT_EMAIL}?subject=Help%20with%20Vichaar`)} className="btn-primary text-xs px-5 py-3 border-none" type="button">
                      <MessageOutlined />
                      Email support
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleOpenExternal(REPO_URL)} className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                      <GithubOutlined className="text-primary-600 text-xl mb-4" />
                      <h4 className="text-lg font-black text-gray-900 mb-2">Open GitHub</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Jump to the project repository for issues, code, and updates.</p>
                    </button>

                    <button onClick={() => handleOpenExternal(SOCIAL_LINKS.discord)} className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                      <MessageOutlined className="text-primary-600 text-xl mb-4" />
                      <h4 className="text-lg font-black text-gray-900 mb-2">Open Discord</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Head to Discord for live conversation and community support.</p>
                    </button>

                    <button onClick={() => navigate('/blog')} className="p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50/40 transition-all" type="button">
                      <BookOutlined className="text-primary-600 text-xl mb-4" />
                      <h4 className="text-lg font-black text-gray-900 mb-2">Visit the blog</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">Review published content while you troubleshoot or gather inspiration.</p>
                    </button>
                  </div>
                </div>

                <div className="stagger-item bg-gray-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest mb-3">Quick guidance</p>
                    <h3 className="text-2xl font-black text-white leading-tight">Need a fast path?</h3>
                    <p className="text-gray-400 text-sm mt-3">Use GitHub for code issues, email for account or support questions, and the blog for content-side checks. Every card above now opens a real destination.</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
