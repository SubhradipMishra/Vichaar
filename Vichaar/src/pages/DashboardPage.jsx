import { useContext, useEffect, useRef, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei'
import gsap from 'gsap'
import { 
  UserOutlined, 
  MailOutlined, 
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
  MenuUnfoldOutlined
} from '@ant-design/icons'
import Context from '../util/context'
import API from '../api/api'

// --- Three.js Background Component ---
function AnimatedBackground() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <group>
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} ref={meshRef}>
          <MeshDistortMaterial
            color="#6241fe"
            speed={2}
            distort={0.4}
            radius={1}
            opacity={0.05}
            transparent
          />
        </Sphere>
      </Float>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </group>
  )
}

export default function DashboardPage() {
  const { session, setSession, sessionLoading } = useContext(Context)
  const navigate = useNavigate()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  const containerRef = useRef(null)
  const sidebarRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate('/login')
    }
  }, [session, sessionLoading, navigate])

  // GSAP Entry Animations
  useEffect(() => {
    if (session && !sessionLoading) {
      const ctx = gsap.context(() => {
        gsap.from('.stagger-item', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power4.out',
          delay: 0.2
        })
        gsap.from('.sidebar-link', {
          x: -50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'back.out(1.7)',
          delay: 0.1
        })
      }, containerRef)
      return () => ctx.revert()
    }
  }, [session, sessionLoading])

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout')
      setSession(null)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const sidebarLinks = [
    { id: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
    { id: 'posts', icon: <FileTextOutlined />, label: 'My Posts' },
    { id: 'audience', icon: <TeamOutlined />, label: 'Audience' },
    { id: 'bookmarks', icon: <BookOutlined />, label: 'Bookmarks' },
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-gray-300 flex overflow-hidden">
      
      {/* Three.js Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <Suspense fallback={null}>
            <AnimatedBackground />
          </Suspense>
        </Canvas>
      </div>

      {/* --- SIDEBAR --- */}
      <motion.aside 
        ref={sidebarRef}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        className="relative z-20 h-screen bg-[#11111a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out"
      >
        {/* Logo Section */}
        <div className="p-6 mb-8 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-black text-white">V</div>
                <span className="text-xl font-black text-white tracking-tighter">VICHAAR</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border-none cursor-pointer text-gray-400"
          >
            {isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`sidebar-link w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all border-none bg-transparent cursor-pointer group ${
                activeTab === link.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              {isSidebarOpen && <span className="font-bold text-sm">{link.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Quick Info */}
        <div className="p-4 mt-auto border-t border-white/5">
          <div className={`flex items-center gap-4 p-3 rounded-2xl bg-white/5 transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-500 flex-shrink-0 flex items-center justify-center text-sm font-black text-white">
              {session.name?.[0].toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate capitalize">{session.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{session.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full mt-2 flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border-none bg-transparent cursor-pointer ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogoutOutlined className="text-lg" />
            {isSidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main ref={contentRef} className="flex-1 h-screen overflow-y-auto p-8 relative z-10 scroll-smooth">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between mb-12 stagger-item">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome back, <span className="text-primary-500 capitalize">{session.name.split(' ')[0]}</span> 👋</h2>
            <p className="text-gray-500 mt-1 font-medium">Here's what's happening with your Vichaar space today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search anything..." className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-primary-500 w-64 transition-all" />
              <SearchOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-xl cursor-pointer">
              <BellOutlined />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Stats Section */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Published Posts', value: '24', change: '+3 this week', icon: <BookOutlined />, color: '#6241fe' },
              { label: 'Total Views', value: '4,821', change: '+12% increase', icon: <HeartOutlined />, color: '#ec4899' },
              { label: 'Avg. Read Time', value: '4m 12s', change: 'Stable', icon: <EditOutlined />, color: '#8b5cf6' },
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="stagger-item bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-2xl shadow-lg" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 text-primary-400">{stat.change}</span>
                </div>
              </motion.div>
            ))}

            {/* Large Activity Chart Placeholder */}
            <div className="md:col-span-3 stagger-item bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Performance Overview</h3>
                <select className="bg-white/5 border border-white/10 text-xs font-bold text-gray-400 rounded-xl px-4 py-2 outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-64 w-full flex items-end gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 50, 75, 60, 85].map((h, i) => (
                  <motion.div 
                    key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.05, duration: 1 }}
                    className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400/20 rounded-t-lg relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h * 12} views
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 px-2 uppercase tracking-widest">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Right Section: Profile & Quick Actions */}
          <div className="space-y-8">
            <div className="stagger-item bg-gradient-to-br from-primary-600 to-purple-700 p-8 rounded-[40px] shadow-2xl shadow-primary-600/20 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black text-white mb-6">
                {session.name?.[0].toUpperCase()}
              </div>
              <h3 className="text-2xl font-black text-white leading-tight">Your writing is making an impact, {session.name.split(' ')[0]}!</h3>
              <p className="text-white/70 text-sm mt-3">You've reached <span className="text-white font-bold">1.2k readers</span> this month. Keep up the momentum!</p>
              <Link to="/write" className="mt-8 w-full py-4 bg-white text-primary-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform no-underline">
                <EditOutlined /> Write New Blog
              </Link>
            </div>

            <div className="stagger-item bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px]">
              <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  { user: 'Sarah K.', action: 'liked your post', time: '2m ago' },
                  { user: 'TechDaily', action: 'started following you', time: '1h ago' },
                  { user: 'Alex Chen', action: 'commented on "AI Trends"', time: '3h ago' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                      {act.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 font-bold truncate"><span className="text-white">{act.user}</span> {act.action}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
