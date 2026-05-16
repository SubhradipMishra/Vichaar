import { useState, useRef, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRightOutlined,
  MailOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import Context from '../util/context'
import API from '../api/api'

export default function CTA() {
  const sectionRef = useRef(null)
  const { session, setSession } = useContext(Context)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubscribe = async () => {
    if (!session) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      const { data } = await API.post('/auth/newsletter/toggle')
      if (data.success) {
        setSession({ ...session, isSubscribed: data.isSubscribed })
        setMsg(data.message)
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (error) {
      console.error('Newsletter error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #f8f7ff 50%, #ede9fe 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6241fe, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="card-glass p-10 md:p-16 relative overflow-hidden border-2 border-white/50 backdrop-blur-2xl rounded-[48px] shadow-2xl">
            {/* Sketch arrow */}
            <svg className="absolute hidden md:block pointer-events-none opacity-50"
              style={{ top: '15%', right: '10%', width: 80 }} viewBox="0 0 70 50" fill="none">
              <path d="M65 5 Q40 25 10 35" stroke="#6241fe" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
              <path d="M5 30 L12 40 L18 32" stroke="#6241fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="inline-block p-4 rounded-[24px] bg-primary-50 text-primary-600 mb-8">
              <MailOutlined className="text-4xl" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              The <span className="gradient-text">Vichaar Weekly</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">
              Get a hand-picked, AI-curated blog post delivered to your inbox every other day. 
              Stay inspired, stay smart. <strong>It's free forever.</strong>
            </p>

            <div className="flex flex-col items-center gap-4">
              <motion.button
                onClick={handleSubscribe}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg shadow-2xl transition-all duration-300 ${
                  session?.isSubscribed 
                  ? 'bg-green-500 text-white shadow-green-200' 
                  : 'bg-primary-600 text-white shadow-primary-200'
                }`}
              >
                {loading ? <LoadingOutlined /> : (session?.isSubscribed ? <CheckCircleOutlined /> : <ArrowRightOutlined />)}
                {!session ? 'Login to Subscribe' : (session.isSubscribed ? 'Subscribed' : 'Subscribe Now')}
              </motion.button>
              
              {msg && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 font-bold text-sm"
                >
                  {msg}
                </motion.p>
              )}
            </div>

            <p className="mt-8 font-handwriting text-gray-400 text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
              No spam, just pure knowledge · Cancel anytime ♡
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

