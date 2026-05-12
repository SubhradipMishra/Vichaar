import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BlogPage from './pages/BlogPage'
import WritePage from './pages/WritePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BlogDetail from './pages/BlogDetail'
import Context from './util/context'
import API from './api/api'

function App() {
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  const getSession = async () => {
    try {
      setSessionLoading(true)
      const { data } = await API.get('/auth/getSession')
      if (data.success) {
        setSession(data.user)
      } else {
        setSession(null)
      }
    } catch (error) {
      setSession(null)
    } finally {
      setSessionLoading(false)
    }
  }

  useEffect(() => {
    getSession()
  }, [])

  return (
    <Context.Provider value={{ session, setSession, sessionLoading, setSessionLoading }}>
      <Router>
        <Routes>
          {/* Landing — has shared Navbar + Footer */}
          <Route path="/" element={<LandingPage />} />

          {/* Standalone pages — NO shared Navbar or Footer */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/blog/:blogId" element={<BlogDetail />} />
        </Routes>
      </Router>
    </Context.Provider>
  )
}

export default App
