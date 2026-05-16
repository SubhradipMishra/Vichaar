import { useContext, useEffect, useRef, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei'
import {
  LogoutOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons'
import { message } from 'antd'
import Context from '../util/context'
import API from '../api/api'

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
          <MeshDistortMaterial color="#6241fe" speed={1} distort={0.2} radius={1} opacity={0.02} transparent />
        </Sphere>
      </Float>
      <ambientLight intensity={2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#6241fe" />
    </group>
  )
}

export default function AdminDashboardPage() {
  const { session, setSession, sessionLoading } = useContext(Context)
  const navigate = useNavigate()

  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('review')
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!sessionLoading) {
      if (!session) navigate('/login')
      else if (session.role !== 'admin') navigate('/dashboard')
      else fetchQueue()
    }
  }, [session, sessionLoading])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/blog/admin/queue')
      if (data.success) setQueue(data.blogs)
    } catch (error) {
      message.error("Failed to fetch queue")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (blogId, status) => {
    let feedback = ''
    if (status === 'rejected') {
      feedback = window.prompt("Reason for rejection:")
      if (feedback === null) return
    }

    try {
      setLoading(true)
      const { data } = await API.patch(`/blog/${blogId}/status`, { status, feedback })
      if (data.success) {
        message.success(`Post ${status} successfully`)
        setQueue(prev => prev.filter(b => b._id !== blogId))
      }
    } catch (error) {
      message.error("Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await API.post('/auth/logout')
    setSession(null)
    navigate('/')
  }

  if (sessionLoading || !session) return null

  return (
    <div className="min-h-screen bg-[#fcfcfe] flex overflow-hidden font-sans">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <Suspense fallback={null}><AnimatedBackground /></Suspense>
        </Canvas>
      </div>

      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-20 h-[calc(100vh-32px)] m-4 bg-white border border-gray-100 rounded-[28px] flex flex-col shadow-sm transition-all duration-500"
      >
        <div className="p-5 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                <SafetyCertificateOutlined />
              </div>
              <span className="font-black text-gray-900 tracking-tight">ADMIN</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center border-none cursor-pointer text-gray-400">
            {isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </button>
        </div>

        <div className="flex-1 px-3 space-y-1">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer transition-all bg-transparent text-gray-500 hover:bg-gray-50">
            <DashboardOutlined className="text-lg" />
            {isSidebarOpen && <span className="font-bold text-sm">Personal Dashboard</span>}
          </button>
          <button onClick={() => setActiveTab('review')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer transition-all ${activeTab === 'review' ? 'bg-primary-50 text-primary-600' : 'bg-transparent text-gray-500'}`}>
            <FileTextOutlined className="text-lg" />
            {isSidebarOpen && <span className="font-bold text-sm">Review Queue</span>}
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer transition-all ${activeTab === 'users' ? 'bg-primary-50 text-primary-600' : 'bg-transparent text-gray-500'}`}>
            <TeamOutlined className="text-lg" />
            {isSidebarOpen && <span className="font-bold text-sm">Manage Users</span>}
          </button>
        </div>

        <div className="p-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer text-red-500 hover:bg-red-50 transition-all bg-transparent">
            <LogoutOutlined className="text-lg" />
            {isSidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-10 relative z-10 no-scrollbar">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Control Center</h2>
              <p className="text-sm text-gray-400 font-medium">Manage platform health and content quality</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-gray-100 rounded-2xl px-5 py-2.5 text-xs font-bold focus:outline-none focus:border-primary-500 w-64 shadow-sm"
                />
                <SearchOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
          </header>

          {activeTab === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">Pending Review ({queue.length})</h3>
                <button onClick={fetchQueue} className="text-xs font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl border-none cursor-pointer">Refresh Queue</button>
              </div>

              {loading ? (
                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing...</div>
              ) : queue.length > 0 ? (
                queue.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).map((post) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={post._id}
                    className="p-5 rounded-[32px] bg-white border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:border-primary-200 transition-all shadow-sm"
                  >
                    <div className="w-full md:w-32 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50">
                      <img src={`${API_BASE}${post.thumbnail}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{post.category}</span>
                        <span className="text-[10px] font-bold text-gray-400">by {post.author?.name}</span>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 truncate">{post.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.open(`/blog/${post._id}`, '_blank')} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all border-none cursor-pointer">
                        <EyeOutlined />
                      </button>
                      <button onClick={() => handleUpdateStatus(post._id, 'rejected')} className="h-10 px-5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer">
                        Reject
                      </button>
                      <button onClick={() => handleUpdateStatus(post._id, 'published')} className="h-10 px-5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-all border-none cursor-pointer shadow-lg shadow-primary-600/20">
                        Approve
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-100 text-center">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Queue Clear</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-[32px]">
               <UserOutlined className="text-4xl text-gray-200 mb-4" />
               <h3 className="text-lg font-black text-gray-900">User Management</h3>
               <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Comprehensive user controls are being synchronized. Check back shortly.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
